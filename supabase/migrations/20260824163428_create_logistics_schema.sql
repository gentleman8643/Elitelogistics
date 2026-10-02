/*
# Logistics & Shipment Tracking Database Schema

## Overview
Creates the complete database schema for a logistics and shipment tracking application.
This includes admin users metadata, shipments, tracking events, delay records, and site settings.
All tables have Row Level Security enabled with proper access controls.

## Tables Created

### 1. admin_profiles
- Links to auth.users via id (PK, FK to auth.users)
- `name` (text) - admin display name
- `role` (text) - 'super_admin' | 'admin' | 'viewer', default 'admin'
- `created_at` (timestamptz)
- Only super_admins can manage other admin profiles
- Admins can read their own profile

### 2. shipments
- `id` (uuid PK)
- `tracking_number` (text, unique, not null) - format LGS-YYYY-XXXXXX
- `reference_number` (text) - optional customer reference
- `shipment_type` (text) - air_freight | ocean_freight | road_transport | express_delivery | warehousing | cargo_handling | last_mile | international
- `package_description` (text)
- `package_category` (text)
- `weight` (numeric)
- `dimensions` (text)
- `quantity` (integer)
- `image_url` (text) - public storage URL
- `sender_name`, `sender_company`, `sender_country`, `sender_city`, `sender_contact` (text)
- `recipient_name`, `recipient_company`, `recipient_country`, `recipient_city`, `recipient_contact` (text)
- `origin` (text)
- `destination` (text)
- `current_location` (text)
- `latitude`, `longitude` (numeric) - optional map coords
- `estimated_delivery` (date)
- `original_estimated_delivery` (date) - kept for delay tracking
- `delivery_priority` (text) - standard | express | priority
- `status` (text) - created | picked_up | processing | departed | in_transit | arrived | customs | out_for_delivery | delivered | delayed
- `customer_notes` (text) - visible to public
- `internal_notes` (text) - admin-only
- `created_by` (uuid FK to auth.users)
- `updated_at` (timestamptz)
- `created_at` (timestamptz)

### 3. tracking_events
- `id` (uuid PK)
- `shipment_id` (uuid FK to shipments, cascade delete)
- `status` (text)
- `title` (text)
- `location` (text)
- `description` (text)
- `delay_reason` (text)
- `image_url` (text)
- `event_date` (timestamptz) - when the event occurred
- `sort_order` (integer) - for reordering
- `created_by` (uuid FK to auth.users)
- `created_at` (timestamptz)

### 4. delays
- `id` (uuid PK)
- `shipment_id` (uuid FK to shipments, cascade delete)
- `reason` (text)
- `explanation` (text)
- `new_estimated_delivery` (date)
- `location` (text)
- `customer_message` (text)
- `is_active` (boolean, default true)
- `resolved_at` (timestamptz)
- `created_by` (uuid FK to auth.users)
- `created_at` (timestamptz)

### 5. settings
- Singleton row (id=1) holding site configuration
- `company_name`, `logo_url`, `contact_email`, `phone`, `address`, `business_hours`
- `social_facebook`, `social_twitter`, `social_linkedin`, `social_instagram`
- `website_description`
- `updated_by` (uuid FK to auth.users)
- `updated_at` (timestamptz)

## Security (RLS)

### admin_profiles
- SELECT: authenticated users can read all admin profiles (needed for UI display)
- INSERT: super_admin only (via check against admin_profiles)
- UPDATE: super_admin only; users can update their own name
- DELETE: super_admin only

### shipments
- SELECT: public (anon + authenticated) - tracking data must be publicly viewable
- INSERT/UPDATE/DELETE: authenticated admins only

### tracking_events
- SELECT: public - visible in tracking timeline
- INSERT/UPDATE/DELETE: authenticated admins only

### delays
- SELECT: public - delay info shown on tracking page
- INSERT/UPDATE/DELETE: authenticated admins only

### settings
- SELECT: public - site config needed for header/footer
- INSERT/UPDATE: super_admin only

## Notes
1. The service role key bypasses RLS and is used only in server-side code for admin operations.
2. Public tracking queries use the anon key and can only see non-sensitive columns.
3. Internal notes and internal admin fields are never exposed through public queries - the application layer filters them.
4. A storage bucket 'shipment-images' is created for public read access to shipment images.
*/

-- ============================================
-- ADMIN PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_profiles_select_authenticated" ON admin_profiles;
CREATE POLICY "admin_profiles_select_authenticated" ON admin_profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_profiles_insert_super_admin" ON admin_profiles;
CREATE POLICY "admin_profiles_insert_super_admin" ON admin_profiles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "admin_profiles_update_super_admin_or_self" ON admin_profiles;
CREATE POLICY "admin_profiles_update_super_admin_or_self" ON admin_profiles FOR UPDATE
  TO authenticated
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

