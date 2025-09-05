// Utility script to create an admin user
// This should be run manually by the system administrator

import { authService } from './supabase';

export const createAdminUser = async (email, password, fullName) => {
  try {
    console.log('Creating admin user...');
    
    // First, sign up the user normally
    const { data: signUpData, error: signUpError } = await authService.signUp(email, password, {
      full_name: fullName,
      role: 'admin',
      user_status: 'approved', // Admin users are auto-approved
      starting_balance: 100000,
      current_balance: 100000,
      total_trades: 0,
      wins: 0,
      losses: 0
    });

    if (signUpError) {
      console.error('Error creating admin user:', signUpError.message);
      return { success: false, error: signUpError.message };
    }

    console.log('Admin user created successfully:', {
      id: signUpData.user?.id,
      email: signUpData.user?.email,
      role: 'admin',
      status: 'approved'
    });

    return { 
      success: true, 
      user: signUpData.user,
      message: 'Admin user created successfully!' 
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: error.message };
  }
};

// Function to promote an existing user to admin
export const promoteToAdmin = async (userId) => {
  try {
    console.log('Promoting user to admin:', userId);
    
    const { data, error } = await authService.updateUserRole(userId, 'admin');
    
    if (error) {
      console.error('Error promoting user:', error.message);
      return { success: false, error: error.message };
    }

    // Also approve the user if they weren't already
    await authService.updateUserStatus(userId, 'approved');

    console.log('User promoted to admin successfully:', userId);
    return { 
      success: true, 
      message: 'User promoted to admin successfully!' 
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally for browser console access
if (typeof window !== 'undefined') {
  window.createAdminUser = createAdminUser;
  window.promoteToAdmin = promoteToAdmin;
}

// Example usage (uncomment and modify as needed):
/*
// To create a new admin user:
createAdminUser('admin@example.com', 'secure-password-123', 'System Administrator')
  .then(result => console.log(result));

// To promote an existing user to admin:
promoteToAdmin('existing-user-id')
  .then(result => console.log(result));
*/