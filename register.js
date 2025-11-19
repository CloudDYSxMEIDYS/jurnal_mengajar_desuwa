// Simple password hashing using SHA-256 (browser-safe, for demo purposes)
// For production, use bcrypt on server-side

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// Validation utilities for enhanced teacher security
function validateTeacherNIP(nip) {
  // NIP must be 18 digits
  const nipRegex = /^\d{18}$/;
  return nipRegex.test(nip);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateStrongPassword(password) {
  // Password must have: uppercase, lowercase, number, and special char
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
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

function validateUsername(username) {
  // Username: 3-20 chars, alphanumeric + underscore, start with letter
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

// Valid teacher subjects (can be expanded)
const VALID_SUBJECTS = [
  'Informatika', 'Matematika', 'Fisika', 'Kimia', 'Biologi',
  'Bahasa Indonesia', 'Bahasa Inggris', 'Sejarah', 'Geografi',
  'Seni Budaya', 'Pendidikan Jasmani', 'Agama Islam', 'Agama Kristen',
  'Agama Hindu', 'Agama Buddha', 'Pendidikan Kewarganegaraan', 'Ekonomi'
];

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
