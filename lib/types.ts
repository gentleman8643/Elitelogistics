export type ShipmentStatus =
  | 'created'
  | 'picked_up'
  | 'processing'
  | 'departed'
  | 'in_transit'
  | 'arrived'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed';

export type ShipmentType =
  | 'air_freight'
  | 'ocean_freight'
  | 'road_transport'
  | 'express_delivery'
  | 'warehousing'
  | 'cargo_handling'
  | 'last_mile'
  | 'international';

export type DeliveryPriority = 'standard' | 'express' | 'priority';

export type AdminRole = 'super_admin' | 'admin' | 'viewer';

export interface Shipment {
  id: string;
  tracking_number: string;
  reference_number: string;
  shipment_type: ShipmentType;
  package_description: string;
  package_category: string;
  weight: number;
  dimensions: string;
  quantity: number;
  image_url: string;
  sender_name: string;
  sender_company: string;
  sender_country: string;
  sender_city: string;
  sender_contact: string;
  recipient_name: string;
  recipient_company: string;
  recipient_country: string;
  recipient_city: string;
  recipient_contact: string;
  origin: string;
  destination: string;
  current_location: string;
  latitude: number | null;
  longitude: number | null;
  estimated_delivery: string | null;
  original_estimated_delivery: string | null;
  delivery_priority: DeliveryPriority;
  status: ShipmentStatus;
  customer_notes: string;
  internal_notes: string;
  created_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  title: string;
  location: string;
  description: string;
  delay_reason: string;
  image_url: string;
  event_date: string;
  sort_order: number;
  created_by: string | null;
  created_at: string;
}

export interface Delay {
  id: string;
  shipment_id: string;
  reason: string;
  explanation: string;
  new_estimated_delivery: string | null;
  location: string;
  customer_message: string;
  is_active: boolean;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  role: AdminRole;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  company_name: string;
  logo_url: string;
  contact_email: string;
  phone: string;
  company_phone_full: string;
  whatsapp_number: string;
  signal_contact_url: string;
  address: string;
  business_hours: string;
  social_facebook: string;
  social_twitter: string;
  social_linkedin: string;
  social_instagram: string;
  website_description: string;
  updated_at: string;
}

export interface ShipmentWithDetails extends Shipment {
  tracking_events?: TrackingEvent[];
  delays?: Delay[];
}
