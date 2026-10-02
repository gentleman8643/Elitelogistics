export const COMPANY = {
  name: process.env.COMPANY_NAME || 'Elite Logistics',
  phone: process.env.COMPANY_PHONE || '+12139420224',
  displayPhone: process.env.DISPLAY_PHONE || '(213) 942-0224',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '12139420224',
  signalContactUrl: process.env.SIGNAL_CONTACT_URL || 'https://signal.me/#p/+12139420224',
  email: process.env.COMPANY_EMAIL || 'support@elitelogistics.com',
  address: process.env.COMPANY_ADDRESS || '200 Harbor View Drive, Long Beach, CA 90802, USA',
  websiteUrl: process.env.COMPANY_WEBSITE_URL || 'https://www.elitelogistics.com',
};

export function getWhatsAppUrl(): string {
  return `https://wa.me/${COMPANY.whatsappNumber}`;
}

export function getTelUrl(): string {
  return `tel:${COMPANY.phone}`;
}

export function hasSignal(): boolean {
  return COMPANY.signalContactUrl.length > 0;
}
