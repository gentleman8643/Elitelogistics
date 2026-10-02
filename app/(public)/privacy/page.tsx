export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Elite Logistics.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-4 text-slate-300">Last updated: January 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
          <p className="mt-2 text-muted-foreground">
            Elite Logistics (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when
            you use our website and shipment tracking services.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">2. Information We Collect</h2>
          <p className="mt-2 text-muted-foreground">
            We collect information you provide directly, such as your name, email address, and
            phone number when you contact us or create a shipment. We also collect shipment data
            including tracking numbers, sender and recipient information, and package details.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">3. How We Use Your Information</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>To provide and manage shipment tracking services</li>
            <li>To communicate with you about your shipments and inquiries</li>
            <li>To improve our services and user experience</li>
            <li>To comply with legal and regulatory requirements</li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-foreground">4. Data Security</h2>
          <p className="mt-2 text-muted-foreground">
            We implement industry-standard security measures including encryption, secure
            authentication, and access controls to protect your information. Access to personal
            data is restricted to authorized personnel only.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">5. Data Retention</h2>
          <p className="mt-2 text-muted-foreground">
            We retain shipment data for as long as necessary to provide our services and comply
            with legal requirements. You may request deletion of your personal data in accordance
            with applicable laws.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">6. Your Rights</h2>
          <p className="mt-2 text-muted-foreground">
            You have the right to access, correct, or delete your personal data. To exercise these
            rights, please contact us using the information provided on our Contact page.
          </p>

          <h2 className="mt-8 text-xl font-bold text-foreground">7. Contact Us</h2>
          <p className="mt-2 text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at
            support@elitelogistics.com or (213) 942-0224.
          </p>
        </div>
      </section>
    </div>
  );
}
