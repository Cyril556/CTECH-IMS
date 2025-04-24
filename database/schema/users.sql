-- Users table for authentication and authorization
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- This should be hashed
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff', -- 'admin' or 'staff'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', or 'locked'
  password_reset_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for admins (can do anything)
CREATE POLICY admin_all_users ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy for staff (can only read/update their own record)
CREATE POLICY staff_own_user ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY staff_update_own_user ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Insert some default users (password is 'password' - this would be hashed in production)
INSERT INTO public.users (email, password, full_name, role, status)
VALUES 
  ('admin@ctech.com', 'admin123', 'Admin User', 'admin', 'active'),
  ('demo@ctech.com', 'demo123', 'Demo User', 'staff', 'active')
ON CONFLICT (email) DO NOTHING;
