import { supabase } from './supabase';

// Utility to manually create an admin user
export const createAdminUser = async (email, password) => {
  try {
    console.log('Creating admin user with email:', email);
    
    // First, sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Admin signup error:', signUpError);
      return { success: false, error: signUpError.message };
    }

    console.log('Admin user created successfully:', signUpData);

    // The user profile will be automatically created by the trigger
    // but let's also manually update it to ensure admin status
    if (signUpData?.user?.id) {
      // Wait a moment for the trigger to fire
      setTimeout(async () => {
        try {
          const { data: updateData, error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
              role: 'admin', 
              status: 'approved',
              updated_at: new Date().toISOString()
            })
            .eq('id', signUpData.user.id)
            .select();

          console.log('Admin profile updated:', updateData);
        } catch (err) {
          console.error('Failed to update admin profile:', err);
        }
      }, 1000);
    }

    return { 
      success: true, 
      data: signUpData,
      message: 'Admin user created successfully! Check your email for verification if required.' 
    };
    
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: error.message };
  }
};

// Utility to promote existing user to admin
export const promoteToAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin', 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;

    console.log('User promoted to admin:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Promote to admin error:', error);
    return { success: false, error: error.message };
  }
};

// Make these available globally for browser console access
if (typeof window !== 'undefined') {
  window.adminUtils = {
    createAdminUser,
    promoteToAdmin
  };
  
  console.log('🔧 Admin utilities loaded! Use in browser console:');
  console.log('- window.adminUtils.createAdminUser("your-email@domain.com", "password123")');
  console.log('- window.adminUtils.promoteToAdmin("user-id-here")');
}