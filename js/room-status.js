// ============================================
// Room Status Module - Sharing-wise Grid Display with Individual Bed Slots
// ============================================

let allGuests = [];

// Reuse same building -> rooms mapping as guest-form.js
const ROOM_MAP = {
    'Building-1': [
        'G01',
        '101', '102', '103',
        '201', '202', '203',
        '301', '302', '303',
        '401'
    ],
    'Building-2': [
        'G02',
        '104', '105', '106',
        '204', '205', '206',
        '304', '305', '306',
        '402'
    ]
};

// Capacity per sharing type (sharingType is stored as INTEGER: 1, 2, 3)
const SHARING_CAPACITY = {
    1: 1, // 1 Sharing
    2: 2, // 2 Sharing
    3: 3  // 3 Sharing
};

// Sharing type display labels
const SHARING_LABELS = {
    1: '1 Sharing',
    2: '2 Sharing',
    3: '3 Sharing'
};

// Load room status for all buildings/grids
async function loadRoomStatus() {
    try {
        allGuests = await DB.getGuests();

        // Only consider guests not vacated
        const activeGuests = allGuests.filter(g => g.roomVacate !== 'Yes');

        renderBuilding('Building-1', 'building1Rooms', activeGuests);
        renderBuilding('Building-2', 'building2Rooms', activeGuests);
    } catch (error) {
        console.error('Error loading room status:', error);
    }
}

