-- Add contact integration fields to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '12139420224';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS signal_contact_url text NOT NULL DEFAULT 'https://signal.me/#p/+12139420224';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_phone_full text NOT NULL DEFAULT '+12139420224';

-- Update existing settings row with the correct values
UPDATE settings
SET
  whatsapp_number = '12139420224',
  signal_contact_url = 'https://signal.me/#p/+12139420224',
  company_phone_full = '+12139420224'
WHERE id = 1;