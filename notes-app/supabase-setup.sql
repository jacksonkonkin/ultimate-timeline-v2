-- Create the notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for anonymous users
-- (In production, you'd want to restrict this to authenticated users)
CREATE POLICY "Allow anonymous access" ON notes
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, status)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email IN ('admin@tradingsim.com', 'admin@localhost.com') THEN 'admin'
      ELSE 'user'
    END,
    CASE 
      WHEN new.email IN ('admin@tradingsim.com', 'admin@localhost.com') THEN 'approved'
      ELSE 'pending'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Or if you want separate policies for each operation:
-- CREATE POLICY "Allow read for all" ON notes FOR SELECT USING (true);
-- CREATE POLICY "Allow insert for all" ON notes FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update for all" ON notes FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow delete for all" ON notes FOR DELETE USING (true);