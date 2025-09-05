-- Fix for Row Level Security policies to avoid infinite recursion
-- Run this in your Supabase SQL Editor

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create better policies that don't cause recursion
-- Policy for users to read their own profile (this one should be fine)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile (this one should be fine)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- NEW: Policy for admins using a simpler approach
-- This checks the raw_user_meta_data directly from auth.users instead of profiles table
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy to allow inserts (for new user creation)
CREATE POLICY "Allow authenticated users to insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: Simpler approach - disable RLS temporarily for testing
-- Uncomment these lines if you want to test without RLS first:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;