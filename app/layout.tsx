import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { COMPANY } from '@/lib/company';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.websiteUrl),
  title: {
    default: 'Elite Logistics — Global Shipping & Shipment Tracking',
    template: '%s | Elite Logistics',
  },
  description:
    'Elite Logistics provides global freight forwarding, shipment tracking, and supply chain solutions. Track your shipments in real-time with our advanced logistics platform.',
  openGraph: {
    title: 'Elite Logistics — Global Shipping & Shipment Tracking',
    description:
      'Global freight forwarding, shipment tracking, and supply chain solutions for businesses worldwide.',
    type: 'website',
    siteName: 'Elite Logistics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elite Logistics — Global Shipping & Shipment Tracking',
    description:
      'Global freight forwarding, shipment tracking, and supply chain solutions for businesses worldwide.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
