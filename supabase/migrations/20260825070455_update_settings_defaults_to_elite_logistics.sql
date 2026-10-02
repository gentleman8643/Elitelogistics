-- Update settings defaults to Elite Logistics branding
ALTER TABLE settings ALTER COLUMN company_name SET DEFAULT 'Elite Logistics';
ALTER TABLE settings ALTER COLUMN contact_email SET DEFAULT 'support@elitelogistics.com';
ALTER TABLE settings ALTER COLUMN phone SET DEFAULT '(213) 942-0224';

-- Update existing settings row if it still has old defaults
UPDATE settings
SET
  company_name = 'Elite Logistics',
  contact_email = CASE WHEN contact_email = 'support@meridianlogistics.com' THEN 'support@elitelogistics.com' ELSE contact_email END,
  phone = CASE WHEN phone = '+1 (800) 555-0140' THEN '(213) 942-0224' ELSE phone END,
  website_description = CASE WHEN website_description = 'Global logistics and shipment tracking solutions for businesses worldwide.' THEN 'Professional logistics and shipment services for businesses worldwide.' ELSE website_description END
WHERE id = 1;