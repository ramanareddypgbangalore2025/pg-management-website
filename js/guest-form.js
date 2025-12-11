// ============================================
// Guest Form Module WITH PER-ROOM CAPACITY VALIDATION
// AND JOINING-DATE-BASED PAYMENT CYCLE
// ============================================

let isEditMode = false;
let currentGuestId = null;
let allGuests = [];

// Cache for room capacity loaded from DB
let cachedRoomCapacity = null;

// Map: building -> rooms (no floor column needed)
const ROOM_MAP = {
  'Building-1': [
    'G01', // Floor-G
    '101', '102', '103', // Floor-1
    '201', '202', '203', // Floor-2
    '301', '302', '303', // Floor-3
    '401' // Floor-4
  ],
  'Building-2': [
    'G02', // Floor-G
    '104', '105', '106', // Floor-1
    '204', '205', '206', // Floor-2
    '304', '305', '306', // Floor-3
    '402' // Floor-4
  ]
};

// Mapping: Display Name -> Database Value (number)
const SHARING_TYPE_MAP = {
  '1 Sharing': 1,
  '2 Sharing': 2,
  '3 Sharing': 3
};

// Reverse mapping for displaying: Database Value -> Display Name
const SHARING_TYPE_DISPLAY = {
  1: '1 Sharing',
  2: '2 Sharing',
  3: '3 Sharing'
};

// ✅ Load per-room capacity from DB first, then localStorage, then default
async function getRoomCapacity() {
  // Return cached version if already loaded
  if (cachedRoomCapacity) {
    return cachedRoomCapacity;
  }

  try {
    // Try to load from DB first
    const capacityRows = await DB.getRoomCapacity();
    const dbCapacity = DB.convertRoomCapacityToMap(capacityRows);
    
    // Merge with default: use DB values, fill gaps from config
    cachedRoomCapacity = JSON.parse(JSON.stringify(window.DEFAULT_ROOM_CAPACITY || {}));
    Object.keys(dbCapacity).forEach(building => {
      Object.keys(dbCapacity[building]).forEach(roomNo => {
        Object.keys(dbCapacity[building][roomNo]).forEach(sharingType => {
          if (!cachedRoomCapacity[building]) cachedRoomCapacity[building] = {};
          if (!cachedRoomCapacity[building][roomNo]) cachedRoomCapacity[building][roomNo] = {};
          cachedRoomCapacity[building][roomNo][sharingType] = dbCapacity[building][roomNo][sharingType];
        });
      });
    });
    
    return cachedRoomCapacity;
  } catch (error) {
    console.warn('Error loading room capacity from DB, using defaults:', error);
    // Fallback to default config
    cachedRoomCapacity = window.DEFAULT_ROOM_CAPACITY || {};
    return cachedRoomCapacity;
  }
}

// Initialize form
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load room capacity from DB first
    await getRoomCapacity();
    
    // Load all guests from database
    allGuests = await DB.getGuests();

    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');
    if (guestId) {
      isEditMode = true;
      currentGuestId = guestId;
      document.getElementById('formTitle').textContent = 'Edit Guest';
      await loadGuestData(guestId);
    }

    // Set up form listeners
    setupFormListeners();

    // Set default joining date and payment date to today for new guest
    if (!isEditMode) {
      document.getElementById('joiningDate').valueAsDate = new Date();
      document.getElementById('monthlyPaymentDate').valueAsDate = new Date();
      // Calculate initial due date and days left
      calculateDueDate();
    }
  } catch (error) {
    console.error('Error initializing form:', error);
    showAlert('Error loading form data', 'danger');
  }
});

// Setup form listeners
function setupFormListeners() {
  // Building selection - load rooms
  document.getElementById('building').addEventListener('change', function () {
    loadRooms(this.value);
  });

  // Room selection - validate capacity
  document.getElementById('roomNo').addEventListener('change', validateRoomCapacity);

  // Sharing type change - validate capacity
  document.getElementById('sharingType').addEventListener('change', validateRoomCapacity);

  // Joining / payment date change - calculate due date
  document.getElementById('joiningDate').addEventListener('change', calculateDueDate);
  document.getElementById('monthlyPaymentDate').addEventListener('change', calculateDueDate);

  // Form submission
  document.getElementById('guestForm').addEventListener('submit', handleFormSubmit);
}

// Load rooms based on building
function loadRooms(building) {
  const roomSelect = document.getElementById('roomNo');
  roomSelect.innerHTML = '';

  if (!building || !ROOM_MAP[building]) return;

  ROOM_MAP[building].forEach(room => {
    const option = document.createElement('option');
    option.value = room;
    option.textContent = room;
    roomSelect.appendChild(option);
  });

  // Clear previous validation (async)
  validateRoomCapacity().catch(err => console.error('Error validating capacity:', err));
}

