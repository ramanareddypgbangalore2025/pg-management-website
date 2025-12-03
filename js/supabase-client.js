// ============================================
// Supabase Client Initialization
// ============================================

// Global Supabase instance
let supabase = null;

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

        supabase = window.supabase.createClient(config.url, config.anonKey);

        console.log("✅ Supabase client initialized");
        return true;
    } catch (error) {
        console.error("❌ Error initializing Supabase:", error);
        return false;
    }
}

// Check if client is initialized before any DB call
function checkClient() {
    if (!supabase) {
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
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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
            const { data, error } = await supabase
                .from("guests")
                .insert([guestData])
                .select();

            if (error) throw error;

            return {
                success: true,
                data: data?.[0] || null
            };
        } catch (error) {
            console.error("❌ Error adding guest:", error);
            return { success: false, error: error.message };
        }
    },

    // Update guest
    async updateGuest(id, guestData) {
        if (!checkClient()) return { success: false, error: "Client not initialized" };

        try {
            const { data, error } = await supabase
                .from("guests")
                .update(guestData)
                .eq("id", id)
                .select();

            if (error) throw error;

            return {
                success: true,
                data: data?.[0] || null
            };
        } catch (error) {
            console.error("❌ Error updating guest:", error);
            return { success: false, error: error.message };
        }
    },

    // Update only payment status (used for auto Breached)
    async updateGuestStatus(id, status) {
        if (!checkClient()) return { success: false, error: "Client not initialized" };

        try {
            const { error } = await supabase
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
            const { error } = await supabase
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
            const { data, error } = await supabase
                .from("login_history")
                .insert([{
                    username,
                    login_time: new Date().toISOString()
                }])
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
            const { error } = await supabase
                .from("login_history")
                .update({
                    logout_time: new Date().toISOString()
                })
                .eq("id", sessionId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error("❌ Error logging logout:", error);
            return false;
        }
    },

// Get login history (keep only latest 5)
async getLoginHistory() {
    if (!checkClient()) return [];

    try {
        // 1) Fetch all history, newest first
        const { data, error } = await supabase
            .from("login_history")
            .select("*")
            .order("login_time", { ascending: false });

        if (error) throw error;

        const all = data || [];

        // 2) If more than 5, delete the older ones
        if (all.length > 5) {
            const toDeleteIds = all.slice(5).map(row => row.id);
            const { error: delError } = await supabase
                .from("login_history")
                .delete()
                .in("id", toDeleteIds);

            if (delError) {
                console.error("❌ Error pruning old login history:", delError);
            }
        }

        // 3) Return latest 5 to UI
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
            const { data, error } = await supabase
                .from("backups")
                .insert([{
                    backup_date: new Date().toISOString(),
                    data: backupData,
                    type: "manual"
                }])
                .select();

            if (error) throw error;

            return {
                success: true,
                data: data?.[0] || null
            };
        } catch (error) {
            console.error("❌ Error saving backup:", error);
            return { success: false, error: error.message };
        }
    },

   // Get backups (keep only latest 1)
async getBackups() {
    if (!checkClient()) return [];

    try {
        // 1) Fetch all backups, newest first
        const { data, error } = await supabase
            .from("backups")
            .select("*")
            .order("backup_date", { ascending: false });

        if (error) throw error;

        const all = data || [];

        // 2) If more than 1, delete the older ones
        if (all.length > 1) {
            const toDeleteIds = all.slice(1).map(row => row.id);
            const { error: delError } = await supabase
                .from("backups")
                .delete()
                .in("id", toDeleteIds);

            if (delError) {
                console.error("❌ Error pruning old backups:", delError);
            }
        }

        // 3) Return latest 1 to UI
        return all.slice(0, 1);
    } catch (error) {
        console.error("❌ Error fetching backups:", error);
        return [];
    }
}
};

// Expose globally
window.DB = DB;
window.supabaseClient = { init: initSupabase };
