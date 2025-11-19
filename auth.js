
/**
 * ============================================================================
 * AUTHENTICATION MODULE — A DRAMA IN ONE ACT
 * ============================================================================
 * Responsible for politely convincing the browser that a person is who they
 * claim to be. Includes a few demo accounts for quick testing and general
 * merriment. Session postcards live in localStorage.
 * ============================================================================
 */

/**
 * Demo user accounts for testing (hardcoded for development)
 * In production, these should be removed and all users stored server-side
 */
const DEMO_USERS = {
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

// LocalStorage keys for session management
const LOGIN_KEY = 'userSession';     // Stores current logged-in user data
const REMEMBER_KEY = 'rememberUser'; // Stores username for "remember me" feature

/**
 * Initialize authentication on page load
 * - Redirect unauthenticated users away from protected pages
 * - Redirect authenticated users away from login page
 * - Set up login form if on login page
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('login.html') || currentPage === '/';
    const isAuthPage = currentPage.includes('index.html');
    
    const userSession = localStorage.getItem(LOGIN_KEY);
    
    // If on a protected page (like dashboard) but not logged in, redirect to login
    if (isAuthPage && !userSession) {
        window.location.href = 'login.html';
        return;
    }
    
    // If logged in and on login page, redirect to dashboard
    if (isLoginPage && userSession) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set up login form handlers if on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        setupLoginForm();
    }
    
    // Set up logout button if present
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

/**
 * Set up the login form with event listeners and remembered user functionality
 * Tries registered users first, then falls back to demo users
 */
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const rememberMe = document.getElementById('rememberMe');
    
    // Check if user had previously clicked "remember me"
    const rememberedUser = localStorage.getItem(REMEMBER_KEY);
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        rememberMe.checked = true;
    }
    
    // Handle form submission (login attempt)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate inputs are not empty
        if (!username || !password) {
            showError('Nama pengguna dan kata sandi harus diisi — tolong isi dulu, ya.');
            return;
        }

        // STEP 1: Try to authenticate with registered users (from register.js)
        try {
            const user = await authenticateUser(username, password);
            if (user) {
                // Create session data with user info
                const sessionData = {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    email: user.email,
                    loginTime: new Date().toISOString()
                };
                
                // Store session in localStorage
                localStorage.setItem(LOGIN_KEY, JSON.stringify(sessionData));
                
                // Handle "remember me" checkbox
                if (rememberMe.checked) {
                    localStorage.setItem(REMEMBER_KEY, username);
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }
                
                // Show success message and redirect
                showSuccess('Selamat datang — login berhasil! Mengalihkan...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
                return;
            }
        } catch (err) {
            console.error('Registration auth error:', err);
        }

        // STEP 2: Fallback to demo users (for backward compatibility during development)
        if (DEMO_USERS[username] && DEMO_USERS[username].password === password) {
            const user = DEMO_USERS[username];
            const sessionData = {
                username: username,
                fullName: user.fullName,
                role: user.role,
                email: user.email,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem(LOGIN_KEY, JSON.stringify(sessionData));
            
            if (rememberMe.checked) {
                localStorage.setItem(REMEMBER_KEY, username);
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }
            
            showSuccess('Selamat datang — login berhasil! Mengalihkan...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            // Neither registered user nor demo user matched
            showError('Nama pengguna atau kata sandi salah — coba lagi atau daftar dulu.');
            document.getElementById('password').value = ''; // Clear password field
        }
    });
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = '⚠️ ' + message;
        errorDiv.classList.remove('hidden');
        // Auto-hide after a moment of drama
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 6000);
    }
}

/**
 * Display success message to user
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = '✅ ' + message;
        errorDiv.classList.remove('hidden', 'bg-red-500/20', 'border-red-500/50', 'text-red-200');
        errorDiv.classList.add('bg-green-500/20', 'border-green-500/50', 'text-green-200');
    }
}

/**
 * Log out the current user
 * Clears session data and redirects to login page
 */
function logout() {
    if (confirm('Keluar sekarang? (Tenang, jurnal tetap aman)')) {
        localStorage.removeItem(LOGIN_KEY);      // Clear session
        localStorage.removeItem(REMEMBER_KEY);   // Clear remembered username
        window.location.href = 'login.html';     // Redirect to login
    }
}

// Make logout function available globally for HTML onclick handlers
window.logout = logout;
