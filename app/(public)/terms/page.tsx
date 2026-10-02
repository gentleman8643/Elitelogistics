export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for Elite Logistics.',
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white">Terms & Conditions</h1>
          <p className="mt-4 text-slate-300">Last updated: January 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-2 text-muted-foreground">
            By accessing and using Elite Logistics services, you accept and agree to be bound
            by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">2. Services</h2>
          <p className="mt-2 text-muted-foreground">
            Elite Logistics provides freight forwarding, shipment tracking, warehousing, and
            supply chain management services. We reserve the right to modify or discontinue any
            service at any time without prior notice.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">3. Shipment Tracking</h2>
          <p className="mt-2 text-muted-foreground">
            Tracking information is provided for reference only. While we strive for accuracy,
            tracking data may not reflect real-time GPS locations. Delivery times are estimates
            and may be affected by factors beyond our control.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">4. Liability</h2>
          <p className="mt-2 text-muted-foreground">
            Elite Logistics is not liable for indirect, incidental, or consequential damages
            arising from the use of our services. Our liability for lost or damaged shipments is
            limited in accordance with applicable transportation laws and insurance coverage.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">5. Prohibited Items</h2>
          <p className="mt-2 text-muted-foreground">
            Shipments must comply with all applicable laws and regulations. We do not transport
            illegal items, hazardous materials without proper documentation, or items prohibited
            by origin, transit, or destination country regulations.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">6. Intellectual Property</h2>
          <p className="mt-2 text-muted-foreground">
            All content on this website, including logos, text, and design elements, is the
            property of Elite Logistics and is protected by intellectual property laws.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">7. Governing Law</h2>
          <p className="mt-2 text-muted-foreground">
            These Terms are governed by the laws of the State of California, USA. Any disputes
            shall be resolved in the courts of Los Angeles County, California.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">8. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            For questions about these Terms, contact us at support@elitelogistics.com or
            (213) 942-0224.
          </p>
        </div>
      </section>
    </div>
  );
}
