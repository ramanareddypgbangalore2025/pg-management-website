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

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_USERS = ADMIN_USERS;
window.ROOM_CONFIG = ROOM_CONFIG;
window.generateRooms = generateRooms;
