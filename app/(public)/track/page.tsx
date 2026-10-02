'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Loader2,
  Package,
  MapPin,
  Calendar,
  Truck,
  Weight,
  Ruler,
  Box,
  Clock,
  AlertCircle,
  CheckCircle2,
  Printer,
  RotateCcw,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createBrowserClient } from '@/lib/supabase/client';
import { getStatusInfo, getStatusBadgeClass, getServiceInfo } from '@/lib/constants';
import type { Shipment, TrackingEvent, Delay } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Suspense } from 'react';

interface TrackingResult {
  shipment: Shipment;
  events: TrackingEvent[];
  delays: Delay[];
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <TrackPageContent />
    </Suspense>
  );
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const queryTracking = searchParams.get('tracking');

  useEffect(() => {
    if (queryTracking) {
      setTrackingNumber(queryTracking);
      handleSearch(queryTracking);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTracking]);

  async function handleSearch(query?: string) {
    const number = (query || trackingNumber).trim();
    if (!number) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const supabase = createBrowserClient();
      const { data: shipment, error: shipError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', number)
        .maybeSingle();

      if (shipError) throw shipError;

      if (!shipment) {
        setError('Shipment not found. Please check your tracking number and try again.');
        return;
      }

      const [{ data: events }, { data: delays }] = await Promise.all([
        supabase
          .from('tracking_events')
          .select('*')
          .eq('shipment_id', shipment.id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('delays')
          .select('*')
          .eq('shipment_id', shipment.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
      ]);

      setResult({
        shipment: shipment as Shipment,
        events: (events || []) as TrackingEvent[],
        delays: (delays || []) as Delay[],
      });
    } catch {
      setError('Unable to search for your shipment at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch();
  }

  function handleReset() {
    setTrackingNumber('');
    setResult(null);
    setError(null);
    setSearched(false);
  }

  function copyTrackingNumber() {
    if (result) {
      navigator.clipboard.writeText(result.shipment.tracking_number);
      toast.success('Tracking number copied to clipboard');
    }
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-balance text-3xl font-bold text-white sm:text-4xl">Track Your Shipment</h1>
          <p className="mt-3 text-lg text-slate-300">
            Enter your tracking number to see real-time updates on your shipment's journey.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g., ELT-2026-847291"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-12 bg-white pl-11 text-base"
                aria-label="Tracking number"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading || !trackingNumber.trim()}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="ml-2">Track Shipment</span>
            </Button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Searching for your shipment...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-destructive/30 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">Shipment Not Found</h2>
              <p className="mt-2 max-w-md text-muted-foreground">{error}</p>
              <Button onClick={handleReset} variant="outline" className="mt-6">
                <RotateCcw className="mr-2 h-4 w-4" />
                Track Another Shipment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && !result && !searched && (
          <Card className="border-border/60 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">Enter a Tracking Number</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Use the search box above to track your shipment. Your tracking number follows the format ELT-YYYY-XXXXXX.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {!loading && !error && result && (
          <TrackingResultView result={result} onReset={handleReset} onCopy={copyTrackingNumber} />
        )}
      </div>
    </div>
  );
}

function TrackingResultView({
  result,
  onReset,
  onCopy,
}: {
  result: TrackingResult;
  onReset: () => void;
  onCopy: () => void;
}) {
  const { shipment, events, delays } = result;
  const statusInfo = getStatusInfo(shipment.status);
  const serviceInfo = getServiceInfo(shipment.shipment_type);
  const activeDelay = delays[0];

  const progressSteps = [
    'created', 'picked_up', 'processing', 'departed', 'in_transit', 'arrived', 'customs', 'out_for_delivery', 'delivered'
  ];
  const currentStepIndex = progressSteps.indexOf(shipment.status);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tracking Result</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{shipment.tracking_number}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Track Another
          </Button>
        </div>
      </div>

      {/* Delay Banner */}
      {activeDelay && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Delivery Update</h3>
                <p className="mt-1 text-sm text-amber-800">
                  Your shipment is currently experiencing a delay.
                </p>
                {activeDelay.reason && (
                  <p className="mt-1 text-sm text-amber-800"><strong>Reason:</strong> {activeDelay.reason}</p>
                )}
                {activeDelay.customer_message && (
                  <p className="mt-1 text-sm text-amber-800">{activeDelay.customer_message}</p>
                )}
                {activeDelay.new_estimated_delivery && (
                  <p className="mt-1 text-sm text-amber-800">
                    <strong>Updated estimated delivery:</strong> {format(new Date(activeDelay.new_estimated_delivery), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Header Card */}
      <Card className="overflow-hidden border-border/60 bg-white">
        {shipment.image_url && (
          <div className="relative h-48 w-full sm:h-56">
            <Image
              src={shipment.image_url}
              alt={`Shipment ${shipment.tracking_number}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge className={`${getStatusBadgeClass(shipment.status)} border`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{shipment.tracking_number}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy} aria-label="Copy tracking number">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {!shipment.image_url && (
                <Badge className={`mt-2 ${getStatusBadgeClass(shipment.status)} border`}>
                  {statusInfo.label}
                </Badge>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {serviceInfo?.title || shipment.shipment_type} &middot; {shipment.package_description || 'General Cargo'}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:text-right">
              <span className="flex items-center gap-1.5 sm:justify-end">
                <Clock className="h-4 w-4" />
                Last updated {formatDistanceToNow(new Date(shipment.updated_at), { addSuffix: true })}
              </span>
              {shipment.estimated_delivery && (
                <span className="flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="h-4 w-4" />
                  Est. delivery: {format(new Date(shipment.estimated_delivery), 'MMMM d, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => {
                const info = getStatusInfo(step as any);
                const isCompleted = currentStepIndex >= 0 && index <= currentStepIndex && shipment.status !== 'delayed';
                const isCurrent = index === currentStepIndex && shipment.status !== 'delayed';
                return (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {index > 0 && (
                        <div className={`h-1 flex-1 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                      )}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                          isCompleted
                            ? 'border-primary bg-primary text-white'
                            : isCurrent
                            ? 'border-primary bg-white text-primary ring-4 ring-primary/20'
                            : 'border-border bg-white text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div className={`h-1 flex-1 ${isCompleted && index < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                      )}
                    </div>
                    <span className={`mt-2 hidden text-[10px] font-medium sm:block ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {info.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipment Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Route Info */}
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Shipment Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Origin</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {shipment.origin || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Current Location</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    {shipment.current_location || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Destination</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {shipment.destination || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Package Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <DetailItem icon={Box} label="Type" value={serviceInfo?.title || shipment.shipment_type} />
                <DetailItem icon={Weight} label="Weight" value={shipment.weight ? `${shipment.weight} kg` : 'N/A'} />
                <DetailItem icon={Ruler} label="Dimensions" value={shipment.dimensions || 'N/A'} />
                <DetailItem icon={Package} label="Quantity" value={String(shipment.quantity || 1)} />
              </div>
              {shipment.customer_notes && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Customer Notes</p>
                  <p className="mt-1 text-sm text-foreground">{shipment.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8" />
                  <p className="mt-2 text-sm">No tracking events yet. Check back soon for updates.</p>
                </div>
              ) : (
                <div className="relative">
                  {events.map((event, index) => {
                    const info = getStatusInfo(event.status);
                    return (
                      <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                        {index < events.length - 1 && (
                          <div className="absolute left-[15px] mt-8 h-[calc(100%-2rem)] w-0.5 bg-border" style={{ top: `${index * 0}px` }} />
                        )}
                        <div className="relative">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${info.color}`}>
                            {event.status === 'delayed' ? (
                              <AlertCircle className="h-4 w-4 text-white" />
                            ) : event.status === 'delivered' ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          {index < events.length - 1 && (
                            <div className="absolute left-1/2 top-8 h-full w-0.5 -translate-x-1/2 bg-border" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="font-semibold text-foreground">{event.title || info.label}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.event_date), 'MMM d, yyyy')} at {format(new Date(event.event_date), 'HH:mm')}
                            </span>
                          </div>
                          {event.location && (
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="mt-1.5 text-sm text-foreground">{event.description}</p>
                          )}
                          {event.delay_reason && (
                            <p className="mt-1.5 text-sm text-amber-600">
                              <strong>Delay reason:</strong> {event.delay_reason}
                            </p>
                          )}
                          {event.image_url && (
                            <div className="relative mt-3 h-32 w-full max-w-xs overflow-hidden rounded-lg">
                              <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                sizes="300px"
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Info */}
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-medium text-foreground">
                  {shipment.estimated_delivery ? format(new Date(shipment.estimated_delivery), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize text-foreground">{shipment.delivery_priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={`${getStatusBadgeClass(shipment.status)} border`}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium text-foreground">{shipment.reference_number || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Info */}
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Recipient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{shipment.recipient_name || 'N/A'}</p>
              {shipment.recipient_company && <p className="text-muted-foreground">{shipment.recipient_company}</p>}
              <p className="text-muted-foreground">
                {[shipment.recipient_city, shipment.recipient_country].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}
