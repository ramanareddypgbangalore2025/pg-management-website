// ============================================
// Supabase Client Initialization
// ============================================

// Use different variable name to avoid conflicts with window.supabase library
let supabaseClient = null;  // ✅ FIXED - was "let supabase = null"

function initSupabase() {
  try {
    const config = window.SUPABASE_CONFIG;
    
    if (!config || !config.url || !config.anonKey) {
      console.error("❌ Supabase configuration missing");
      return false;
    }
    
    if (typeof window.supabase?.createClient !== "function") {
      console.error("❌ Supabase library not loaded");
      return false;
    }
    
    supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    console.log("✅ Supabase client initialized");
    return true;
  } catch (error) {
    console.error("❌ Error initializing Supabase:", error);
    return false;
  }
}

// Check if client is initialized before any DB call
function checkClient() {
  if (!supabaseClient) {
    console.error("❌ Supabase client not initialized");
    return false;
  }
  return true;
}

// ============================================
// Database operations
// ============================================

const DB = {
  // Get all guests
  async getGuests() {
    if (!checkClient()) return [];
    try {
      const { data, error } = await supabaseClient
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("❌ Error fetching guests:", error);
      return [];
    }
  },

  // Get guest by ID
  async getGuestById(id) {
    if (!checkClient()) return null;
    try {
      const { data, error } = await supabaseClient
        .from("guests")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("❌ Error fetching guest:", error);
      return null;
    }
  },

  // Add new guest
  async addGuest(guestData) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { data, error } = await supabaseClient
        .from("guests")
        .insert([guestData])
        .select();
      if (error) throw error;
      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error("❌ Error adding guest:", error);
      return { success: false, error: error.message };
    }
  },

  // Update guest
  async updateGuest(id, guestData) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { data, error } = await supabaseClient
        .from("guests")
        .update(guestData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error("❌ Error updating guest:", error);
      return { success: false, error: error.message };
    }
  },

  // Update payment status
  async updateGuestStatus(id, status) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { error } = await supabaseClient
        .from("guests")
        .update({ monthlyPaymentStatus: status })
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating guest status:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete guest
  async deleteGuest(id) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { error } = await supabaseClient
        .from("guests")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting guest:", error);
      return { success: false, error: error.message };
    }
  },

  // Log admin login
  async logLogin(username) {
    if (!checkClient()) return null;
    try {
      const { data, error } = await supabaseClient
        .from("login_history")
        .insert([{ username, login_time: new Date().toISOString() }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error("❌ Error logging login:", error);
      return null;
    }
  },

  // Update logout time
  async logLogout(sessionId) {
    if (!checkClient()) return false;
    try {
      const { error } = await supabaseClient
        .from("login_history")
        .update({ logout_time: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("❌ Error logging logout:", error);
      return false;
    }
  },

  // Get login history
  async getLoginHistory() {
    if (!checkClient()) return [];
    try {
      const { data, error } = await supabaseClient
        .from("login_history")
        .select("*")
        .order("login_time", { ascending: false });
      if (error) throw error;
      const all = data || [];
      if (all.length > 5) {
        const toDeleteIds = all.slice(5).map(row => row.id);
        await supabaseClient.from("login_history").delete().in("id", toDeleteIds);
      }
      return all.slice(0, 5);
    } catch (error) {
      console.error("❌ Error fetching login history:", error);
      return [];
    }
  },

  // Save backup
  async saveBackup(backupData) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { data, error } = await supabaseClient
        .from("backups")
        .insert([{ backup_date: new Date().toISOString(), data: backupData, type: "manual" }])
        .select();
      if (error) throw error;
      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error("❌ Error saving backup:", error);
      return { success: false, error: error.message };
    }
  },

  // Get backups
  async getBackups() {
    if (!checkClient()) return [];
    try {
      const { data, error } = await supabaseClient
        .from("backups")
        .select("*")
        .order("backup_date", { ascending: false });
      if (error) throw error;
      const all = data || [];
      if (all.length > 3) {
        const toDeleteIds = all.slice(3).map(row => row.id);
        await supabaseClient.from("backups").delete().in("id", toDeleteIds);
      }
      return all.slice(0, 3);
    } catch (error) {
      console.error("❌ Error fetching backups:", error);
      return [];
    }
  },

  // Get room capacity
  async getRoomCapacity() {
    if (!checkClient()) return [];
    try {
      const { data, error } = await supabaseClient.from("room_capacity").select("*");
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("❌ Error fetching room capacity:", error);
      return [];
    }
  },

  // Upsert room capacity
  async upsertRoomCapacity({ building, roomNo, sharingType, capacity }) {
    if (!checkClient()) return { success: false, error: "Client not initialized" };
    try {
      const { data, error } = await supabaseClient
        .from("room_capacity")
        .upsert({ building, room_no: roomNo, sharing_type: sharingType, capacity, updated_at: new Date().toISOString() }, 
                { onConflict: "building,room_no,sharing_type" });
      if (error) throw error;
      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error("❌ Error upserting room capacity:", error);
      return { success: false, error: error.message };
    }
  },

  // Convert room capacity rows to map
  convertRoomCapacityToMap(rows) {
    const map = {};
    rows.forEach(row => {
      if (!map[row.building]) map[row.building] = {};
      if (!map[row.building][row.room_no]) map[row.building][row.room_no] = {};
      map[row.building][row.room_no][row.sharing_type] = row.capacity;
    });
    return map;
  }
};

// Expose globally
window.DB = DB;
window.supabaseClient = { init: initSupabase };