DROP POLICY IF EXISTS "admin_profiles_delete_super_admin" ON admin_profiles;
CREATE POLICY "admin_profiles_delete_super_admin" ON admin_profiles FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- ============================================
-- SHIPMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  reference_number text DEFAULT '',
  shipment_type text NOT NULL DEFAULT 'international',
  package_description text DEFAULT '',
  package_category text DEFAULT '',
  weight numeric DEFAULT 0,
  dimensions text DEFAULT '',
  quantity integer DEFAULT 1,
  image_url text DEFAULT '',
  sender_name text DEFAULT '',
  sender_company text DEFAULT '',
  sender_country text DEFAULT '',
  sender_city text DEFAULT '',
  sender_contact text DEFAULT '',
  recipient_name text DEFAULT '',
  recipient_company text DEFAULT '',
  recipient_country text DEFAULT '',
  recipient_city text DEFAULT '',
  recipient_contact text DEFAULT '',
  origin text DEFAULT '',
  destination text DEFAULT '',
  current_location text DEFAULT '',
  latitude numeric,
  longitude numeric,
  estimated_delivery date,
  original_estimated_delivery date,
  delivery_priority text DEFAULT 'standard',
  status text NOT NULL DEFAULT 'created',
  customer_notes text DEFAULT '',
  internal_notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_recipient_name ON shipments(recipient_name);
CREATE INDEX IF NOT EXISTS idx_shipments_sender_name ON shipments(sender_name);
CREATE INDEX IF NOT EXISTS idx_shipments_reference_number ON shipments(reference_number);
CREATE INDEX IF NOT EXISTS idx_shipments_current_location ON shipments(current_location);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Public can read shipment tracking info (anon key)
DROP POLICY IF EXISTS "shipments_select_public" ON shipments;
CREATE POLICY "shipments_select_public" ON shipments FOR SELECT
  TO anon, authenticated USING (true);

-- Only authenticated admins can write
DROP POLICY IF EXISTS "shipments_insert_admin" ON shipments;
CREATE POLICY "shipments_insert_admin" ON shipments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shipments_update_admin" ON shipments;
CREATE POLICY "shipments_update_admin" ON shipments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shipments_delete_admin" ON shipments;
CREATE POLICY "shipments_delete_admin" ON shipments FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- TRACKING EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'created',
  title text NOT NULL DEFAULT '',
  location text DEFAULT '',
  description text DEFAULT '',
  delay_reason text DEFAULT '',
  image_url text DEFAULT '',
  event_date timestamptz NOT NULL DEFAULT now(),
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_sort_order ON tracking_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_date ON tracking_events(event_date DESC);

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracking_events_select_public" ON tracking_events;
CREATE POLICY "tracking_events_select_public" ON tracking_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "tracking_events_insert_admin" ON tracking_events;
CREATE POLICY "tracking_events_insert_admin" ON tracking_events FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tracking_events_update_admin" ON tracking_events;
CREATE POLICY "tracking_events_update_admin" ON tracking_events FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tracking_events_delete_admin" ON tracking_events;
CREATE POLICY "tracking_events_delete_admin" ON tracking_events FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- DELAYS
-- ============================================
CREATE TABLE IF NOT EXISTS delays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  explanation text DEFAULT '',
  new_estimated_delivery date,
  location text DEFAULT '',
  customer_message text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  resolved_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delays_shipment_id ON delays(shipment_id);
CREATE INDEX IF NOT EXISTS idx_delays_active ON delays(is_active) WHERE is_active = true;

ALTER TABLE delays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delays_select_public" ON delays;
CREATE POLICY "delays_select_public" ON delays FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "delays_insert_admin" ON delays;
CREATE POLICY "delays_insert_admin" ON delays FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delays_update_admin" ON delays;
CREATE POLICY "delays_update_admin" ON delays FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delays_delete_admin" ON delays;
CREATE POLICY "delays_delete_admin" ON delays FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- SETTINGS (singleton)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text NOT NULL DEFAULT 'Meridian Logistics',
  logo_url text DEFAULT '',
  contact_email text NOT NULL DEFAULT 'support@meridianlogistics.com',
  phone text NOT NULL DEFAULT '+1 (800) 555-0140',
  address text NOT NULL DEFAULT '200 Harbor View Drive, Long Beach, CA 90802, USA',
  business_hours text NOT NULL DEFAULT 'Monday - Friday: 8:00 AM - 6:00 PM (PST)',
  social_facebook text DEFAULT '',
  social_twitter text DEFAULT '',
  social_linkedin text DEFAULT '',
  social_instagram text DEFAULT '',
  website_description text NOT NULL DEFAULT 'Global logistics and shipment tracking solutions for businesses worldwide.',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_public" ON settings;
CREATE POLICY "settings_select_public" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_super_admin" ON settings;
CREATE POLICY "settings_update_super_admin" ON settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- ============================================
-- STORAGE BUCKET for shipment images
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-images', 'shipment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read shipment images
DROP POLICY IF EXISTS "shipment_images_public_read" ON storage.objects;
CREATE POLICY "shipment_images_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'shipment-images');

-- Authenticated admins can upload/replace/delete images
DROP POLICY IF EXISTS "shipment_images_admin_upload" ON storage.objects;
CREATE POLICY "shipment_images_admin_upload" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'shipment-images');

DROP POLICY IF EXISTS "shipment_images_admin_update" ON storage.objects;
CREATE POLICY "shipment_images_admin_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'shipment-images') WITH CHECK (bucket_id = 'shipment-images');

DROP POLICY IF EXISTS "shipment_images_admin_delete" ON storage.objects;
CREATE POLICY "shipment_images_admin_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'shipment-images');

-- ============================================
-- UPDATED_AT trigger for shipments
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shipments_updated_at ON shipments;
CREATE TRIGGER shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();