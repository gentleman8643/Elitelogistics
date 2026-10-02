import {
  Plane,
  Ship,
  Truck,
  Zap,
  Warehouse,
  Package,
  Home,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import type { ShipmentStatus, ShipmentType } from './types';

export const SHIPMENT_STATUSES: { value: ShipmentStatus; label: string; color: string; step: number }[] = [
  { value: 'created', label: 'Shipment Created', color: 'bg-slate-500', step: 0 },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-blue-500', step: 1 },
  { value: 'processing', label: 'Processing', color: 'bg-cyan-500', step: 2 },
  { value: 'departed', label: 'Departed Facility', color: 'bg-indigo-500', step: 3 },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-600', step: 4 },
  { value: 'arrived', label: 'Arrived at Facility', color: 'bg-teal-500', step: 5 },
  { value: 'customs', label: 'Customs Processing', color: 'bg-amber-500', step: 6 },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-500', step: 7 },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-600', step: 8 },
  { value: 'delayed', label: 'Delayed', color: 'bg-red-500', step: -1 },
];

export function getStatusInfo(status: ShipmentStatus) {
  return SHIPMENT_STATUSES.find((s) => s.value === status) || SHIPMENT_STATUSES[0];
}

export function getStatusBadgeClass(status: ShipmentStatus): string {
  const map: Record<ShipmentStatus, string> = {
    created: 'bg-slate-100 text-slate-700 border-slate-200',
    picked_up: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    departed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    in_transit: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    arrived: 'bg-teal-100 text-teal-700 border-teal-200',
    customs: 'bg-amber-100 text-amber-700 border-amber-200',
    out_for_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    delayed: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export interface ServiceInfo {
  type: ShipmentType;
  title: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  image: string;
}

export const SERVICES: ServiceInfo[] = [
  {
    type: 'air_freight',
    title: 'Air Freight',
    icon: Plane,
    description: 'Fast, reliable air cargo services connecting major airports worldwide with time-critical delivery options.',
    features: ['Express air cargo', 'Charter services', 'Temperature-controlled', 'Dangerous goods handling'],
    image: 'https://images.pexels.com/photos/62630/pexels-photo-62630.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'ocean_freight',
    title: 'Ocean Freight',
    icon: Ship,
    description: 'Cost-effective sea freight solutions with full and less-than-container loads across global shipping lanes.',
    features: ['FCL & LCL shipping', 'Port-to-port delivery', 'Refrigerated containers', 'Bulk cargo handling'],
    image: 'https://images.pexels.com/photos/2241624/pexels-photo-2241624.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'road_transport',
    title: 'Road Transportation',
    icon: Truck,
    description: 'Comprehensive ground freight network covering domestic and cross-border trucking with real-time tracking.',
    features: ['FTL & LTL trucking', 'Cross-border transport', 'Dedicated fleet', 'Expedited trucking'],
    image: 'https://images.pexels.com/photos/906183/pexels-photo-906183.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'express_delivery',
    title: 'Express Delivery',
    icon: Zap,
    description: 'Time-definite express delivery for urgent shipments requiring guaranteed delivery windows.',
    features: ['Same-day delivery', 'Next-day guaranteed', 'Time-definite options', 'Real-time tracking'],
    image: 'https://images.pexels.com/photos/4391025/pexels-photo-4391025.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'warehousing',
    title: 'Warehousing',
    icon: Warehouse,
    description: 'State-of-the-art warehousing and distribution centers with integrated inventory management systems.',
    features: ['Climate-controlled storage', 'Inventory management', 'Pick & pack services', 'Distribution network'],
    image: 'https://images.pexels.com/photos/80465/pexels-photo-80465.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'cargo_handling',
    title: 'Cargo Handling',
    icon: Package,
    description: 'Professional cargo handling services including loading, unloading, and transshipment operations.',
    features: ['Container handling', 'Break-bulk services', 'Cross-docking', 'Quality inspections'],
    image: 'https://images.pexels.com/photos/2478248/pexels-photo-2478248.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'last_mile',
    title: 'Last-Mile Delivery',
    icon: Home,
    description: 'Efficient final-mile delivery solutions ensuring packages reach their destination with precision.',
    features: ['Residential delivery', 'Business delivery', 'Proof of delivery', 'Flexible scheduling'],
    image: 'https://images.pexels.com/photos/4498136/pexels-photo-4498136.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    type: 'international',
    title: 'International Shipping',
    icon: Globe,
    description: 'End-to-end international logistics with customs clearance, documentation, and multi-modal transport.',
    features: ['Customs brokerage', 'Documentation services', 'Multi-modal transport', 'Trade compliance'],
    image: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
];

export function getServiceInfo(type: ShipmentType): ServiceInfo | undefined {
  return SERVICES.find((s) => s.type === type);
}

export const SHIPMENT_TYPE_OPTIONS = SERVICES.map((s) => ({
  value: s.type,
  label: s.title,
}));

export const DELIVERY_PRIORITIES = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'priority', label: 'Priority' },
];

export const FAQS = [
  {
    question: 'How do I track my shipment?',
    answer: 'Enter your tracking number (e.g., ELT-2026-847291) in the tracking search box on our Track Shipment page. You will see the full shipment timeline, current status, and estimated delivery date instantly.',
  },
  {
    question: 'What is a tracking number and where do I find it?',
    answer: 'A tracking number is a unique identifier assigned to every shipment. It follows the format ELT-YYYY-XXXXXX. You receive it in your shipping confirmation email or receipt when your shipment is created.',
  },
  {
    question: 'How long does delivery typically take?',
    answer: 'Delivery times vary by service type and destination. Express delivery typically takes 1-3 business days, standard international shipping 5-10 business days, and ocean freight 15-30 days. Your estimated delivery date is shown on the tracking page.',
  },
  {
    question: 'What happens if my shipment is delayed?',
    answer: 'If your shipment experiences a delay, a delay notification will appear on your tracking page with the reason, an updated estimated delivery date, and a message from our logistics team. Delays can occur due to weather, customs processing, or operational conditions.',
  },
  {
    question: 'How do shipment updates work?',
    answer: 'Our logistics team updates your shipment status at each stage of its journey — from pickup through transit, customs, and final delivery. Each update includes the location, timestamp, and details about what is happening with your shipment.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach our support team through the Contact page on our website, by phone at the number listed in the footer, or by email. Our support team is available during business hours to assist with any shipment-related questions.',
  },
];
