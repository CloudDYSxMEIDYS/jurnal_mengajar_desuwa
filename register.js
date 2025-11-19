/**
 * ============================================================================
 * USER REGISTRATION & AUTHENTICATION MODULE
 * ============================================================================
 * Handles secure user registration, password hashing, and authentication.
 * Uses SHA-256 for demo/development (client-side).
 * ⚠️  For PRODUCTION: Use bcrypt on server-side instead!
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
 * Validate teacher NIP (Nomor Induk Pegawai - Indonesian Teacher ID)
 * Must be exactly 18 digits to match government ID standards
 * @param {string} nip - The NIP to validate
 * @returns {boolean} - True if NIP is valid (exactly 18 digits)
 */
function validateTeacherNIP(nip) {
  const nipRegex = /^\d{18}$/; // Must be exactly 18 digits, nothing else
  return nipRegex.test(nip);
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

async function registerUser(userData) {
  // Validate input
  if (!userData.username || !userData.password || !userData.fullName || !userData.role) {
    throw new Error('All fields are required');
  }

  // Validate username format
  if (!validateUsername(userData.username)) {
    throw new Error('Username harus 3-20 karakter, dimulai dengan huruf, hanya alfanumerik & underscore');
  }

  // Validate password strength
  const passwordCheck = validateStrongPassword(userData.password);
  if (!passwordCheck.isStrong) {
    const missing = [];
    if (!passwordCheck.requirements.uppercase) missing.push('huruf besar');
    if (!passwordCheck.requirements.lowercase) missing.push('huruf kecil');
    if (!passwordCheck.requirements.number) missing.push('angka');
    if (!passwordCheck.requirements.special) missing.push('karakter khusus (!@#$%^&* dll)');
    throw new Error(`Password harus mengandung: ${missing.join(', ')}`);
  }

  // Check if username already exists
  const users = getRegisteredUsers();
  if (users.find(u => u.username === userData.username)) {
    throw new Error('Username sudah terdaftar');
  }

  // Teacher-specific validations
  if (userData.role === 'teacher') {
    // Validate NIP format (must be 18 digits)
    if (!userData.nip || !validateTeacherNIP(userData.nip)) {
      throw new Error('NIP harus 18 digit angka');
    }

    // Check if NIP already registered
    if (users.find(u => u.nip === userData.nip)) {
      throw new Error('NIP sudah terdaftar');
    }

    // Validate email format
    if (!userData.email || !validateEmail(userData.email)) {
      throw new Error('Format email tidak valid');
    }

    // Validate subject is from allowed list
    if (!userData.mapelMengajar || !validateTeacherSubject(userData.mapelMengajar)) {
      throw new Error(`Mata pelajaran tidak valid. Pilih dari: ${VALID_SUBJECTS.join(', ')}`);
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
    role: userData.role, // 'student' or 'teacher'
    nisn: userData.nisn || '', // for students
    nip: userData.nip || '', // for teachers
    mapelMengajar: userData.mapelMengajar || '', // for teachers
    kelasMengajar: userData.kelasMengajar || '', // for teachers
    createdAt: new Date().toISOString()
  };

  // Save user
  users.push(newUser);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  return newUser.id;
}

function getRegisteredUsers() {
  const users = localStorage.getItem(REGISTERED_USERS_KEY);
  return users ? JSON.parse(users) : [];
}

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
    nip: user.nip,
    mapelMengajar: user.mapelMengajar,
    kelasMengajar: user.kelasMengajar
  };
}

function getUserById(userId) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Merge registered users with demo users
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
