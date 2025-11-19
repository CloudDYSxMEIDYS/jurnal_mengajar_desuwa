
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

const LOGIN_KEY = 'userSession';
const REMEMBER_KEY = 'rememberUser';


document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('login.html') || currentPage === '/';
    const isAuthPage = currentPage.includes('index.html');
    
    const userSession = localStorage.getItem(LOGIN_KEY);
    
    
    if (isAuthPage && !userSession) {
        window.location.href = 'login.html';
        return;
    }
    
    
    if (isLoginPage && userSession) {
        window.location.href = 'index.html';
        return;
    }
    
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        setupLoginForm();
    }
    
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const rememberMe = document.getElementById('rememberMe');
    
    
    const rememberedUser = localStorage.getItem(REMEMBER_KEY);
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        rememberMe.checked = true;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Nama pengguna dan kata sandi harus diisi');
            return;
        }

        // Try registered users first
        try {
            const user = await authenticateUser(username, password);
            if (user) {
                const sessionData = {
                    id: user.id,
                    username: user.username,
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
                
                showSuccess('Login berhasil! Mengalihkan...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
                return;
            }
        } catch (err) {
            console.error('Registration auth error:', err);
        }

        // Fallback to demo users (for backward compatibility)
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
            
            showSuccess('Login berhasil! Mengalihkan...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            showError('Nama pengguna atau kata sandi salah');
            document.getElementById('password').value = '';
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden', 'bg-red-500/20', 'border-red-500/50', 'text-red-200');
        errorDiv.classList.add('bg-green-500/20', 'border-green-500/50', 'text-green-200');
    }
}

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem(LOGIN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        window.location.href = 'login.html';
    }
}


window.logout = logout;
