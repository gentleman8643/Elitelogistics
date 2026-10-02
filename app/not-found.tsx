import Link from 'next/link';
import { Package, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you are looking for may have been moved or no longer exists. Let us help you get back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-1.5 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/track">
              <Search className="mr-1.5 h-4 w-4" />
              Track a Shipment
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
