// ============================================
// Authentication Module
// ============================================

// Check if user is logged in
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const sessionId = sessionStorage.getItem('sessionId');

    if (!currentUser || !sessionId) {
        // User not logged in, redirect to login page
        if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return false;
    }

    return true;
}

// Handle login form submission
if (document.getElementById('loginForm')) {
    // Initialize Supabase
    document.addEventListener('DOMContentLoaded', async () => {
        // Load Supabase library
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            supabaseClient.init();
        };
        document.head.appendChild(script);
    });

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        // Check credentials
        const user = window.ADMIN_USERS.find(u => u.username === username && u.password === password);

        if (user) {
            try {
                // Log the login
                const session = await DB.logLogin(username);

                // Store session
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('sessionId', session?.id || Date.now());
                sessionStorage.setItem('userRole', user.role);
                sessionStorage.setItem('loginTime', new Date().toISOString());

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Login successful but session logging failed. Proceeding...';
                errorDiv.style.display = 'block';

                // Still allow login even if logging fails
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('sessionId', Date.now().toString());
                sessionStorage.setItem('userRole', user.role);
                sessionStorage.setItem('loginTime', new Date().toISOString());

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } else {
            errorDiv.textContent = 'Invalid username or password!';
            errorDiv.style.display = 'block';
        }
    });
}

// Handle logout
async function handleLogout() {
    const confirmed = confirm('Are you sure you want to logout?');

    if (confirmed) {
        const sessionId = sessionStorage.getItem('sessionId');

        try {
            // Log the logout
            if (sessionId) {
                await DB.logLogout(sessionId);
            }
        } catch (error) {
            console.error('Logout logging error:', error);
        }

        // Clear session
        sessionStorage.clear();

        // Redirect to login
        window.location.href = 'index.html';
    }
}

// Initialize authentication check on protected pages
if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuth();

        // Load Supabase library if not loaded
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                supabaseClient.init();
            };
            document.head.appendChild(script);
        }
    });
}

// Prevent back navigation after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        checkAuth();
    }
});
