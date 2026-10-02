import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FloatingContact } from '@/components/floating-contact';
import { getSettings } from '@/lib/settings';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader companyName={settings.company_name} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <FloatingContact />
    </div>
  );
}
