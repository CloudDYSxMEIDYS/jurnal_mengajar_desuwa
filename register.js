/**
 * ============================================================================
 * THE GLORIOUS REGISTRATION & AUTHENTICATION WIZARDRY
 * ============================================================================
 * This script politely asks humans (and sometimes opinionated laptops) to
 * create accounts. Passwords get a SHA-256 costume for demo shows — for
 * real-world security use bcrypt on a proper server and give it a cape.
 * ============================================================================
 */

/**
 * Convert a plain text password into a SHA-256 hash
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hexadecimal SHA-256 hash of the password
 */
async function hashPassword(password) {
  // Step 1: Convert password string to bytes using TextEncoder
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Step 2: Hash the bytes using the SHA-256 algorithm
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Step 3: Convert hash buffer to hexadecimal string for storage
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a plain text password against its stored hash
 * Used during login to confirm password is correct
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The stored hash to compare against
 * @returns {Promise<boolean>} - True if password matches hash, false otherwise
 */
async function verifyPassword(password, hash) {
  // Hash the provided password and compare it with the stored hash
  const newHash = await hashPassword(password);
  return newHash === hash;
}

/**
 * ============================================================================
 * VALIDATION FUNCTIONS - Enhanced Security Checks for Teacher & Student Data
 * ============================================================================
 */

/**
 * Validate teacher authentication code
 * Auth code must be non-empty and at least 4 characters
 * @param {string} authCode - The authentication code to validate
 * @returns {boolean} - True if auth code is valid
 */
function validateTeacherAuthCode(authCode) {
  return authCode && authCode.trim().length >= 4; // At least 4 characters
}

/**
 * Validate email address format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email format looks valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if password meets all strength requirements
 * A strong password must have ALL of the following:
 *   - At least one uppercase letter (A-Z)
 *   - At least one lowercase letter (a-z)
 *   - At least one digit (0-9)
 *   - At least one special character (!@#$%^&* etc)
 * @param {string} password - The password to check
 * @returns {Object} Object with:
 *   - isStrong: boolean indicating if ALL requirements are met
 *   - requirements: object showing which individual requirements are met
 */
function validateStrongPassword(password) {
  const hasUppercase = /[A-Z]/.test(password);      // Check for uppercase letter
  const hasLowercase = /[a-z]/.test(password);      // Check for lowercase letter
  const hasNumber = /\d/.test(password);             // Check for digit
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/.test(password); // Check for special char
  
  return {
    isStrong: hasUppercase && hasLowercase && hasNumber && hasSpecial,
    requirements: {
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial
    }
  };
}

/**
 * Validate username format
 * Requirements:
 *   - 3-20 characters long
 *   - Must start with a letter (a-z or A-Z)
 *   - Can only contain letters, numbers, and underscores
 * @param {string} username - The username to validate
 * @returns {boolean} - True if username format is valid
 */
function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

// Valid teacher subjects (can be expanded as curriculum changes)
// Follows Indonesian national curriculum standards (Kurikulum Merdeka)
const VALID_SUBJECTS = [
  'Informatika', 'Matematika', 'Fisika', 'Kimia', 'Biologi',
  'Bahasa Indonesia', 'Bahasa Inggris', 'Sejarah', 'Geografi',
  'Seni Budaya', 'Pendidikan Jasmani', 'Agama Islam', 'Agama Kristen',
  'Agama Hindu', 'Agama Buddha', 'Pendidikan Kewarganegaraan', 'Ekonomi'
];

/**
 * Validate if the selected subject is in the approved list
 * Prevents typos and ensures consistency across the system
 * @param {string} subject - The subject name to validate
 * @returns {boolean} - True if subject exists in VALID_SUBJECTS array
 */
function validateTeacherSubject(subject) {
  return VALID_SUBJECTS.includes(subject);
}

// User registration and storage
const REGISTERED_USERS_KEY = 'registeredUsers';
// Auth codes storage (created/managed by admin)
const AUTH_CODES_KEY = 'authCodes';

// Grab the list of auth codes from browser storage
function getAuthCodes() {
  const raw = localStorage.getItem(AUTH_CODES_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Save auth codes back to browser storage (so they survive page refreshes)
function saveAuthCodes(codes) {
  localStorage.setItem(AUTH_CODES_KEY, JSON.stringify(codes));
}

// Admin creates a brand new auth code for a teacher to use
function createAuthCode(code, createdBy = 'admin') {
  const codes = getAuthCodes();
  // Prevent duplicate codes — each code should be unique and precious
  if (codes.find(c => c.code === code)) {
    throw new Error('Kode autentikasi sudah ada');
  }
  // Create a new code entry with metadata
  const entry = {
    code: code.trim(),
    used: false,                                   // Not claimed yet
    createdBy,                                     // Who created it
    createdAt: new Date().toISOString(),           // When it was born
    usedBy: null,                                  // Will be filled when a teacher registers
    usedAt: null                                   // Will be filled when claimed
  };
  codes.push(entry);
  saveAuthCodes(codes);
  return entry;
}

// When a teacher successfully registers with a code, mark it as used so no one else can use it
function markAuthCodeUsed(code, userId) {
  const codes = getAuthCodes();
  const entry = codes.find(c => c.code === code);
  if (!entry) throw new Error('Kode autentikasi tidak ditemukan');
  entry.used = true;                              // Code is now claimed
  entry.usedBy = userId;                          // Record who used it
  entry.usedAt = new Date().toISOString();        // Record when they used it
  saveAuthCodes(codes);
  return entry;
}

// Check if an auth code exists and hasn't been used yet — basically, is it good to go?
function isAuthCodeValid(code) {
  const codes = getAuthCodes();
  const entry = codes.find(c => c.code === code);
  return !!entry && !entry.used;                  // True if code exists AND hasn't been claimed
}


async function registerUser(userData) {
  // Validate input
  if (!userData.username || !userData.password || !userData.fullName || !userData.role) {
    throw new Error('Semua bidang harus diisi — jangan biarkan kolom kosong seperti hati tanpa kopi.');
  }

  // Validate username format
  if (!validateUsername(userData.username)) {
    throw new Error('Username harus 3-20 karakter, mulai huruf; boleh angka & underscore — pilih yang unik dan mudah diingat.');
  }

  // Validate password strength
  const passwordCheck = validateStrongPassword(userData.password);
  if (!passwordCheck.isStrong) {
    const missing = [];
    if (!passwordCheck.requirements.uppercase) missing.push('huruf BESAR');
    if (!passwordCheck.requirements.lowercase) missing.push('huruf kecil');
    if (!passwordCheck.requirements.number) missing.push('angka');
    if (!passwordCheck.requirements.special) missing.push('simbol rahasia (!@#$%...)');
    throw new Error(`Password lemah — tambahkan: ${missing.join(', ')}. (Jangan pakai 'password123' ya.)`);
  }

  // Check if username already exists
  const users = getRegisteredUsers();
  if (users.find(u => u.username === userData.username)) {
    throw new Error('Nama pengguna sudah terdaftar — coba variasi lain.');
  }

  // Teacher-specific validations
  if (userData.role === 'teacher') {
    // Validate authentication code (must be at least 4 characters)
    if (!userData.authCode || !validateTeacherAuthCode(userData.authCode)) {
      throw new Error('Kode autentikasi bermasalah — minimal 4 karakter. Cek kembali kode dari admin.');
    }

    // Check if auth code exists and is unused in the admin list
    if (!isAuthCodeValid(userData.authCode)) {
      throw new Error('Kode autentikasi tidak valid atau sudah dipakai. Minta kode baru ke admin.');
    }

    // Validate email format
    if (!userData.email || !validateEmail(userData.email)) {
      throw new Error('Format email tidak valid — contoh yang benar: nama@sekolah.id');
    }

    // Validate subject is from allowed list
    if (!userData.mapelMengajar || !validateTeacherSubject(userData.mapelMengajar)) {
      throw new Error(`Mata pelajaran tidak valid. Pilih dari daftar resmi: ${VALID_SUBJECTS.join(', ')}.`);
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user object
  const newUser = {
    id: Date.now(),
    username: userData.username,
    passwordHash: hashedPassword,
    fullName: userData.fullName,
    email: userData.email || '',
    role: userData.role,                          // 'student' or 'teacher'
    nisn: userData.nisn || '',                    // for students
    authCode: userData.authCode || '',            // for teachers (authentication code)
    mapelMengajar: userData.mapelMengajar || '',  // for teachers
    kelasMengajar: userData.kelasMengajar || '',  // for teachers (optional)
    createdAt: new Date().toISOString()
  };

  // Save user
  users.push(newUser);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  // If teacher, mark the auth code as used and attach usedBy metadata
  if (userData.role === 'teacher' && userData.authCode) {
    try {
      markAuthCodeUsed(userData.authCode, newUser.id);
    } catch (err) {
      // Non-fatal: log and continue; admins can fix the list manually if needed
      console.warn('Ups — gagal menandai kode sebagai terpakai. Admin mungkin perlu memperbarui daftar.', err);
    }
  }

  return newUser.id;
}

// Fetch the list of people who registered through the app
function getRegisteredUsers() {
  const users = localStorage.getItem(REGISTERED_USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Try to log in a user: hash their password and compare it with the stored hash
async function authenticateUser(username, password) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.username === username);

  if (!user) return null;

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) return null;

  // Return user without password hash
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    nisn: user.nisn,
    authCode: user.authCode,
    mapelMengajar: user.mapelMengajar,
    kelasMengajar: user.kelasMengajar
  };
}

// Look up a user by their ID and return their info (minus the password hash for safety)
function getUserById(userId) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Merge registered users with demo users
// Combine registered users with demo accounts (demo accounts are for quick testing during development)
function getAllAvailableUsers() {
  const registeredUsers = getRegisteredUsers();
  const demoUsers = {
    'admin': {
      password: 'admin123',
      role: 'admin',
      fullName: 'Administrator',
      email: 'admin@sekolah.com'
    },
    'riyan': {
      password: 'guru123',
      role: 'teacher',
      fullName: 'Riyan Setiawan, S.Kom.',
      email: 'riyan@sekolah.com'
    },
    'siti': {
      password: 'guru456',
      role: 'teacher',
      fullName: 'Siti Nurhaliza',
      email: 'siti@sekolah.com'
    }
  };

  return { registeredUsers, demoUsers };
}

// Expose globally
window.registerUser = registerUser;
window.authenticateUser = authenticateUser;
window.getRegisteredUsers = getRegisteredUsers;
window.getUserById = getUserById;
window.hashPassword = hashPassword;
window.getAuthCodes = getAuthCodes;
window.createAuthCode = createAuthCode;
window.markAuthCodeUsed = markAuthCodeUsed;
window.isAuthCodeValid = isAuthCodeValid;
