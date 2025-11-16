-- Database trigger to sync Supabase auth.users to Prisma users table
-- This function will be called automatically when a user is created or updated in Supabase Auth

-- Function to sync user from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: This assumes your Supabase project has access to the public schema
-- If you're using a different schema, adjust the table name accordingly
-- 
-- Alternative approach using Supabase Webhooks:
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create a new webhook for auth.users table
-- 3. Set the webhook URL to your Next.js API route: /api/webhooks/supabase
-- 4. Create the webhook handler in src/app/api/webhooks/supabase/route.ts
-- 5. The webhook will receive events when users are created/updated