// ✅ VALIDATE ROOM CAPACITY - WITH PER-ROOM CHECKING
async function validateRoomCapacity() {
  const roomNo = document.getElementById('roomNo').value;
  const sharingTypeDisplay = document.getElementById('sharingType').value; // Display name from dropdown
  const building = document.getElementById('building').value;
  const alertDiv = document.getElementById('capacityAlert');
  const submitBtn = document.querySelector('button[type="submit"]');

  // Clear alert if not enough selections
  if (!roomNo || !sharingTypeDisplay || !building) {
    if (alertDiv) alertDiv.innerHTML = '';
    if (submitBtn) submitBtn.disabled = false;
    return true;
  }

  // ✅ Get max capacity for THIS SPECIFIC room + sharing type
  const roomCapacity = await getRoomCapacity();
  const sharingType = SHARING_TYPE_MAP[sharingTypeDisplay];
  const maxCapacity = roomCapacity[building]?.[roomNo]?.[sharingType] ?? 1;

  // Count current occupants in this room with SAME sharing type (excluding current edit guest)
  const currentOccupants = allGuests.filter(guest => {
    const isSameRoom = guest.roomNo === roomNo;
    const isSameBuilding = guest.building === building;

    // Check if sharing type matches (handle both string and number formats)
    const guestSharing = typeof guest.sharingType === 'number'
      ? SHARING_TYPE_DISPLAY[guest.sharingType]
      : guest.sharingType;
    const isSameSharing = guestSharing === sharingTypeDisplay;

    const isNotCurrentGuest = !isEditMode || guest.id !== currentGuestId;
    const isNotVacated = guest.roomVacate !== 'Yes';

    return isSameRoom && isSameBuilding && isSameSharing && isNotCurrentGuest && isNotVacated;
  }).length;

  // ✅ CHECK IF ROOM IS AT CAPACITY
  if (currentOccupants >= maxCapacity) {
    // Show error alert
    if (alertDiv) {
      alertDiv.innerHTML = `
        <div style="background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626; margin-bottom: 12px;">
          <strong>❌ Room Full</strong><br>
          ${building} - Room ${roomNo} (${sharingTypeDisplay}) has reached maximum capacity (${currentOccupants}/${maxCapacity} beds occupied).
        </div>
      `;
    }

    // Disable form submission
    if (submitBtn) submitBtn.disabled = true;
    return false;
  }

  // Show warning if room is almost full
  const remainingBeds = maxCapacity - currentOccupants - 1; // -1 for this new guest
  if (remainingBeds === 0) {
    if (alertDiv) {
      alertDiv.innerHTML = `
        <div style="background: #fef3c7; color: #92400e; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 12px;">
          <strong>⚠️ Last Bed</strong><br>
          This is the last available bed in ${building} - Room ${roomNo} (${sharingTypeDisplay}).
        </div>
      `;
    }
  } else {
    // Clear alert
    if (alertDiv) alertDiv.innerHTML = '';
  }

  // Enable form submission
  if (submitBtn) submitBtn.disabled = false;
  return true;
}

// Load guest data for edit mode
async function loadGuestData(guestId) {
  try {
    const guest = allGuests.find(g => g.id === guestId);
    if (!guest) {
      showAlert('Guest not found', 'danger');
      return;
    }

    // Populate form fields
    document.getElementById('name').value = guest.name || '';
    document.getElementById('building').value = guest.building || '';
    document.getElementById('mobile').value = guest.mobile || '';
    document.getElementById('joiningDate').valueAsDate = guest.joiningDate ? new Date(guest.joiningDate) : new Date();
    document.getElementById('advancePayment').value = guest.advancePayment || '';
    document.getElementById('paymentAmount').value = guest.paymentAmount || '';
    document.getElementById('monthlyPaymentDate').valueAsDate = guest.monthlyPaymentDate
      ? new Date(guest.monthlyPaymentDate)
      : new Date();
    document.getElementById('monthlyPaymentStatus').value = guest.monthlyPaymentStatus || 'Pending';
    document.getElementById('remarks').value = guest.remarks || '';

    // Load rooms for the selected building
    loadRooms(guest.building);

    // Set room and sharing type (these trigger validateRoomCapacity)
    document.getElementById('roomNo').value = guest.roomNo || '';

    const sharingDisplay = typeof guest.sharingType === 'number'
      ? SHARING_TYPE_DISPLAY[guest.sharingType]
      : guest.sharingType;
    document.getElementById('sharingType').value = sharingDisplay || '';

    // Calculate and set due date + days left
    calculateDueDate();
  } catch (error) {
    console.error('Error loading guest data:', error);
    showAlert('Error loading guest data', 'danger');
  }
}

