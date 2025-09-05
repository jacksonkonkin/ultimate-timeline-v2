-- Create the notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for anonymous users
-- (In production, you'd want to restrict this to authenticated users)
CREATE POLICY "Allow anonymous access" ON notes
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Or if you want separate policies for each operation:
-- CREATE POLICY "Allow read for all" ON notes FOR SELECT USING (true);
-- CREATE POLICY "Allow insert for all" ON notes FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update for all" ON notes FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow delete for all" ON notes FOR DELETE USING (true);