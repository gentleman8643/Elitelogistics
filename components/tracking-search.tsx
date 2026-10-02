'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TrackingSearch({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/track?tracking=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter tracking number (e.g., LGS-2026-847291)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className={`pl-10 ${large ? 'h-12 text-base' : ''}`}
          aria-label="Tracking number"
        />
      </div>
      <Button type="submit" disabled={loading || !trackingNumber.trim()} size={large ? 'lg' : 'default'}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        <span className="ml-2">Track Shipment</span>
      </Button>
    </form>
  );
}
