import { createServerClient } from './supabase/server';
import { COMPANY } from './company';
import type { SiteSettings } from './types';

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  company_name: COMPANY.name,
  logo_url: '',
  contact_email: COMPANY.email,
  phone: COMPANY.displayPhone,
  company_phone_full: COMPANY.phone,
  whatsapp_number: COMPANY.whatsappNumber,
  signal_contact_url: COMPANY.signalContactUrl,
  address: COMPANY.address,
  business_hours: 'Monday - Friday: 8:00 AM - 6:00 PM (PST)',
  social_facebook: '',
  social_twitter: '',
  social_linkedin: '',
  social_instagram: '',
  website_description:
    'Professional logistics and shipment services for businesses worldwide.',
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
  return (data as SiteSettings) || DEFAULT_SETTINGS;
}
