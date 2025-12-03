// ============================================
// Dashboard Module
// ============================================

let allGuests = [];

// Calculate days left until payment due
function calculateDaysLeft(upcomingDueDate) {
    if (!upcomingDueDate) return 'N/A';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(upcomingDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        return `<span style="color:var(--danger-color);">${Math.abs(diffDays)} days overdue</span>`;
    } else if (diffDays === 0) {
        return `<span style="color:var(--warning-color);">Due today</span>`;
    } else {
        return `${diffDays} days`;
    }
}

// Update payment status based on due date (and persist to DB)
async function updatePaymentStatusAndPersist(guest) {
    if (!guest.upcomingPaymentDueDate) return guest;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(guest.upcomingPaymentDueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today && guest.monthlyPaymentStatus !== 'Paid' && guest.monthlyPaymentStatus !== 'Breached') {
        guest.monthlyPaymentStatus = 'Breached';
        try {
            if (DB.updateGuestStatus) {
                await DB.updateGuestStatus(guest.id, 'Breached');
            }
        } catch (err) {
            console.error('Error updating status to Breached on dashboard for', guest.id, err);
        }
    }

    return guest;
}

// Load dashboard data and render all widgets
async function loadDashboard() {
    try {
        allGuests = await DB.getGuests();

        // Ensure overdue statuses are set to Breached and persisted
        for (let i = 0; i < allGuests.length; i++) {
            allGuests[i] = await updatePaymentStatusAndPersist(allGuests[i]);
        }

        // Filter active guests (not vacated)
        const activeGuests = allGuests.filter(g => g.roomVacate !== 'Yes');

        // Top stats cards
        const totalGuests = activeGuests.length;
        const paidGuests = activeGuests.filter(g => g.monthlyPaymentStatus === 'Paid').length;
        const pendingGuests = activeGuests.filter(
            g => g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid'
        ).length;
        const breachedGuests = activeGuests.filter(g => g.monthlyPaymentStatus === 'Breached').length;

        document.getElementById('totalGuests').textContent = totalGuests;
        document.getElementById('totalPaid').textContent = paidGuests;
        document.getElementById('totalPending').textContent = pendingGuests;
        document.getElementById('totalBreached').textContent = breachedGuests;

        // Building 1 stats
        const b1Guests = activeGuests.filter(g => g.building === 'Building-1');
        document.getElementById('b1Total').textContent = b1Guests.length;
        document.getElementById('b1Paid').textContent = b1Guests.filter(g => g.monthlyPaymentStatus === 'Paid').length;
        document.getElementById('b1Pending').textContent = b1Guests.filter(
            g => g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid'
        ).length;
        document.getElementById('b1Breached').textContent = b1Guests.filter(
            g => g.monthlyPaymentStatus === 'Breached'
        ).length;

        // Building 2 stats
        const b2Guests = activeGuests.filter(g => g.building === 'Building-2');
        document.getElementById('b2Total').textContent = b2Guests.length;
        document.getElementById('b2Paid').textContent = b2Guests.filter(g => g.monthlyPaymentStatus === 'Paid').length;
        document.getElementById('b2Pending').textContent = b2Guests.filter(
            g => g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid'
        ).length;
        document.getElementById('b2Breached').textContent = b2Guests.filter(
            g => g.monthlyPaymentStatus === 'Breached'
        ).length;

        // Load recent payment activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('recentActivity').innerHTML =
            '<p class="text-center text-danger">Error loading data</p>';
    }
}

// Load and display recent payment activity
function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');

    const sortedGuests = [...allGuests]
        .filter(g => g.roomVacate !== 'Yes' && g.upcomingPaymentDueDate)
        .sort((a, b) => new Date(a.upcomingPaymentDueDate) - new Date(b.upcomingPaymentDueDate))
        .slice(0, 10);

    if (sortedGuests.length === 0) {
        activityDiv.innerHTML = '<p class="text-center text-muted">No upcoming payments</p>';
        return;
    }

    let html = '';
    sortedGuests.forEach(guest => {
        const daysLeft = calculateDaysLeft(guest.upcomingPaymentDueDate);
        const statusClass =
            guest.monthlyPaymentStatus === 'Breached'
                ? 'danger'
                : guest.monthlyPaymentStatus === 'Pending' || guest.monthlyPaymentStatus === 'Partial Paid'
                ? 'warning'
                : 'success';

        html += `
            <div class="activity-item" style="margin-bottom:13px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${guest.name}</strong> - Room ${guest.roomNo} (${guest.building})
                        <br>
                        <small style="color: var(--text-secondary);">
                            Due Date: ${new Date(guest.upcomingPaymentDueDate).toLocaleDateString()}
                        </small>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge status-${statusClass}">
                            ${guest.monthlyPaymentStatus}
                        </span>
                        <br>
                        <small style="color: var(--text-secondary);">${daysLeft}</small>
                    </div>
                </div>
            </div>
        `;
    });

    activityDiv.innerHTML = html;
}

// Initialize dashboard after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadDashboard, 500); // Wait for Supabase initialization
});

// Auto-refresh every 30 seconds for live/stats
setInterval(loadDashboard, 30000);
