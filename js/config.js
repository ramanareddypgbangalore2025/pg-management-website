// ============================================
// Supabase Configuration
// ============================================
// Replace these values with your actual Supabase project credentials

const SUPABASE_CONFIG = {
  url: 'https://temfpakqmqkdvdyhgetz.supabase.co', // Example: https://xyzcompany.supabase.co
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbWZwYWtxbXFrZHZkeWhnZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTgwNDgsImV4cCI6MjA4MDI3NDA0OH0.VKbNOzSqQDOb7o1_jvh0zIzRUIkwhznD1l-khiOv4fc', // Your anon/public key
};

// Hardcoded Admin Credentials
const ADMIN_USERS = [
  {
    username: 'admin1',
    password: 'Admin@123',
    role: 'Primary Administrator'
  },
  {
    username: 'admin2',
    password: 'Admin@456',
    role: 'Secondary Administrator'
  }
];

// Room Configuration
const ROOM_CONFIG = {
  'Building-1': {
    floors: ['G', '1', '2', '3', '4'],
    roomsPerFloor: 3
  },
  'Building-2': {
    floors: ['G', '1', '2', '3', '4'],
    roomsPerFloor: 3
  }
};

// Generate room numbers
function generateRooms(building) {
  const config = ROOM_CONFIG[building];
  const rooms = [];
  config.floors.forEach((floor, floorIndex) => {
    for (let i = 1; i <= config.roomsPerFloor; i++) {
      const roomNo = floor === 'G' ? `G0${i}` : `${floorIndex}0${i}`;
      rooms.push(roomNo);
    }
  });
  return rooms;
}

// ============================================
// Default Per-Room Capacity Configuration (NEW)
// ============================================
// Max beds per sharing type (1, 2, 3 Sharing) for each room
// Initial values: 1/2/3 beds respectively
// Can be changed dynamically via room-status UI (+/- buttons per room+sharing)
// Stored per (building, roomNo, sharingType) for granular control

const DEFAULT_ROOM_CAPACITY = {
  'Building-1': {
    'G01': { 1: 1, 2: 2, 3: 3 },
    '101': { 1: 1, 2: 2, 3: 3 },
    '102': { 1: 1, 2: 2, 3: 3 },
    '103': { 1: 1, 2: 2, 3: 3 },
    '201': { 1: 1, 2: 2, 3: 3 },
    '202': { 1: 1, 2: 2, 3: 3 },
    '203': { 1: 1, 2: 2, 3: 3 },
    '301': { 1: 1, 2: 2, 3: 3 },
    '302': { 1: 1, 2: 2, 3: 3 },
    '303': { 1: 1, 2: 2, 3: 3 },
    '401': { 1: 1, 2: 2, 3: 3 }
  },
  'Building-2': {
    'G02': { 1: 1, 2: 2, 3: 3 },
    '104': { 1: 1, 2: 2, 3: 3 },
    '105': { 1: 1, 2: 2, 3: 3 },
    '106': { 1: 1, 2: 2, 3: 3 },
    '204': { 1: 1, 2: 2, 3: 3 },
    '205': { 1: 1, 2: 2, 3: 3 },
    '206': { 1: 1, 2: 2, 3: 3 },
    '304': { 1: 1, 2: 2, 3: 3 },
    '305': { 1: 1, 2: 2, 3: 3 },
    '306': { 1: 1, 2: 2, 3: 3 },
    '402': { 1: 1, 2: 2, 3: 3 }
  }
};

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_USERS = ADMIN_USERS;
window.ROOM_CONFIG = ROOM_CONFIG;
window.generateRooms = generateRooms;
window.DEFAULT_ROOM_CAPACITY = DEFAULT_ROOM_CAPACITY;
