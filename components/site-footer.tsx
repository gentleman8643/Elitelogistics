import Link from 'next/link';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import { COMPANY, getWhatsAppUrl, getTelUrl, hasSignal } from '@/lib/company';

const SERVICES_LINKS = [
  { href: '/services#air-freight', label: 'Air Freight' },
  { href: '/services#ocean-freight', label: 'Ocean Freight' },
  { href: '/services#road-transport', label: 'Road Transportation' },
  { href: '/services#warehousing', label: 'Warehousing' },
  { href: '/services#express-delivery', label: 'Express Delivery' },
];

function SignalIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8 2 5 5 5 9v6c0 2 1 4 3 5l1-1v-8H7V9c0-3 2-5 5-5s5 2 5 5v2h-2v8l1 1c2-1 3-3 3-5V9c0-4-3-7-7-7z" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">{settings.company_name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Professional logistics and shipment services.
            </p>
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <Phone className="h-4 w-4 shrink-0" />
              {COMPANY.displayPhone}
            </p>
            <div className="flex gap-2">
              <a href={getTelUrl()} aria-label="Call us" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                <Phone className="h-4 w-4" />
              </a>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-green-600 hover:text-white">
                <MessageCircle className="h-4 w-4" />
              </a>
              {hasSignal() && (
                <a href={COMPANY.signalContactUrl} target="_blank" rel="noopener noreferrer" aria-label="Signal" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                  <SignalIcon className="h-4 w-4" />
                </a>
              )}
              {settings.social_facebook && (
                <a href={settings.social_facebook} aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.social_twitter && (
                <a href={settings.social_twitter} aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/services" className="text-slate-400 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>

            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES_LINKS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-slate-400 hover:text-white transition-colors">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/track" className="text-slate-400 hover:text-white transition-colors">Track Shipment</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{settings.contact_email}</p>
              <p className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />{settings.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            &copy; {year} {settings.company_name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
            <Link href="/admin/login" className="text-slate-400 hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
