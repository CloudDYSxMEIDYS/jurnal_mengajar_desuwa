# Sistem Jurnal Mengajar Informatika

This project is a small single-page application for keeping teaching journal entries.

What I changed:
- Extracted inline CSS into `styles.css` (Google font and small helpers)
- Extracted inline JavaScript into `app.js` (keeps code organized)
- Kept Tailwind CDN for layout utilities
- Created `TEXT_CLEANED.md` with cleaned labels and copy text

How to run:
1. Open `index.html` in your browser (double-click or via a local server)

Optional: run a quick local server with Python:

```
# Windows CMD
python -m http.server 8000
# then visit http://localhost:8000
```

---

## User Registration & Security

This project now includes a **secure registration system** for both students and teachers with enhanced teacher validation.

### Enhanced Teacher Registration Security:

**Teacher-Specific Validations:**
- **Authentication Code Validation**: Must be at least 4 characters (school-provided auth code)
- **Auth Code Uniqueness**: Each teacher must use a unique authentication code
- **Email Validation**: Must be a valid email format (required field)
- **Subject Validation**: Must choose from a predefined list of valid subjects:
  - Informatika, Matematika, Fisika, Kimia, Biologi
  - Bahasa Indonesia, Bahasa Inggris, Sejarah, Geografi
  - Seni Budaya, Pendidikan Jasmani, Agama Islam, Agama Kristen
  - Agama Hindu, Agama Buddha, Pendidikan Kewarganegaraan, Ekonomi
- **Strong Password Required**: Must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&* etc)
- **Username Validation**: 3-20 characters, must start with a letter, alphanumeric + underscore only
- **Duplicate Prevention**: Auth code uniqueness enforced (cannot register same teacher twice)

**Registration Features:**
- **Separate Registration Pages**: Students and teachers register through different forms
- **Password Hashing**: Uses SHA-256 hashing (browser-side) for password security
- **Real-time Password Strength Indicator**: Shows which requirements are met as user types
- **Input Validation with Clear Error Messages**: Tells user exactly what's wrong
  
### How to Register:
1. Click "Daftar di sini" on the login page or go to `register.html`
2. Choose "Daftar Siswa" or "Daftar Guru"
3. Fill in required fields:
   - **Students**: Name, Email, Class, Username, Password
   - **Teachers**: Name, Auth Code (dari sekolah), Email, Subject (dropdown), Username, Password
4. For teachers: Watch password strength indicator turn green as you meet requirements
5. Confirm password and submit
6. Redirect to login page

### Registered Users Storage:
- Registered users are stored in browser's `localStorage` with key `registeredUsers`
- Passwords are hashed with SHA-256 before storage
- Demo users (admin, riyan, siti) still work for testing

### Security Notes:
- **For Development/Demo**: SHA-256 hashing is done client-side for convenience
- **For Production**: 
  - Implement server-side authentication (Node.js, PHP, etc.)
  - Use bcrypt for password hashing (much more secure than SHA-256)
  - Use HTTPS to encrypt data in transit
  - Implement session tokens or JWT
  - Never store passwords in plain text
  - Add rate limiting for login attempts (prevent brute force)
  - Implement CAPTCHA for registration (prevent automation)
  - Add email verification step
  - Implement password reset functionality
  - Log security events (failed logins, registrations, etc.)

### API Functions (from register.js):
```javascript
// Register a new user (validates all teacher requirements)
await registerUser({
  username: 'john_doe',           // 3-20 chars, must start with letter
  password: 'SecurePass123!',      // Must have upper, lower, number, special
  fullName: 'John Doe',
  email: 'john@school.com',
  role: 'student',                 // or 'teacher'
  nisn: '1234567890',              // for students
  authCode: 'GURU2025ABC',         // for teachers (school-provided auth code)
  mapelMengajar: 'Informatika'     // for teachers (must be from valid list)
});

// Authenticate user
const user = await authenticateUser('john_doe', 'SecurePass123!');

// Validate teacher auth code format
const isValid = validateTeacherAuthCode('GURU2025ABC'); // true if 4+ characters

// Validate email format
const isValid = validateEmail('john@school.com'); // true if valid email

// Check password strength
const check = validateStrongPassword('SecurePass123!');
// Returns: { isStrong: true, requirements: { uppercase: true, lowercase: true, number: true, special: true } }

// Validate subject against allowed list
const isValid = validateTeacherSubject('Informatika'); // true if in VALID_SUBJECTS

// Get registered users list
const users = getRegisteredUsers();

// Get user by ID
const user = getUserById(userId);
```

---

## Firebase Integration (optional)

This project includes a simple Firebase helper to optionally persist journals to Firestore.

Files added:
- `firebase-config.sample.js` — sample config. Copy to `firebase-config.js` and fill with your Firebase project's values.
- `firebase-config.js` — placeholder file you should update with real keys (do NOT commit keys to public repos).
- `firebase.js` — helper module exposing `initFirebase`, `saveJournalToFirestore`, `loadJournalsFromFirestore`, and `subscribeToJournals` for realtime sync.

Quick setup:
1. Create a Firebase project at https://console.firebase.google.com/
2. Add a Web app and copy the config. Paste into `firebase-config.js` or copy the sample file.
3. Enable Firestore in the console (start in test mode for quick testing).
4. Optionally, in `app.js` call the functions from `firebase.js` to save/load or subscribe to journals.

Example usage in browser (module):

```html
<script type="module">
  import { initFirebase, saveJournalToFirestore, subscribeToJournals } from './firebase.js';
  initFirebase();

  // save an example
  await saveJournalToFirestore({ hari: 'Senin', tanggal: '2025-11-17', jamKe: '1', kelas: '9A', siswaHadir: 30, siswaTidakHadir: 0, uraianMateri: 'Contoh' });

  // realtime subscription
  subscribeToJournals((data) => {
    console.log('Realtime journals:', data);
  });
</script>
```

Security note:
- For production, do not keep API keys in a public repository.
- Harden Firestore rules to allow authenticated access only.