// Calculate due date based on cycle day
function calculateDueDate() {
  const joiningDateStr = document.getElementById('joiningDate').value;
  if (!joiningDateStr) return;

  const joiningDate = new Date(joiningDateStr);
  if (isNaN(joiningDate)) return;

  // 1) Cycle day is always from joining date (1..31)
  const cycleDay = joiningDate.getDate();

  // 2) If there is a Monthly Payment Date, always use it as base.
  //    This covers: new guest after first payment, early payment,
  //    paid after breach, etc. If no payment date, use joining date.
  const paymentDateStr = document.getElementById('monthlyPaymentDate').value;
  let base;
  if (paymentDateStr) {
    base = new Date(paymentDateStr);
    if (isNaN(base)) base = joiningDate;
  } else {
    base = joiningDate;
  }

  // 3) Move to next calendar month from base
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);

  // 4) Clamp to last valid day of that month (handles 29/30/31, February, etc.)
  const lastDayOfNextMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate();
  next.setDate(Math.min(cycleDay, lastDayOfNextMonth));

  // 5) Write Upcoming Payment Due Date
  document.getElementById('upcomingPaymentDueDate').value =
    next.toISOString().split('T')[0];

  // 6) Days Left
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  next.setHours(0, 0, 0, 0);

  const diffTime = next - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    document.getElementById('daysLeft').value = `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    document.getElementById('daysLeft').value = 'Due today';
  } else {
    document.getElementById('daysLeft').value = `${diffDays} days`;
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  // Validate capacity before submission
  if (!await validateRoomCapacity()) {
    showAlert('Cannot add guest - room is at capacity', 'danger');
    return;
  }

  try {
    const guestData = {
      name: document.getElementById('name').value,
      building: document.getElementById('building').value,
      roomNo: document.getElementById('roomNo').value,
      mobile: document.getElementById('mobile').value,
      sharingType: SHARING_TYPE_MAP[document.getElementById('sharingType').value],
      joiningDate: document.getElementById('joiningDate').value,
      advancePayment: parseFloat(document.getElementById('advancePayment').value) || 0,
      paymentAmount: parseFloat(document.getElementById('paymentAmount').value) || 0,
      monthlyPaymentDate: document.getElementById('monthlyPaymentDate').value,
      upcomingPaymentDueDate: document.getElementById('upcomingPaymentDueDate').value,
      monthlyPaymentStatus: document.getElementById('monthlyPaymentStatus').value,
      roomVacate: document.getElementById('roomVacate').value || 'No',
      remarks: document.getElementById('remarks').value
    };

    // Validate required fields
    if (!guestData.name || !guestData.building || !guestData.roomNo || !guestData.mobile) {
      showAlert('Please fill in all required fields', 'danger');
      return;
    }

    if (isEditMode) {
      // Update existing guest
      await DB.updateGuest(currentGuestId, guestData);
      showAlert(`Guest "${guestData.name}" updated successfully!`, 'success');
    } else {
      // Add new guest
      await DB.addGuest(guestData);
      showAlert(`Guest "${guestData.name}" added successfully!`, 'success');
      document.getElementById('guestForm').reset();
      document.getElementById('joiningDate').valueAsDate = new Date();
      document.getElementById('monthlyPaymentDate').valueAsDate = new Date();
      calculateDueDate();
    }

    // Refresh guest list and reset capacity validation
    allGuests = await DB.getGuests();
    validateRoomCapacity();

    // Redirect to guest list after success
    setTimeout(() => {
      window.location.href = 'guest-list.html';
    }, 1500);
  } catch (error) {
    console.error('Error saving guest:', error);
    showAlert('Error saving guest data: ' + error.message, 'danger');
  }
}

// Show alert message
function showAlert(message, type) {
  const alertDiv = document.getElementById('alertMessage');
  if (!alertDiv) return;

  const bgColor = type === 'success' ? '#dcfce7' : type === 'warning' ? '#fef3c7' : '#fee2e2';
  const textColor = type === 'success' ? '#166534' : type === 'warning' ? '#92400e' : '#991b1b';
  const borderColor = type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : '#dc2626';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : '❌';

  alertDiv.innerHTML = `
    <div style="background: ${bgColor}; color: ${textColor}; padding: 12px; border-radius: 6px; border-left: 4px solid ${borderColor}; margin-bottom: 12px;">
      <strong>${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}</strong><br>
      ${message}
    </div>
  `;

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      alertDiv.innerHTML = '';
    }, 5000);
  }
}

// Expose functions to window for global access
window.validateRoomCapacity = validateRoomCapacity;
window.calculateDueDate = calculateDueDate;
window.handleFormSubmit = handleFormSubmit;
window.showAlert = showAlert;