// Render each building's room grid with sharing-wise sub-grids
function renderBuilding(building, containerId, activeGuests) {
    const container = document.getElementById(containerId);
    const rooms = ROOM_MAP[building] || [];

    let html = '';

    rooms.forEach(roomNo => {
        const roomGuests = activeGuests.filter(
            g => g.building === building && g.roomNo === roomNo
        );

        // Create sharing-wise breakdown (1 Sharing, 2 Sharing, 3 Sharing)
        let sharingGridHtml = '';

        for (let sharingType = 1; sharingType <= 3; sharingType++) {
            // Count guests in this room with THIS specific sharing type
            const sharingGuests = roomGuests.filter(g => parseInt(g.sharingType) === sharingType);
            const occupiedCount = sharingGuests.length;
            const maxCapacity = SHARING_CAPACITY[sharingType];

            // Determine overall status
            let sharingStatusClass = 'vacant';
            if (occupiedCount === 0) {
                sharingStatusClass = 'vacant';
            } else if (occupiedCount >= maxCapacity) {
                sharingStatusClass = 'full';
            } else {
                sharingStatusClass = 'partial';
            }

            const label = SHARING_LABELS[sharingType];

            // Create individual bed slots
            let bedSlotsHtml = '';
            for (let slot = 0; slot < maxCapacity; slot++) {
                const guest = sharingGuests[slot];
                let bedClass = 'bed-slot empty';
                let bedContent = '<i class="fas fa-bed" style="opacity: 0.3; font-size: 20px;"></i><div style="font-size: 10px; color: #999;">Empty</div>';

                if (guest) {
                    bedClass = 'bed-slot occupied';
                    const statusBadge = 
                        guest.monthlyPaymentStatus === 'Paid' ? 'success' :
                        guest.monthlyPaymentStatus === 'Breached' ? 'danger' : 'warning';
                    
                    bedContent = `
                        <div style="font-size: 18px;">
                            <i class="fas fa-bed" style="color: #2563eb;"></i>
                        </div>
                        <div style="font-size: 9px; font-weight: 600; margin-top: 2px; max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${guest.name}
                        </div>
                        <div style="font-size: 8px; color: ${statusBadge === 'success' ? '#22c55e' : statusBadge === 'danger' ? '#ef4444' : '#f59e0b'}; font-weight: 600;">
                            ${statusBadge === 'success' ? '✓ Paid' : statusBadge === 'danger' ? '✗ Breach' : '⏳ Pending'}
                        </div>
                    `;
                }

                bedSlotsHtml += `
                    <div class="${bedClass}" onclick="showBedDetails('${building}', '${roomNo}', ${sharingType}, ${slot})" title="${guest ? guest.name + ' - ' + guest.monthlyPaymentStatus : 'Empty bed'}">
                        ${bedContent}
                    </div>
                `;
            }

            sharingGridHtml += `
                <div class="sharing-box ${sharingStatusClass}">
                    <div class="sharing-header">
                        <div class="sharing-title">${label}</div>
                        <div class="sharing-count">${occupiedCount}/${maxCapacity}</div>
                    </div>
                    <div class="beds-grid">
                        ${bedSlotsHtml}
                    </div>
                </div>
            `;
        }

        // Room header info
        const totalOccupants = roomGuests.length;

        html += `
            <div class="room-card">
                <div class="room-header">
                    <h3>
                        <i class="fas fa-door-closed"></i> Room ${roomNo}
                    </h3>
                    <div class="room-info">
                        ${building} | Total: ${totalOccupants} Guests
                    </div>
                </div>
                <div class="sharing-grid">
                    ${sharingGridHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Show details for specific bed/guest
function showBedDetails(building, roomNo, sharingType, bedSlot) {
    const sharingGuests = allGuests.filter(
        g => g.building === building && g.roomNo === roomNo && 
             parseInt(g.sharingType) === sharingType && 
             g.roomVacate !== 'Yes'
    );

    const modal = document.getElementById('roomModal');
    const modalBody = document.getElementById('roomModalBody');

    const label = SHARING_LABELS[sharingType];
    const maxCapacity = SHARING_CAPACITY[sharingType];
    const guest = sharingGuests[bedSlot];

    if (!guest) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-bed" style="font-size: 48px; color: #999;"></i>
                <h3 style="margin-top: 15px;">Room ${roomNo} - ${label} (Bed ${bedSlot + 1})</h3>
                <p style="color: var(--text-secondary);">This bed is currently empty</p>
                <p style="font-size: 12px; color: #999;">Click 'Add Guest' to assign someone to this bed</p>
            </div>
        `;
    } else {
        const statusClass =
            guest.monthlyPaymentStatus === 'Paid'
                ? 'success'
                : guest.monthlyPaymentStatus === 'Breached'
                ? 'danger'
                : 'warning';

        const statusColor = 
            statusClass === 'success' ? '#22c55e' :
            statusClass === 'danger' ? '#ef4444' : '#f59e0b';

        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <i class="fas fa-user-circle" style="font-size: 48px; color: #2563eb;"></i>
                <h3 style="margin-top: 15px;">${guest.name}</h3>
                <p style="color: var(--text-secondary);">Room ${roomNo} - ${label} (Bed ${bedSlot + 1})</p>
            </div>

            <div style="border: 2px solid var(--border-color); border-radius: 10px; padding: 20px; background: var(--bg-color);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <strong>📱 Mobile:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">${guest.mobile}</p>
                    </div>
                    <div>
                        <strong>🏠 Building:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">${guest.building}</p>
                    </div>
                    <div>
                        <strong>📦 Sharing:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">${guest.sharingType} Sharing</p>
                    </div>
                    <div>
                        <strong>💰 Monthly Rent:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">₹${guest.paymentAmount}</p>
                    </div>
                    <div>
                        <strong>📅 Joined:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">${new Date(guest.joiningDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <strong>📌 Payment Status:</strong>
                        <p style="margin: 5px 0; color: ${statusColor}; font-weight: 600;">
                            ${guest.monthlyPaymentStatus === 'Paid' ? '✓ Paid' : 
                              guest.monthlyPaymentStatus === 'Breached' ? '✗ Breached' : 
                              guest.monthlyPaymentStatus === 'Partial Paid' ? '⏳ Partial Paid' : '⏳ Pending'}
                        </p>
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <div>
                        <strong>💳 Advance Payment:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">₹${guest.advancePayment}</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>📆 Payment Due Date:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">
                            ${guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    ${guest.remarks ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                        <strong>📝 Remarks:</strong>
                        <p style="margin: 5px 0; color: var(--text-secondary);">${guest.remarks}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    modal.style.display = 'block';
}

// Close modal
function closeRoomModal() {
    document.getElementById('roomModal').style.display = 'none';
}

// Expose modal functions globally for HTML
window.showBedDetails = showBedDetails;
window.closeRoomModal = closeRoomModal;

// Modal: click outside to close
window.onclick = function (event) {
    const modal = document.getElementById('roomModal');
    if (event.target === modal) closeRoomModal();
};

// Initialize room status on page load (with small delay)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadRoomStatus, 500);
});

// Auto-refresh room grid every 30s for real-time UI
setInterval(loadRoomStatus, 30000);
