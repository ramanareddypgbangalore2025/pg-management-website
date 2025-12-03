// ============================================
// Guest Form Module WITH ROOM CAPACITY VALIDATION
// ============================================

let isEditMode = false;
let currentGuestId = null;
let allGuests = [];

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

// Capacity limits for sharing types (KEY = display name, VALUE = max persons)
const CAPACITY_LIMITS = {
  '1 Sharing': 1,
  '2 Sharing': 2,
  '3 Sharing': 3
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

// Initialize form
document.addEventListener('DOMContentLoaded', async () => {
  try {
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
    
    // Set default joining date to today
    if (!isEditMode) {
      document.getElementById('joiningDate').valueAsDate = new Date();
      document.getElementById('monthlyPaymentDate').valueAsDate = new Date();
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
  roomSelect.innerHTML = '<option value="">Select Room</option>';
  if (!building || !ROOM_MAP[building]) return;
  
  ROOM_MAP[building].forEach(room => {
    const option = document.createElement('option');
    option.value = room;
    option.textContent = room;
    roomSelect.appendChild(option);
  });
  
  // Clear previous validation
  validateRoomCapacity();
}

// ✅ VALIDATE ROOM CAPACITY - MAIN FIX
function validateRoomCapacity() {
  const roomNo = document.getElementById('roomNo').value;
  const sharingTypeDisplay = document.getElementById('sharingType').value; // Display name from dropdown
  const building = document.getElementById('building').value;
  const alertDiv = document.getElementById('capacityAlert');
  const submitBtn = document.querySelector('button[type="submit"]');
  
  // Clear alert if not enough selections
  if (!roomNo || !sharingTypeDisplay || !building) {
    if (alertDiv) alertDiv.innerHTML = '';
    return true;
  }
  
  // Get max capacity for this sharing type
  const maxCapacity = CAPACITY_LIMITS[sharingTypeDisplay] || 0;
  
  // Count current occupants in this room with SAME sharing type (excluding current edit guest)
  // NOTE: Compare with both display name AND numeric value since DB might have either
  const currentOccupants = allGuests.filter(guest => {
    const isSameRoom = guest.roomNo === roomNo;
    const isSameBuilding = guest.building === building;
    
    // Check if sharing type matches (handle both string and number formats)
    const guestSharing = typeof guest.sharingType === 'number' 
      ? SHARING_TYPE_DISPLAY[guest.sharingType] 
      : guest.sharingType;
    const isSameSharing = guestSharing === sharingTypeDisplay;
    
    const isNotCurrentGuest = !isEditMode || guest.id !== currentGuestId;
    
    return isSameRoom && isSameBuilding && isSameSharing && isNotCurrentGuest;
  }).length;
  
  // ✅ CHECK IF ROOM IS AT CAPACITY
  if (currentOccupants >= maxCapacity) {
    // Show error alert
    if (alertDiv) {
      alertDiv.innerHTML = `
        <div style="background: #fee; padding: 12px; border-radius: 8px; border-left: 4px solid #f44; color: #c33; margin-bottom: 15px;">
          <strong>⚠️ Room is Full!</strong>
          <br/>
          <strong>${sharingTypeDisplay}:</strong> Maximum ${maxCapacity} person(s) allowed
          <br/>
          <strong>Current occupants:</strong> ${currentOccupants}/${maxCapacity} ❌
          <br/>
          <br/>
          ✅ <strong>Solution:</strong>
          <ul style="margin: 8px 0;">
            <li>Select a different room with available space</li>
            <li>OR select a sharing type with higher capacity</li>
          </ul>
        </div>
      `;
    }
    
    // Disable submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.title = 'Room is at full capacity. Please select another room.';
    }
    
    return false;
  } else {
    // Clear alert and enable submit
    if (alertDiv) alertDiv.innerHTML = '';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.title = '';
    }
    return true;
  }
}

// Calculate due date based on cycle day
function calculateDueDate() {
  const joiningDateStr = document.getElementById('joiningDate').value;
  if (!joiningDateStr) return;
  
  const joiningDate = new Date(joiningDateStr);
  if (isNaN(joiningDate)) return;
  
  // Cycle day is always taken from joining date (1..31)
  const cycleDay = joiningDate.getDate();
  const status = document.getElementById('monthlyPaymentStatus').value;
  const paymentDateStr = document.getElementById('monthlyPaymentDate').value;
  
  let base;
  
  // For Paid with a payment date, move to next cycle from payment date.
  // Otherwise (new/unpaid cycle), use joining date.
  if (status === 'Paid' && paymentDateStr) {
    base = new Date(paymentDateStr);
    if (isNaN(base)) base = joiningDate;
  } else {
    base = joiningDate;
  }
  
  // Move to next calendar month from base
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  
  // Last valid day of that next month
  const lastDayOfNextMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate(); // 28, 29, 30 or 31
  
  // Clamp to last day if needed (handles 31st, Feb, etc.)
  next.setDate(Math.min(cycleDay, lastDayOfNextMonth));
  
  // Set upcoming due date
  document.getElementById('upcomingPaymentDueDate').value =
    next.toISOString().split('T')[0];
  
  // Days left
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

// Load guest data for editing
async function loadGuestData(guestId) {
  try {
    const guest = await DB.getGuestById(guestId);
    if (guest) {
      document.getElementById('guestId').value = guest.id;
      document.getElementById('joiningDate').value = guest.joiningDate;
      document.getElementById('building').value = guest.building;
      
      // Load rooms for the building and set selected room
      loadRooms(guest.building);
      setTimeout(() => {
        document.getElementById('roomNo').value = guest.roomNo;
      }, 100);
      
      // Convert numeric sharingType to display name if needed
      const sharingDisplay = typeof guest.sharingType === 'number'
        ? SHARING_TYPE_DISPLAY[guest.sharingType]
        : guest.sharingType;
      document.getElementById('sharingType').value = sharingDisplay;
      
      document.getElementById('name').value = guest.name;
      document.getElementById('mobile').value = guest.mobile;
      document.getElementById('advancePayment').value = guest.advancePayment;
      document.getElementById('paymentAmount').value = guest.paymentAmount;
      document.getElementById('monthlyPaymentStatus').value = guest.monthlyPaymentStatus;
      document.getElementById('monthlyPaymentDate').value = guest.monthlyPaymentDate || '';
      document.getElementById('upcomingPaymentDueDate').value = guest.upcomingPaymentDueDate || '';
      document.getElementById('daysLeft').value = guest.daysLeft || '';
      document.getElementById('roomVacate').value = guest.roomVacate;
      document.getElementById('remarks').value = guest.remarks || '';
      
      // Recalculate based on current data
      calculateDueDate();
      
      // Validate capacity on load
      setTimeout(validateRoomCapacity, 200);
    }
  } catch (error) {
    console.error('Error loading guest data:', error);
    showAlert('Error loading guest data', 'danger');
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate capacity before submit
  if (!validateRoomCapacity()) {
    showAlert('Room is at full capacity. Please select another room.', 'danger');
    return;
  }
  
  // Make sure due date / daysLeft reflect current dates and status
  calculateDueDate();
  
  const status = document.getElementById('monthlyPaymentStatus').value;
  const sharingTypeDisplay = document.getElementById('sharingType').value;
  
  // ✅ CONVERT DISPLAY NAME TO DATABASE VALUE (NUMBER)
  const sharingTypeValue = SHARING_TYPE_MAP[sharingTypeDisplay] || 1;
  
  const formData = {
    joiningDate: document.getElementById('joiningDate').value,
    building: document.getElementById('building').value,
    roomNo: document.getElementById('roomNo').value,
    sharingType: sharingTypeValue, // ✅ Send as NUMBER, not string
    name: document.getElementById('name').value,
    mobile: document.getElementById('mobile').value,
    advancePayment: parseFloat(document.getElementById('advancePayment').value),
    paymentAmount: parseFloat(document.getElementById('paymentAmount').value),
    monthlyPaymentStatus: status,
    monthlyPaymentDate: document.getElementById('monthlyPaymentDate').value || null,
    upcomingPaymentDueDate: document.getElementById('upcomingPaymentDueDate').value || null,
    daysLeft: document.getElementById('daysLeft').value || null,
    roomVacate: document.getElementById('roomVacate').value,
    remarks: document.getElementById('remarks').value || null,
    isCurrentCycleClosed: status === 'Paid'
  };
  
  try {
    let result;
    if (isEditMode) {
      result = await DB.updateGuest(currentGuestId, formData);
    } else {
      result = await DB.addGuest(formData);
    }
    
    if (result.success) {
      showAlert(isEditMode ? 'Guest updated successfully!' : 'Guest added successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'guest-list.html';
      }, 1500);
    } else {
      showAlert('Error: ' + result.error, 'danger');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showAlert('An error occurred while saving guest data!', 'danger');
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.getElementById('alertMessage');
  if (!alertDiv) return;
  
  const bgColor = {
    'success': '#d4edda',
    'danger': '#f8d7da',
    'warning': '#fff3cd',
    'info': '#d1ecf1'
  }[type] || '#d1ecf1';
  
  const textColor = {
    'success': '#155724',
    'danger': '#721c24',
    'warning': '#856404',
    'info': '#0c5460'
  }[type] || '#0c5460';
  
  const borderColor = {
    'success': '#c3e6cb',
    'danger': '#f5c6cb',
    'warning': '#ffeeba',
    'info': '#bee5eb'
  }[type] || '#bee5eb';
  
  alertDiv.innerHTML = `
    <div style="background: ${bgColor}; color: ${textColor}; padding: 12px; border-radius: 8px; border: 1px solid ${borderColor}; margin-bottom: 15px;">
      ${message}
    </div>
  `;
}

// Auto-save functionality (every 30 seconds)
let autoSaveInterval;

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    const formData = new FormData(document.getElementById('guestForm'));
    const data = Object.fromEntries(formData);
    localStorage.setItem('guestFormAutoSave', JSON.stringify(data));
    console.log('Form auto-saved');
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
}

// Load auto-saved data if exists
function loadAutoSave() {
  const saved = localStorage.getItem('guestFormAutoSave');
  if (saved && !isEditMode) {
    const shouldRestore = confirm('Found auto-saved form data. Would you like to restore it?');
    if (shouldRestore) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          element.value = data[key];
        }
      });
    }
  }
  localStorage.removeItem('guestFormAutoSave');
}

// Initialize auto-save
if (!isEditMode) {
  setTimeout(() => {
    loadAutoSave();
    startAutoSave();
  }, 1000);
}

// Clear auto-save on successful submit
document.getElementById('guestForm').addEventListener('submit', () => {
  stopAutoSave();
  localStorage.removeItem('guestFormAutoSave');
});
