// ============================================
// Reports Module - FIXED: Filter by Payment Date
// ============================================

let allGuests = [];
let reportMode = 'all'; // 'all', 'month', 'range'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const reportModeSelect = document.getElementById('reportMode');

    // Set default dates (current month)
    if (monthInput) {
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        monthInput.addEventListener('change', generateReport);
    }

    // Set default range dates
    if (fromDateInput) {
        fromDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        fromDateInput.addEventListener('change', generateDateRangeReport);
    }

    if (toDateInput) {
        toDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
        toDateInput.addEventListener('change', generateDateRangeReport);
    }

    // Report mode change
    if (reportModeSelect) {
        reportModeSelect.addEventListener('change', (e) => {
            reportMode = e.target.value;
            updateDateInputVisibility();
            
            if (reportMode === 'all') {
                renderAllGuests();
            } else if (reportMode === 'month') {
                generateReport();
            } else if (reportMode === 'range') {
                generateDateRangeReport();
            }
        });
    }

    // Building filter change
    if (buildingSelect) {
        buildingSelect.addEventListener('change', () => {
            if (reportMode === 'all') {
                renderAllGuests();
            } else if (reportMode === 'month') {
                generateReport();
            } else if (reportMode === 'range') {
                generateDateRangeReport();
            }
        });
    }

    // Export PDF button
    const exportBtn = document.getElementById('exportPdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (reportMode === 'month') {
                const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
                if (!monthInput || !monthInput.value) {
                    alert('Please select a month first');
                    return;
                }
                exportToPDF(monthInput.value);
            } else if (reportMode === 'range') {
                const fromDate = document.getElementById('fromDate');
                const toDate = document.getElementById('toDate');
                if (!fromDate || !toDate || !fromDate.value || !toDate.value) {
                    alert('Please select date range first');
                    return;
                }
                exportToPDFRange(fromDate.value, toDate.value);
            } else {
                exportToPDFAll();
            }
        });
    }

    // Export Excel button
    const exportExcelBtn = document.getElementById('exportExcel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
            const buildingValue = buildingSelect ? buildingSelect.value : '';

            if (reportMode === 'month') {
                const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
                if (!monthInput || !monthInput.value) {
                    alert('Please select a month first');
                    return;
                }
                exportToExcel(monthInput.value, buildingValue);
            } else if (reportMode === 'range') {
                const fromDate = document.getElementById('fromDate');
                const toDate = document.getElementById('toDate');
                if (!fromDate || !toDate || !fromDate.value || !toDate.value) {
                    alert('Please select date range first');
                    return;
                }
                exportToExcelRange(fromDate.value, toDate.value, buildingValue);
            } else {
                exportToExcelAll(buildingValue);
            }
        });
    }

    // Load guests and render initial report
    setTimeout(() => {
        loadGuestsAndGenerate();
    }, 500);
});

// Update date input visibility based on report mode
function updateDateInputVisibility() {
    const monthGroup = document.getElementById('monthGroup');
    const rangeGroup = document.getElementById('rangeGroup');

    if (monthGroup) monthGroup.style.display = reportMode === 'month' ? 'block' : 'none';
    if (rangeGroup) rangeGroup.style.display = reportMode === 'range' ? 'block' : 'none';
}

// Load guests and generate initial report
async function loadGuestsAndGenerate() {
    try {
        allGuests = await DB.getGuests();
        fillBuildingDropdown();
        updateDateInputVisibility();
        // Load ALL guests by default (not filtered by month)
        renderAllGuests();
    } catch (error) {
        console.error('Error loading guests:', error);
        const guestListReport = document.getElementById('guestListReport');
        if (guestListReport) {
            guestListReport.innerHTML = '<p class="text-danger">Error loading data</p>';
        }
    }
}

// Populate building dropdown dynamically
function fillBuildingDropdown() {
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    if (!buildingSelect) return;

    const buildings = [...new Set(allGuests.map(g => g.building))].filter(Boolean).sort();
    buildingSelect.options.length = 1; // Keep the "All Buildings" option

    buildings.forEach(bldg => {
        const opt = document.createElement('option');
        opt.value = bldg;
        opt.textContent = bldg;
        buildingSelect.appendChild(opt);
    });
}

