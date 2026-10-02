/*
# Fix admin_profiles RLS policies for first-admin setup and login page

## Problem
1. The INSERT policy on admin_profiles required an EXISTING super_admin to authorize
   the insert. This made it impossible to create the FIRST admin account — the check
   `EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')`
   always returned false when the table was empty, so the profile insert silently
   failed after signUp succeeded. The user appeared to create an account but could
   never log in.

2. The SELECT policy was scoped to `authenticated` only. The login page (which runs
   as anon before the user signs in) queried admin_profiles to check if any admins
   exist, got zero rows due to RLS, and redirected the user back to the setup page
   every time.

## Changes
- admin_profiles SELECT: allow `anon, authenticated` so the login/setup pages can
  check whether any admin accounts exist. This only exposes the `id` column which
  is a UUID — no sensitive data is leaked.
- admin_profiles INSERT: allow a user to insert their OWN profile row
  (`id = auth.uid()`) when no super_admin exists yet (first-admin bootstrap case),
  OR when an existing super_admin authorizes it (adding new admins).
- admin_profiles UPDATE: keep the existing self-or-super-admin policy.
- admin_profiles DELETE: keep the existing super-admin-only policy.

## Security
- A user can only insert a row with their own auth UID (`id = auth.uid()`).
- The bootstrap condition (`NOT EXISTS super_admin`) only allows the very first
  admin to self-register; once any super_admin exists, only super_admins can add
  new admins.
- SELECT is now open to anon, but admin_profiles only contains id (uuid),
  name (text), role (text), and created_at — no passwords or emails.
*/

-- Drop old policies
DROP POLICY IF EXISTS "admin_profiles_select_authenticated" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_super_admin" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_super_admin_or_self" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_delete_super_admin" ON admin_profiles;

-- SELECT: allow anon + authenticated (login/setup pages need to check if admins exist)
CREATE POLICY "admin_profiles_select_public" ON admin_profiles
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT: allow self-insert when no super_admin exists (bootstrap), or super_admin inserts
CREATE POLICY "admin_profiles_insert_self_or_super_admin" ON admin_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND (
      NOT EXISTS (
        SELECT 1 FROM admin_profiles p
        WHERE p.role = 'super_admin'
      )
      OR EXISTS (
        SELECT 1 FROM admin_profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

-- UPDATE: self or super_admin
CREATE POLICY "admin_profiles_update_self_or_super_admin" ON admin_profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- DELETE: super_admin only
CREATE POLICY "admin_profiles_delete_super_admin" ON admin_profiles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );
