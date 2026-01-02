// ===== INITIALIZE DB FIRST =====
if (!window.DB) {
  console.warn("⏳ Waiting for DB to initialize...");
  setTimeout(() => location.reload(), 2000);
}
// ============================================
// Admin Profile Module
// ============================================

let loginHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadAdminData, 500);
});

// Load admin data
async function loadAdminData() {
    try {
        loginHistory = await DB.getLoginHistory();

        updateAdminStats();
        renderLoginHistory();
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Update admin stats
function updateAdminStats() {
    // Sort each admin's logins by login_time DESC so [0] is always latest
    const admin1Logins = loginHistory
        .filter(h => h.username === 'admin1')
        .sort((a, b) => new Date(b.login_time) - new Date(a.login_time));

    const admin2Logins = loginHistory
        .filter(h => h.username === 'admin2')
        .sort((a, b) => new Date(b.login_time) - new Date(a.login_time));

    document.getElementById('admin1Logins').textContent = admin1Logins.length;
    document.getElementById('admin2Logins').textContent = admin2Logins.length;

    if (admin1Logins.length > 0) {
        const lastLogin = new Date(admin1Logins[0].login_time);
        document.getElementById('admin1LastLogin').textContent = lastLogin.toLocaleString();
    }

    if (admin2Logins.length > 0) {
        const lastLogin = new Date(admin2Logins[0].login_time);
        document.getElementById('admin2LastLogin').textContent = lastLogin.toLocaleString();
    }
}

// Render login history
function renderLoginHistory() {
    const tbody = document.getElementById('loginHistoryTable');

    if (loginHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No login history available</td></tr>';
        return;
    }

    let html = '';
    loginHistory.forEach((login, index) => {
        const loginTime = new Date(login.login_time);
        const logoutTime = login.logout_time ? new Date(login.logout_time) : null;

        let duration = 'Active';
        if (logoutTime) {
            const durationMs = logoutTime - loginTime;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${hours}h ${minutes}m`;
        }

        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${login.username}</strong></td>
                <td>${loginTime.toLocaleString()}</td>
                <td>${logoutTime ? logoutTime.toLocaleString() : '<span style="color: var(--success-color);">Active</span>'}</td>
                <td>${duration}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Auto-refresh every 30 seconds
setInterval(loadAdminData, 30000);