// Calculate monthly statistics based on PAYMENT DATE
function calculateMonthlyStats(year, month, building = '') {
    const monthGuests = allGuests.filter(guest => {
        // ✅ FIXED: Filter by PAYMENT DATE, not joining date
        const paymentDate = new Date(guest.monthlyPaymentDate);
        if (isNaN(paymentDate)) return false;

        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth() + 1;
        
        const monthMatches = paymentYear === year && paymentMonth === month;
        const buildingMatches = !building || guest.building === building;
        
        return monthMatches && buildingMatches;
    });

    const stats = {
        totalGuests: monthGuests.length,
        totalPaid: monthGuests.filter(g => g.monthlyPaymentStatus === 'Paid').length,
        totalPending: monthGuests.filter(g => g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid').length,
        totalBreached: monthGuests.filter(g => g.monthlyPaymentStatus === 'Breached').length,
        totalRevenue: monthGuests.reduce((sum, g) => sum + (g.paymentAmount || 0), 0),
        collectedRevenue: monthGuests.filter(g => g.monthlyPaymentStatus === 'Paid').reduce((sum, g) => sum + (g.paymentAmount || 0), 0),
        vacatedRooms: monthGuests.filter(g => g.roomVacate === 'Yes').length,
        guests: monthGuests
    };

    stats.pendingRevenue = stats.totalRevenue - stats.collectedRevenue;
    stats.collectionRate = stats.totalRevenue > 0 ? ((stats.collectedRevenue / stats.totalRevenue) * 100).toFixed(2) : 0;
    
    return stats;
}

// Calculate date range statistics based on PAYMENT DATE
function calculateDateRangeStats(fromDateStr, toDateStr, building = '') {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    const rangeGuests = allGuests.filter(guest => {
        // ✅ FIXED: Filter by PAYMENT DATE, not joining date
        const paymentDate = new Date(guest.monthlyPaymentDate);
        if (isNaN(paymentDate)) return false;

        const inRange = paymentDate >= fromDate && paymentDate <= toDate;
        const buildingMatches = !building || guest.building === building;
        
        return inRange && buildingMatches;
    });

    const stats = {
        totalGuests: rangeGuests.length,
        totalPaid: rangeGuests.filter(g => g.monthlyPaymentStatus === 'Paid').length,
        totalPending: rangeGuests.filter(g => g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid').length,
        totalBreached: rangeGuests.filter(g => g.monthlyPaymentStatus === 'Breached').length,
        totalRevenue: rangeGuests.reduce((sum, g) => sum + (g.paymentAmount || 0), 0),
        collectedRevenue: rangeGuests.filter(g => g.monthlyPaymentStatus === 'Paid').reduce((sum, g) => sum + (g.paymentAmount || 0), 0),
        vacatedRooms: rangeGuests.filter(g => g.roomVacate === 'Yes').length,
        guests: rangeGuests
    };

    stats.pendingRevenue = stats.totalRevenue - stats.collectedRevenue;
    stats.collectionRate = stats.totalRevenue > 0 ? ((stats.collectedRevenue / stats.totalRevenue) * 100).toFixed(2) : 0;
    
    return stats;
}

// Generate monthly comparison report based on PAYMENT DATE
function generateMonthlyComparison() {
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    const selectedBuilding = buildingSelect ? buildingSelect.value : '';

    // Get all unique months from PAYMENT DATES
    const monthSet = new Set();
    allGuests.forEach(guest => {
        const paymentDate = new Date(guest.monthlyPaymentDate);
        if (!isNaN(paymentDate)) {
            const year = paymentDate.getFullYear();
            const month = paymentDate.getMonth() + 1;
            monthSet.add(`${year}-${String(month).padStart(2, '0')}`);
        }
    });

    const months = Array.from(monthSet).sort();
    const monthlyStats = {};

    months.forEach(monthStr => {
        const [year, month] = monthStr.split('-').map(Number);
        monthlyStats[monthStr] = calculateMonthlyStats(year, month, selectedBuilding);
    });

    return monthlyStats;
}

// Render ALL guests by default (no month filter)
function renderAllGuests() {
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');
    const selectedBuilding = buildingSelect ? buildingSelect.value : '';

    // Show all guests (apply only building filter if selected)
    const filteredGuests = allGuests.filter(guest => {
        const buildingMatches = !selectedBuilding || guest.building === selectedBuilding;
        return buildingMatches;
    });

    // Summary based on all filtered guests
    const totalGuests = filteredGuests.length;
    const totalPaid = filteredGuests.filter(g => g.monthlyPaymentStatus === 'Paid').length;
    const totalPending = filteredGuests.filter(g =>
        g.monthlyPaymentStatus === 'Pending' || g.monthlyPaymentStatus === 'Partial Paid'
    ).length;
    const totalBreached = filteredGuests.filter(g => g.monthlyPaymentStatus === 'Breached').length;

    const totalRevenue = filteredGuests.reduce((sum, g) => sum + (g.paymentAmount || 0), 0);
    const collectedRevenue = filteredGuests
        .filter(g => g.monthlyPaymentStatus === 'Paid')
        .reduce((sum, g) => sum + (g.paymentAmount || 0), 0);
    const vacatedRooms = filteredGuests.filter(g => g.roomVacate === 'Yes').length;

    renderSummary(
        {
            totalGuests,
            totalPaid,
            totalPending,
            totalBreached,
            totalRevenue,
            collectedRevenue,
            vacatedRooms
        },
        'All Guests'
    );

    renderDetails(filteredGuests);
    renderMonthlyComparison();
}

// Generate report summary and details (when month is selected) - based on PAYMENT DATE
function generateReport() {
    const monthInput = document.getElementById('reportMonth') || document.getElementById('month');
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');

    if (!monthInput || !monthInput.value) {
        alert('Please select a month');
        return;
    }

    const selectedMonth = monthInput.value;
    const selectedBuilding = buildingSelect ? buildingSelect.value : '';

    const [year, month] = selectedMonth.split('-').map(Number);

    // Get monthly stats (now based on payment date)
    const monthStats = calculateMonthlyStats(year, month, selectedBuilding);

    renderSummary(
        {
            totalGuests: monthStats.totalGuests,
            totalPaid: monthStats.totalPaid,
            totalPending: monthStats.totalPending,
            totalBreached: monthStats.totalBreached,
            totalRevenue: monthStats.totalRevenue,
            collectedRevenue: monthStats.collectedRevenue,
            vacatedRooms: monthStats.vacatedRooms
        },
        selectedMonth
    );

    renderDetails(monthStats.guests);
    renderMonthlyComparison();
}

// Generate date range report based on PAYMENT DATE
function generateDateRangeReport() {
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const buildingSelect = document.getElementById('reportBuilding') || document.getElementById('building');

    if (!fromDate || !toDate || !fromDate.value || !toDate.value) {
        alert('Please select both from and to dates');
        return;
    }

    const selectedBuilding = buildingSelect ? buildingSelect.value : '';
    const rangeStats = calculateDateRangeStats(fromDate.value, toDate.value, selectedBuilding);

    const fromDateObj = new Date(fromDate.value);
    const toDateObj = new Date(toDate.value);
    const dateRange = `${fromDateObj.toLocaleDateString()} to ${toDateObj.toLocaleDateString()}`;

    renderSummary(
        {
            totalGuests: rangeStats.totalGuests,
            totalPaid: rangeStats.totalPaid,
            totalPending: rangeStats.totalPending,
            totalBreached: rangeStats.totalBreached,
            totalRevenue: rangeStats.totalRevenue,
            collectedRevenue: rangeStats.collectedRevenue,
            vacatedRooms: rangeStats.vacatedRooms
        },
        dateRange
    );

    renderDetails(rangeStats.guests);
    renderMonthlyComparison();
}

// Render summary HTML
function renderSummary(summary, month) {
    const summaryDiv = document.getElementById('reportSummary');
    if (!summaryDiv) return;

    let formattedMonth = month;
    if (month !== 'All Guests' && !month.includes('to')) {
        formattedMonth = new Date(month + '-01').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    summaryDiv.innerHTML = `
        <h2 style="margin-bottom: 20px;">
            <i class="fas fa-chart-bar"></i> Summary for ${formattedMonth}
        </h2>
        <div class="stats-grid">
            <div class="stat-card stat-primary">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div>
                    <h3>${summary.totalGuests}</h3>
                    <p>Total Guests</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div>
                    <h3>${summary.totalPaid}</h3>
                    <p>Paid</p>
                </div>
            </div>
            <div class="stat-card stat-warning">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div>
                    <h3>${summary.totalPending}</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="stat-card stat-danger">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div>
                    <h3>${summary.totalBreached}</h3>
                    <p>Breached</p>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Total Revenue:</strong> ₹${summary.totalRevenue.toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(67, 233, 123, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Collected:</strong> ₹${summary.collectedRevenue.toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(250, 112, 154, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Pending:</strong> ₹${(summary.totalRevenue - summary.collectedRevenue).toLocaleString()}
            </div>
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(254, 225, 64, 0.1)); padding: 15px; border-radius: 10px;">
                <strong>Vacated Rooms:</strong> ${summary.vacatedRooms}
            </div>
        </div>
    `;
}

// Render guests table details
function renderDetails(guests) {
    const detailsDiv = document.getElementById('guestListReport');
    if (!detailsDiv) return;

    if (guests.length === 0) {
        detailsDiv.innerHTML = '<p class="text-center text-muted">No data for selected period</p>';
        return;
    }

    let html = `
        <div class="table-container" style="width:100%;overflow-x:auto;">
        <table class="guest-table" id="exportTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Building</th>
                    <th>Room</th>
                    <th>Mobile</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    guests.forEach((guest, index) => {
        const statusClass =
            guest.monthlyPaymentStatus === 'Paid'
                ? 'paid'
                : guest.monthlyPaymentStatus === 'Breached'
                ? 'breached'
                : 'pending';

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(guest.name)}</td>
                <td>${escapeHtml(guest.building)}</td>
                <td>${escapeHtml(guest.roomNo)}</td>
                <td>${escapeHtml(guest.mobile)}</td>
                <td>₹${guest.paymentAmount || 0}</td>
                <td><span class="status-badge status-${statusClass}">${guest.monthlyPaymentStatus}</span></td>
                <td>${guest.monthlyPaymentDate ? new Date(guest.monthlyPaymentDate).toLocaleDateString() : 'N/A'}</td>
                <td>${guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    detailsDiv.innerHTML = html;
}

// Render monthly comparison table
function renderMonthlyComparison() {
    const comparisonDiv = document.getElementById('monthlyComparison');
    if (!comparisonDiv) return;

    const monthlyStats = generateMonthlyComparison();
    const months = Object.keys(monthlyStats).sort();

    if (months.length === 0) {
        comparisonDiv.innerHTML = '<p class="text-center text-muted">No monthly data available</p>';
        return;
    }

    let html = `
        <h3 style="margin-top: 30px; margin-bottom: 20px;">
            <i class="fas fa-calendar-alt"></i> Monthly Breakdown (Based on Payment Date)
        </h3>
        <div class="table-container" style="width:100%;overflow-x:auto;">
        <table class="guest-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Payments Made</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Breached</th>
                    <th>Total Revenue</th>
                    <th>Collected</th>
                    <th>Pending Revenue</th>
                    <th>Collection %</th>
                </tr>
            </thead>
            <tbody>
    `;

    months.forEach(monthStr => {
        const stats = monthlyStats[monthStr];
        const [year, month] = monthStr.split('-').map(Number);
        const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        html += `
            <tr>
                <td><strong>${monthName}</strong></td>
                <td>${stats.totalGuests}</td>
                <td><span class="status-badge status-paid">${stats.totalPaid}</span></td>
                <td><span class="status-badge status-pending">${stats.totalPending}</span></td>
                <td><span class="status-badge status-breached">${stats.totalBreached}</span></td>
                <td>₹${stats.totalRevenue.toLocaleString()}</td>
                <td style="color: green; font-weight: bold;">₹${stats.collectedRevenue.toLocaleString()}</td>
                <td style="color: orange; font-weight: bold;">₹${stats.pendingRevenue.toLocaleString()}</td>
                <td><strong>${stats.collectionRate}%</strong></td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    comparisonDiv.innerHTML = html;
}

// Simple HTML escape function for safe rendering
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Export as Excel (Month)
function exportToExcel(month, building) {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Check that XLSX is included in HTML.');
            return;
        }

        const [year, m] = month.split('-').map(Number);
        const filteredGuests = allGuests.filter(guest => {
            const paymentDate = new Date(guest.monthlyPaymentDate);
            if (isNaN(paymentDate)) return false;
            
            const paymentYear = paymentDate.getFullYear();
            const paymentMonth = paymentDate.getMonth() + 1;
            
            const monthMatches = paymentYear === year && paymentMonth === m;
            const buildingMatches = !building || guest.building === building;
            
            return monthMatches && buildingMatches;
        });

        if (filteredGuests.length === 0) {
            alert('No data matches your filters');
            return;
        }

        const excelData = filteredGuests.map((guest, idx) => ({
            '#': idx + 1,
            'Name': guest.name || '',
            'Building': guest.building || '',
            'Room': guest.roomNo || '',
            'Mobile': guest.mobile || '',
            'Rent': guest.paymentAmount || '',
            'Status': guest.monthlyPaymentStatus || '',
            'Payment Date': guest.monthlyPaymentDate ? new Date(guest.monthlyPaymentDate).toLocaleDateString() : '',
            'Due Date': guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Report');

        worksheet['!cols'] = [
            { wch: 4 }, { wch: 15 }, { wch: 15 }, { wch: 7 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }
        ];

        const fileName = `Guest_Report_${month}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        alert('Excel file exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting Excel: ' + error.message);
    }
}

// Export as Excel (Date Range)
function exportToExcelRange(fromDateStr, toDateStr, building) {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Check that XLSX is included in HTML.');
            return;
        }

        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);
        toDate.setHours(23, 59, 59, 999);

        const filteredGuests = allGuests.filter(guest => {
            const paymentDate = new Date(guest.monthlyPaymentDate);
            if (isNaN(paymentDate)) return false;

            const inRange = paymentDate >= fromDate && paymentDate <= toDate;
            const buildingMatches = !building || guest.building === building;
            
            return inRange && buildingMatches;
        });

        if (filteredGuests.length === 0) {
            alert('No data matches your filters');
            return;
        }

        const excelData = filteredGuests.map((guest, idx) => ({
            '#': idx + 1,
            'Name': guest.name || '',
            'Building': guest.building || '',
            'Room': guest.roomNo || '',
            'Mobile': guest.mobile || '',
            'Rent': guest.paymentAmount || '',
            'Status': guest.monthlyPaymentStatus || '',
            'Joining Date': guest.joiningDate ? new Date(guest.joiningDate).toLocaleDateString() : '',
            'Payment Date': guest.monthlyPaymentDate ? new Date(guest.monthlyPaymentDate).toLocaleDateString() : '',
            'Due Date': guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Report');

        worksheet['!cols'] = [
            { wch: 4 }, { wch: 15 }, { wch: 15 }, { wch: 7 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
        ];

        const fileName = `Guest_Report_${fromDateStr}_to_${toDateStr}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        alert('Excel file exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting Excel: ' + error.message);
    }
}

// Export as Excel (All Guests)
function exportToExcelAll(building) {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Check that XLSX is included in HTML.');
            return;
        }

        const filteredGuests = allGuests.filter(guest => {
            const buildingMatches = !building || guest.building === building;
            return buildingMatches;
        });

        if (filteredGuests.length === 0) {
            alert('No data available');
            return;
        }

        const excelData = filteredGuests.map((guest, idx) => ({
            '#': idx + 1,
            'Name': guest.name || '',
            'Building': guest.building || '',
            'Room': guest.roomNo || '',
            'Mobile': guest.mobile || '',
            'Rent': guest.paymentAmount || '',
            'Status': guest.monthlyPaymentStatus || '',
            'Joining Date': guest.joiningDate ? new Date(guest.joiningDate).toLocaleDateString() : '',
            'Payment Date': guest.monthlyPaymentDate ? new Date(guest.monthlyPaymentDate).toLocaleDateString() : '',
            'Due Date': guest.upcomingPaymentDueDate ? new Date(guest.upcomingPaymentDueDate).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Guest Report');

        worksheet['!cols'] = [
            { wch: 4 }, { wch: 15 }, { wch: 15 }, { wch: 7 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
        ];

        const fileName = `Guest_Report_All.xlsx`;
        XLSX.writeFile(workbook, fileName);
        alert('Excel file exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting Excel: ' + error.message);
    }
}

// Export as PDF - FIXED with page breaks
function exportToPDF(month) {
    try {
        if (typeof html2pdf === 'undefined') {
            alert('PDF library not loaded. Check that html2pdf is included in HTML.');
            return;
        }

        const element = document.getElementById('reportSummary');
        const tableElement = document.getElementById('guestListReport');
        const comparisonElement = document.getElementById('monthlyComparison');

        if (!element || !tableElement) {
            alert('Report data not found');
            return;
        }

        // ✅ FIXED: Split into multiple sections for better page breaks
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Guest_Report_${month}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, allowTaint: true, useCORS: true },
            jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        };

        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = `Guest Report - ${month}`;
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        container.appendChild(title);

        // Add summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = element.innerHTML;
        summaryDiv.style.marginBottom = '30px';
        summaryDiv.style.pageBreakAfter = 'always';
        container.appendChild(summaryDiv);

        // Add table section with page break
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = 'Detailed Guest List';
        tableTitle.style.marginTop = '20px';
        tableTitle.style.marginBottom = '15px';
        container.appendChild(tableTitle);

        const tableDiv = document.createElement('div');
        tableDiv.innerHTML = tableElement.innerHTML;
        tableDiv.style.pageBreakAfter = 'always';
        tableDiv.style.overflow = 'visible';
        
        // Fix table styling for PDF
        const tables = tableDiv.getElementsByTagName('table');
        for (let t of tables) {
            t.style.width = '100%';
            t.style.borderCollapse = 'collapse';
        }
        
        container.appendChild(tableDiv);

        // Add monthly comparison section
        if (comparisonElement && comparisonElement.innerHTML.trim()) {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.innerHTML = comparisonElement.innerHTML;
            comparisonDiv.style.marginTop = '20px';
            comparisonDiv.style.overflow = 'visible';
            
            // Fix table styling for PDF
            const compTables = comparisonDiv.getElementsByTagName('table');
            for (let t of compTables) {
                t.style.width = '100%';
                t.style.borderCollapse = 'collapse';
            }
            
            container.appendChild(comparisonDiv);
        }

        // Generate PDF with all content
        html2pdf()
            .set(opt)
            .from(container)
            .toPdf()
            .get('pdf')
            .then(pdf => {
                const totalPages = pdf.internal.pages.length;
                console.log(`PDF generated with ${totalPages} pages`);
            })
            .save();
            
        alert('PDF exported successfully!');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Error exporting PDF: ' + error.message);
    }
}

// Export as PDF (Date Range) - FIXED with page breaks
function exportToPDFRange(fromDateStr, toDateStr) {
    try {
        if (typeof html2pdf === 'undefined') {
            alert('PDF library not loaded. Check that html2pdf is included in HTML.');
            return;
        }

        const element = document.getElementById('reportSummary');
        const tableElement = document.getElementById('guestListReport');
        const comparisonElement = document.getElementById('monthlyComparison');

        if (!element || !tableElement) {
            alert('Report data not found');
            return;
        }

        // ✅ FIXED: Split into multiple sections for better page breaks
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Guest_Report_${fromDateStr}_to_${toDateStr}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, allowTaint: true, useCORS: true },
            jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        };

        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = `Guest Report - ${fromDateStr} to ${toDateStr}`;
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        container.appendChild(title);

        // Add summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = element.innerHTML;
        summaryDiv.style.marginBottom = '30px';
        summaryDiv.style.pageBreakAfter = 'always';
        container.appendChild(summaryDiv);

        // Add table section with page break
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = 'Detailed Guest List';
        tableTitle.style.marginTop = '20px';
        tableTitle.style.marginBottom = '15px';
        container.appendChild(tableTitle);

        const tableDiv = document.createElement('div');
        tableDiv.innerHTML = tableElement.innerHTML;
        tableDiv.style.pageBreakAfter = 'always';
        tableDiv.style.overflow = 'visible';
        
        // Fix table styling for PDF
        const tables = tableDiv.getElementsByTagName('table');
        for (let t of tables) {
            t.style.width = '100%';
            t.style.borderCollapse = 'collapse';
        }
        
        container.appendChild(tableDiv);

        // Add monthly comparison section
        if (comparisonElement && comparisonElement.innerHTML.trim()) {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.innerHTML = comparisonElement.innerHTML;
            comparisonDiv.style.marginTop = '20px';
            comparisonDiv.style.overflow = 'visible';
            
            // Fix table styling for PDF
            const compTables = comparisonDiv.getElementsByTagName('table');
            for (let t of compTables) {
                t.style.width = '100%';
                t.style.borderCollapse = 'collapse';
            }
            
            container.appendChild(comparisonDiv);
        }

        // Generate PDF with all content
        html2pdf()
            .set(opt)
            .from(container)
            .toPdf()
            .get('pdf')
            .then(pdf => {
                const totalPages = pdf.internal.pages.length;
                console.log(`PDF generated with ${totalPages} pages`);
            })
            .save();
            
        alert('PDF exported successfully!');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Error exporting PDF: ' + error.message);
    }
}

// Export as PDF (All) - FIXED with page breaks
function exportToPDFAll() {
    try {
        if (typeof html2pdf === 'undefined') {
            alert('PDF library not loaded. Check that html2pdf is included in HTML.');
            return;
        }

        const element = document.getElementById('reportSummary');
        const tableElement = document.getElementById('guestListReport');
        const comparisonElement = document.getElementById('monthlyComparison');

        if (!element || !tableElement) {
            alert('Report data not found');
            return;
        }

        // ✅ FIXED: Split into multiple sections for better page breaks
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Guest_Report_All.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, allowTaint: true, useCORS: true },
            jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        };

        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Complete Guest Report';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        container.appendChild(title);

        // Add summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = element.innerHTML;
        summaryDiv.style.marginBottom = '30px';
        summaryDiv.style.pageBreakAfter = 'always';
        container.appendChild(summaryDiv);

        // Add table section with page break
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = 'Detailed Guest List';
        tableTitle.style.marginTop = '20px';
        tableTitle.style.marginBottom = '15px';
        container.appendChild(tableTitle);

        const tableDiv = document.createElement('div');
        tableDiv.innerHTML = tableElement.innerHTML;
        tableDiv.style.pageBreakAfter = 'always';
        tableDiv.style.overflow = 'visible';
        
        // Fix table styling for PDF
        const tables = tableDiv.getElementsByTagName('table');
        for (let t of tables) {
            t.style.width = '100%';
            t.style.borderCollapse = 'collapse';
        }
        
        container.appendChild(tableDiv);

        // Add monthly comparison section
        if (comparisonElement && comparisonElement.innerHTML.trim()) {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.innerHTML = comparisonElement.innerHTML;
            comparisonDiv.style.marginTop = '20px';
            comparisonDiv.style.overflow = 'visible';
            
            // Fix table styling for PDF
            const compTables = comparisonDiv.getElementsByTagName('table');
            for (let t of compTables) {
                t.style.width = '100%';
                t.style.borderCollapse = 'collapse';
            }
            
            container.appendChild(comparisonDiv);
        }

        // Generate PDF with all content
        html2pdf()
            .set(opt)
            .from(container)
            .toPdf()
            .get('pdf')
            .then(pdf => {
                const totalPages = pdf.internal.pages.length;
                console.log(`PDF generated with ${totalPages} pages`);
            })
            .save();
            
        alert('PDF exported successfully!');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Error exporting PDF: ' + error.message);
    }
}

// Make functions globally accessible
window.generateReport = generateReport;
window.generateDateRangeReport = generateDateRangeReport;
window.renderAllGuests = renderAllGuests;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.calculateMonthlyStats = calculateMonthlyStats;
