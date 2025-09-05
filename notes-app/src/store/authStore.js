import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../utils/supabase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      userProfile: null, // New: user profile from user_profiles table
      isLoading: true,
      isAuthenticated: false,
      error: null,
      _initialized: false,
      _listenerSetup: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),
      
      setSession: (session) => set({ 
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        error: null
      }),

      setUserProfile: (userProfile) => set({ userProfile }),

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Sign up
      signUp: async (email, password, userData = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.signUp(email, password, {
            full_name: userData.fullName || '',
            avatar_url: userData.avatarUrl || '',
            // Initial trading profile data
            starting_balance: 100000, // $100k virtual money
            current_balance: 100000,
            total_trades: 0,
            wins: 0,
            losses: 0,
            // Admin system
            role: 'user',
            user_status: 'pending',
            ...userData
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          if (data.user) {
            set({ 
              user: data.user, 
              session: data.session,
              isAuthenticated: !!data.user,
              isLoading: false 
            });
            
            // Load user profile
            await get().loadUserProfile();
          }

          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'An unexpected error occurred';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      // Sign in
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.signIn(email, password);

          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: true,
            isLoading: false 
          });

          // Load user profile
          await get().loadUserProfile();

          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to sign in';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await authService.signOut();
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { error };
          }

          set({ 
            user: null, 
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          return { error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to sign out';
          set({ error: errorMessage, isLoading: false });
          return { error: { message: errorMessage } };
        }
      },

      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.resetPassword(email);
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          set({ isLoading: false });
          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to send reset email';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      // Update profile
      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.updateProfile(updates);
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          set({ 
            user: { ...get().user, ...data.user },
            isLoading: false 
          });

          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to update profile';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      // Load user profile from user_profiles table
      loadUserProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await authService.getCurrentUserProfile();
          if (!error && data) {
            set({ userProfile: data });
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      },

      // Initialize auth state
      initialize: async () => {
        const state = get();
        // Prevent multiple initializations
        if (state._initialized) {
          return;
        }
        
        set({ isLoading: true, _initialized: true });
        
        try {
          const { data, error } = await authService.getSession();
          
          if (error) {
            console.error('Failed to get session:', error);
            set({ 
              user: null, 
              session: null, 
              userProfile: null,
              isAuthenticated: false,
              isLoading: false 
            });
            return;
          }

          const session = data.session;
          set({ 
            user: session?.user || null, 
            session,
            isAuthenticated: !!session?.user,
            isLoading: false 
          });

          // Load user profile if authenticated
          if (session?.user) {
            await get().loadUserProfile();
          }

          // Set up auth state listener only once
          if (!state._listenerSetup) {
            authService.onAuthStateChange(async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.email);
              
              set({ 
                user: session?.user || null, 
                session,
                isAuthenticated: !!session?.user,
                isLoading: false 
              });

              // Load profile for new session
              if (session?.user) {
                await get().loadUserProfile();
              } else {
                set({ userProfile: null });
              }
            });
            
            set({ _listenerSetup: true });
          }

        } catch (err) {
          console.error('Auth initialization error:', err);
          set({ 
            user: null, 
            session: null, 
            userProfile: null,
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      // Get user profile data
      getUserProfile: () => {
        const state = get();
        const { user } = state;
        if (!user) return null;
        
        return {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          startingBalance: user.user_metadata?.starting_balance || 100000,
          currentBalance: user.user_metadata?.current_balance || 100000,
          totalTrades: user.user_metadata?.total_trades || 0,
          wins: user.user_metadata?.wins || 0,
          losses: user.user_metadata?.losses || 0,
          role: user.user_metadata?.role || 'user',
          userStatus: user.user_metadata?.user_status || 'pending',
          createdAt: user.created_at
        };
      },

      // Admin functions
      isAdmin: () => {
        const { userProfile } = get();
        return userProfile?.role === 'admin' && userProfile?.status === 'approved';
      },

      isApproved: () => {
        const { userProfile } = get();
        return userProfile?.status === 'approved';
      },

      // Admin actions (simplified for auth-only approach)
      getAllUsers: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.getAllUsers();
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          set({ isLoading: false });
          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to fetch users';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      approveUser: async (userId) => {
        set({ isLoading: true, error: null });
        
        try {
          // For auth-only approach, we can only update current user
          // In a real app, this would need server-side admin functions
          const { data, error } = await authService.updateUserStatus(userId, 'approved');
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          // Update local state if it's the current user
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            set({
              user: {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  user_status: 'approved'
                }
              }
            });
          }

          set({ isLoading: false });
          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to approve user';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      },

      updateUserRole: async (userId, role) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await authService.updateUserRole(userId, role);
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { data: null, error };
          }

          // Update local state if it's the current user
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            set({
              user: {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  role: role
                }
              }
            });
          }

          set({ isLoading: false });
          return { data, error: null };
        } catch (err) {
          const errorMessage = err.message || 'Failed to update user role';
          set({ error: errorMessage, isLoading: false });
          return { data: null, error: { message: errorMessage } };
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);