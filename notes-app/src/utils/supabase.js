import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helper functions
export const authService = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Get current user profile with role and status
  async getCurrentUserProfile() {
    try {
      const { data: user, error: userError } = await this.getUser();
      if (userError || !user?.user) return { data: null, error: userError };

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      return { data: profile, error: profileError };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check if current user is admin
  async isAdmin() {
    try {
      const { data: profile, error } = await this.getCurrentUserProfile();
      if (error || !profile) return false;
      return profile.role === 'admin' && profile.status === 'approved';
    } catch (error) {
      return false;
    }
  },

  // Admin functions - only work if current user is admin
  async getAllUsers() {
    try {
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { data: null, error: { message: 'Unauthorized: Admin access required' } };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('getAllUsers error:', error);
      return { data: null, error };
    }
  },

  async updateUserStatus(userId, status) {
    try {
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { data: null, error: { message: 'Unauthorized: Admin access required' } };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUserRole(userId, role) {
    try {
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { data: null, error: { message: 'Unauthorized: Admin access required' } };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get pending users for approval
  async getPendingUsers() {
    try {
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { data: null, error: { message: 'Unauthorized: Admin access required' } };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Approve user
  async approveUser(userId) {
    return this.updateUserStatus(userId, 'approved');
  },

  // Reject user
  async rejectUser(userId) {
    return this.updateUserStatus(userId, 'rejected');
  }
};