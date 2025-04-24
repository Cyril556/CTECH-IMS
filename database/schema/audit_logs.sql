-- Audit logs table for tracking important system events
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'user_login', 'user_creation', 'user_update', etc.
  user_id UUID REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id), -- For user-related actions
  details JSONB, -- Additional event details
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Add RLS policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins (can read all audit logs)
CREATE POLICY admin_read_audit_logs ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy for inserting audit logs (anyone authenticated can create audit logs)
CREATE POLICY insert_audit_logs ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to automatically add audit logs for user-related actions
CREATE OR REPLACE FUNCTION public.fn_audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (event_type, user_id, target_user_id, details)
    VALUES ('user_creation', auth.uid(), NEW.id, jsonb_build_object('email', NEW.email, 'role', NEW.role, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if important fields changed
    IF NEW.role != OLD.role OR NEW.status != OLD.status OR NEW.password_reset_required != OLD.password_reset_required THEN
      INSERT INTO public.audit_logs (event_type, user_id, target_user_id, details)
      VALUES (
        'user_update', 
        auth.uid(), 
        NEW.id, 
        jsonb_build_object(
          'changes', jsonb_build_object(
            'role', CASE WHEN NEW.role != OLD.role THEN jsonb_build_object('old', OLD.role, 'new', NEW.role) ELSE NULL END,
            'status', CASE WHEN NEW.status != OLD.status THEN jsonb_build_object('old', OLD.status, 'new', NEW.status) ELSE NULL END,
            'password_reset_required', CASE WHEN NEW.password_reset_required != OLD.password_reset_required THEN jsonb_build_object('old', OLD.password_reset_required, 'new', NEW.password_reset_required) ELSE NULL END
          )
        )
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user changes
CREATE TRIGGER trg_audit_user_changes
AFTER INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_user_changes();
