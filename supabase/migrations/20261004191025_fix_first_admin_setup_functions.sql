/*
# Fix first admin setup: database functions + trigger

## Problem
1. If Supabase email confirmation is ON, signUp does not create a session.
   The profile insert runs as anon (auth.uid() = null) and fails RLS.
2. The setup page can't recover from earlier failed attempts — email already
   registered but no profile row exists.
3. "Add Admin" in Settings calls signUp from the browser, replacing the
   super-admin's session with the new user's session, causing the profile
   insert to run as the wrong user.

## Solution
Three database-level functions:

1. `admin_exists()` — SECURITY DEFINER, callable by anon. Returns boolean.
   Lets login/setup pages check if any admin exists without exposing data.

2. `claim_first_admin(p_name text)` — SECURITY DEFINER, callable by authenticated.
   Inserts a super_admin row for the calling user, but ONLY if no admin exists
   yet. Handles the email-confirmation case: after user confirms and logs in,
   they call this to finish setup.

3. Trigger on auth.users INSERT — if no admin exists, auto-creates a super_admin
   profile for the new user. Works whether or not email confirmation is on.

## Security
- `admin_exists()` only returns a boolean, no data is exposed.
- `claim_first_admin()` only works when zero admins exist (bootstrap), and
  only for the calling authenticated user's own UID.
- The trigger only fires when no super_admin exists, and only sets role to
  super_admin for the very first user.
*/

-- 1. admin_exists() — lets anon check if any admin exists
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admin_profiles LIMIT 1);
$$;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- 2. claim_first_admin(p_name) — authenticated user claims first admin role
CREATE OR REPLACE FUNCTION public.claim_first_admin(p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only works if no admin exists yet
  IF EXISTS (SELECT 1 FROM admin_profiles LIMIT 1) THEN
    RAISE EXCEPTION 'An admin account already exists';
  END IF;

  -- Insert the calling user as super_admin
  INSERT INTO admin_profiles (id, name, role)
  VALUES (auth.uid(), COALESCE(p_name, ''), 'super_admin')
  ON CONFLICT (id) DO UPDATE SET name = COALESCE(p_name, admin_profiles.name);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin(text) TO authenticated;

-- 3. Trigger: auto-create super_admin on first signup
CREATE OR REPLACE FUNCTION public.handle_new_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if no admin exists yet (first-user bootstrap)
  IF NOT EXISTS (SELECT 1 FROM admin_profiles LIMIT 1) THEN
    INSERT INTO admin_profiles (id, name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'super_admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_first_user() TO supabase_admin;

DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_first_user();
