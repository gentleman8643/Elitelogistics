/*
# Fix first admin setup

The original INSERT policy on admin_profiles only allows an existing super_admin
to create profiles, so the very first super_admin could never be created.
Anonymous visitors also cannot read admin_profiles, so the login/setup pages
could not tell whether an admin already exists.

1. admin_exists()          - public helper that reports whether any admin exists
2. handle_first_admin_signup trigger - when a user signs up from the setup page
   (metadata setup_first_admin = true) and no admin exists yet, their
   super_admin profile is created server-side. Works even when email
   confirmation is enabled (no session after signUp).
3. claim_first_admin(name) - lets an already signed-in user become the first
   super_admin, but only while no admin exists (recovers earlier failed attempts).
*/

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_profiles);
$$;

REVOKE ALL ON FUNCTION public.admin_exists() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_first_admin_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'setup_first_admin', '') = 'true' THEN
    -- Serialize concurrent setup attempts
    PERFORM pg_advisory_xact_lock(hashtext('first_admin_setup'));
    IF NOT EXISTS (SELECT 1 FROM public.admin_profiles) THEN
      INSERT INTO public.admin_profiles (id, name, role)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'super_admin');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin_signup();

CREATE OR REPLACE FUNCTION public.claim_first_admin(admin_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('first_admin_setup'));
  IF EXISTS (SELECT 1 FROM public.admin_profiles) THEN
    RETURN false;
  END IF;
  INSERT INTO public.admin_profiles (id, name, role)
  VALUES (auth.uid(), COALESCE(admin_name, ''), 'super_admin');
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin(text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_first_admin(text) TO authenticated;
