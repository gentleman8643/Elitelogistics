'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
  AlertCircle,
  MapPin,
  Package,
  Clock,
  Loader2,
  Save,
  ArrowUp,
  ArrowDown,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  getStatusInfo,
  getStatusBadgeClass,
  getServiceInfo,
  SHIPMENT_STATUSES,
  SHIPMENT_TYPE_OPTIONS,
  DELIVERY_PRIORITIES,
} from '@/lib/constants';
import type { Shipment, TrackingEvent, Delay, ShipmentStatus } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const id = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [delays, setDelays] = useState<Delay[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TrackingEvent | null>(null);
  const [delayOpen, setDelayOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [deleteShipOpen, setDeleteShipOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const canEdit = profile?.role !== 'viewer';
  const isSuperAdmin = profile?.role === 'super_admin';

  const fetchData = useCallback(async () => {
    const supabase = createBrowserClient();
    const [{ data: ship }, { data: evts }, { data: dlys }] = await Promise.all([
      supabase.from('shipments').select('*').eq('id', id).maybeSingle(),
      supabase.from('tracking_events').select('*').eq('shipment_id', id).order('sort_order', { ascending: true }),
      supabase.from('delays').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
    ]);

    setShipment(ship as Shipment | null);
    setEvents((evts || []) as TrackingEvent[]);
    setDelays((dlys || []) as Delay[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function copyTracking() {
    if (shipment) {
      navigator.clipboard.writeText(shipment.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Tracking number copied');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !shipment) return;

    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop();
      const fileName = `shipment-${shipment.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('shipment-images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('shipment-images').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('shipments')
        .update({ image_url: urlData.publicUrl })
        .eq('id', shipment.id);

      if (updateError) throw updateError;

      setShipment({ ...shipment, image_url: urlData.publicUrl });
      toast.success('Image uploaded successfully.');
    } catch {
      toast.error('Unable to upload image.');
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    if (!shipment) return;
    const supabase = createBrowserClient();
    const { error } = await supabase.from('shipments').update({ image_url: '' }).eq('id', shipment.id);
    if (error) {
      toast.error('Unable to remove image.');
      return;
    }
    setShipment({ ...shipment, image_url: '' });
    toast.success('Image removed.');
  }

  async function deleteShipment() {
    if (!shipment) return;
    const supabase = createBrowserClient();
    const { error } = await supabase.from('shipments').delete().eq('id', shipment.id);
    if (error) {
      toast.error('Unable to delete shipment.');
      return;
    }
    toast.success('Shipment deleted.');
    router.push('/admin/shipments');
  }

  async function deleteEvent(eventId: string) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('tracking_events').delete().eq('id', eventId);
    if (error) {
      toast.error('Unable to delete tracking event.');
      return;
    }
    toast.success('Tracking event deleted.');
    fetchData();
    setDeleteEventId(null);
  }

  async function moveEvent(eventId: string, direction: 'up' | 'down') {
    const supabase = createBrowserClient();
    const currentIndex = events.findIndex((e) => e.id === eventId);
    if (currentIndex < 0) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const currentEvent = events[currentIndex];
    const targetEvent = events[targetIndex];

    await supabase.from('tracking_events').update({ sort_order: targetEvent.sort_order }).eq('id', currentEvent.id);
    await supabase.from('tracking_events').update({ sort_order: currentEvent.sort_order }).eq('id', targetEvent.id);

    fetchData();
  }

  async function resolveDelay(delayId: string) {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('delays')
      .update({ is_active: false, resolved_at: new Date().toISOString() })
      .eq('id', delayId);
    if (error) {
      toast.error('Unable to resolve delay.');
      return;
    }
    toast.success('Delay resolved. Shipment has resumed normal tracking.');
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="py-20 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">Shipment not found.</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/admin/shipments">Back to Shipments</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(shipment.status);
  const serviceInfo = getServiceInfo(shipment.shipment_type);
  const activeDelay = delays.find((d) => d.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/shipments"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{shipment.tracking_number}</h1>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyTracking}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {serviceInfo?.title} · Created {format(new Date(shipment.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStatusOpen(true)}>
                <Clock className="mr-1.5 h-4 w-4" /> Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocationOpen(true)}>
                <MapPin className="mr-1.5 h-4 w-4" /> Location
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Edit className="mr-1.5 h-4 w-4" /> Edit
              </Button>
              <Button size="sm" onClick={() => setEventOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Update
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Active Delay Banner */}
      {activeDelay && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Active Delay</p>
                <p className="mt-1 text-sm text-amber-800">{activeDelay.reason}</p>
                {activeDelay.customer_message && <p className="mt-1 text-sm text-amber-800">{activeDelay.customer_message}</p>}
                {activeDelay.new_estimated_delivery && (
                  <p className="mt-1 text-sm text-amber-800">
                    Updated delivery: {format(new Date(activeDelay.new_estimated_delivery), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => resolveDelay(activeDelay.id)}>
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-600" /> Resolve Delay
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipment Image */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Shipment Image</CardTitle>
              {canEdit && (
                <div className="flex gap-2">
                  {shipment.image_url && (
                    <Button variant="outline" size="sm" onClick={removeImage}>
                      <X className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                  <label>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    <Button variant="outline" size="sm" asChild>
                      <span>{uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}{shipment.image_url ? 'Replace' : 'Upload'}</span>
                    </Button>
                  </label>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {shipment.image_url ? (
                <div className="relative h-56 w-full overflow-hidden rounded-lg">
                  <Image src={shipment.image_url} alt={shipment.tracking_number} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                  <Package className="h-8 w-8" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tracking Timeline</CardTitle>
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => { setEditEvent(null); setEventOpen(true); }}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Update
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No tracking events yet. Add an update to start the timeline.
                </div>
              ) : (
                <div className="space-y-0">
                  {events.map((event, index) => {
                    const info = getStatusInfo(event.status);
                    return (
                      <div key={event.id} className="group flex gap-4 pb-6 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${info.color}`}>
                            {event.status === 'delivered' ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : event.status === 'delayed' ? (
                              <AlertCircle className="h-4 w-4 text-white" />
                            ) : (
                              <span className="h-2.5 w-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          {index < events.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-border" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{event.title || info.label}</h4>
                              {event.location && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />{event.location}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.event_date), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          {event.description && <p className="mt-1.5 text-sm text-foreground">{event.description}</p>}
                          {event.delay_reason && (
                            <p className="mt-1 text-sm text-amber-600"><strong>Delay:</strong> {event.delay_reason}</p>
                          )}
                          {event.image_url && (
                            <div className="relative mt-2 h-28 w-full max-w-xs overflow-hidden rounded-lg">
                              <Image src={event.image_url} alt={event.title} fill sizes="300px" className="object-cover" />
                            </div>
                          )}
                          {canEdit && (
                            <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button variant="ghost" size="sm" onClick={() => moveEvent(event.id, 'up')} disabled={index === 0}>
                                <ArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => moveEvent(event.id, 'down')} disabled={index === events.length - 1}>
                                <ArrowDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setEditEvent(event); setEventOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteEventId(event.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
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

          {/* Delay Management */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Delay Information</CardTitle>
              {canEdit && !activeDelay && (
                <Button size="sm" variant="outline" onClick={() => setDelayOpen(true)}>
                  <AlertCircle className="mr-1 h-3.5 w-3.5" /> Add Delay
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {delays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No delays recorded for this shipment.</p>
              ) : (
                <div className="space-y-3">
                  {delays.map((d) => (
                    <div key={d.id} className={`rounded-lg border p-4 ${d.is_active ? 'border-amber-300 bg-amber-50' : 'border-border bg-slate-50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={d.is_active ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}>
                              {d.is_active ? 'Active' : 'Resolved'}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">{d.reason}</span>
                          </div>
                          {d.explanation && <p className="mt-1 text-sm text-muted-foreground">{d.explanation}</p>}
                          {d.customer_message && <p className="mt-1 text-sm text-foreground">{d.customer_message}</p>}
                          {d.new_estimated_delivery && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Updated delivery: {format(new Date(d.new_estimated_delivery), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status & Delivery */}
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Status & Delivery</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={`border ${getStatusBadgeClass(shipment.status)}`}>{statusInfo.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{shipment.delivery_priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Delivery</span>
                <span className="font-medium">{shipment.estimated_delivery ? format(new Date(shipment.estimated_delivery), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDistanceToNow(new Date(shipment.updated_at), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Route */}
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Route</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Origin</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-primary" />{shipment.origin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Current Location</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-primary" />{shipment.current_location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Destination</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-primary" />{shipment.destination || 'N/A'}</p>
              </div>
              {(shipment.latitude && shipment.longitude) && (
                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="mt-0.5 text-sm font-medium">{shipment.latitude}, {shipment.longitude}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Info */}
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Package</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{serviceInfo?.title || shipment.shipment_type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="font-medium">{shipment.package_description || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span className="font-medium">{shipment.dimensions || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{shipment.quantity}</span></div>
            </CardContent>
          </Card>

          {/* Sender / Recipient */}
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-lg">Sender & Recipient</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Sender</p>
                <p className="mt-0.5 font-medium">{shipment.sender_name || 'N/A'}</p>
                {shipment.sender_company && <p className="text-muted-foreground">{shipment.sender_company}</p>}
                <p className="text-muted-foreground">{[shipment.sender_city, shipment.sender_country].filter(Boolean).join(', ') || ''}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Recipient</p>
                <p className="mt-0.5 font-medium">{shipment.recipient_name || 'N/A'}</p>
                {shipment.recipient_company && <p className="text-muted-foreground">{shipment.recipient_company}</p>}
                <p className="text-muted-foreground">{[shipment.recipient_city, shipment.recipient_country].filter(Boolean).join(', ') || ''}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {shipment.customer_notes && (
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-lg">Customer Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{shipment.customer_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes (admin only) */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader><CardTitle className="text-lg text-amber-900">Internal Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{shipment.internal_notes || 'No internal notes.'}</p>
              <p className="mt-2 text-xs text-amber-700">These notes are private and never shown to customers.</p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isSuperAdmin && (
            <Card className="border-red-200">
              <CardHeader><CardTitle className="text-lg text-red-700">Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm" onClick={() => setDeleteShipOpen(true)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete Shipment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <EditShipmentDialog
          shipment={shipment}
          onClose={() => setEditOpen(false)}
          onSaved={fetchData}
        />
      )}

      {/* Event Dialog */}
      {eventOpen && (
        <EventDialog
          shipmentId={shipment.id}
          event={editEvent}
          nextSortOrder={events.length}
          onClose={() => { setEventOpen(false); setEditEvent(null); }}
          onSaved={fetchData}
        />
      )}

      {/* Delay Dialog */}
      {delayOpen && (
        <DelayDialog
          shipmentId={shipment.id}
          onClose={() => setDelayOpen(false)}
          onSaved={fetchData}
        />
      )}

      {/* Status Dialog */}
      {statusOpen && (
        <StatusDialog
          shipment={shipment}
          onClose={() => setStatusOpen(false)}
          onSaved={fetchData}
        />
      )}

      {/* Location Dialog */}
      {locationOpen && (
        <LocationDialog
          shipment={shipment}
          onClose={() => setLocationOpen(false)}
          onSaved={fetchData}
        />
      )}

      {/* Delete Shipment Confirmation */}
      <AlertDialog open={deleteShipOpen} onOpenChange={setDeleteShipOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete shipment {shipment.tracking_number} and all its tracking events and delays. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteShipment} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Event Confirmation */}
      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tracking Event?</AlertDialogTitle>
            <AlertDialogDescription>This will remove this event from the shipment timeline.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteEventId && deleteEvent(deleteEventId)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// === Edit Shipment Dialog ===
function EditShipmentDialog({ shipment, onClose, onSaved }: { shipment: Shipment; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reference_number: shipment.reference_number,
    shipment_type: shipment.shipment_type,
    package_description: shipment.package_description,
    package_category: shipment.package_category,
    weight: String(shipment.weight || ''),
    dimensions: shipment.dimensions,
    quantity: String(shipment.quantity || 1),
    sender_name: shipment.sender_name,
    sender_company: shipment.sender_company,
    sender_country: shipment.sender_country,
    sender_city: shipment.sender_city,
    sender_contact: shipment.sender_contact,
    recipient_name: shipment.recipient_name,
    recipient_company: shipment.recipient_company,
    recipient_country: shipment.recipient_country,
    recipient_city: shipment.recipient_city,
    recipient_contact: shipment.recipient_contact,
    origin: shipment.origin,
    destination: shipment.destination,
    estimated_delivery: shipment.estimated_delivery || '',
    delivery_priority: shipment.delivery_priority,
    customer_notes: shipment.customer_notes,
    internal_notes: shipment.internal_notes,
  });

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('shipments').update({
        reference_number: form.reference_number,
        shipment_type: form.shipment_type,
        package_description: form.package_description,
        package_category: form.package_category,
        weight: form.weight ? parseFloat(form.weight) : 0,
        dimensions: form.dimensions,
        quantity: form.quantity ? parseInt(form.quantity) : 1,
        sender_name: form.sender_name,
        sender_company: form.sender_company,
        sender_country: form.sender_country,
        sender_city: form.sender_city,
        sender_contact: form.sender_contact,
        recipient_name: form.recipient_name,
        recipient_company: form.recipient_company,
        recipient_country: form.recipient_country,
        recipient_city: form.recipient_city,
        recipient_contact: form.recipient_contact,
        origin: form.origin,
        destination: form.destination,
        estimated_delivery: form.estimated_delivery || null,
        delivery_priority: form.delivery_priority,
        customer_notes: form.customer_notes,
        internal_notes: form.internal_notes,
      }).eq('id', shipment.id);

      if (error) throw error;
      toast.success('Shipment updated successfully.');
      onSaved();
      onClose();
    } catch {
      toast.error('Unable to update shipment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Shipment</DialogTitle>
          <DialogDescription>Update the shipment details below.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div>
            <Label>Reference Number</Label>
            <Input value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Shipment Type</Label>
            <Select value={form.shipment_type} onValueChange={(v) => setForm({ ...form, shipment_type: v as any })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{SHIPMENT_TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Package Description</Label>
            <Input value={form.package_description} onChange={(e) => setForm({ ...form, package_description: e.target.value })} className="mt-1.5" />
          </div>
          <div><Label>Weight (kg)</Label><Input type="number" step="0.01" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Dimensions</Label><Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Priority</Label><Select value={form.delivery_priority} onValueChange={(v) => setForm({ ...form, delivery_priority: v as any })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{DELIVERY_PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Sender Name</Label><Input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Sender Company</Label><Input value={form.sender_company} onChange={(e) => setForm({ ...form, sender_company: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Sender Country</Label><Input value={form.sender_country} onChange={(e) => setForm({ ...form, sender_country: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Sender City</Label><Input value={form.sender_city} onChange={(e) => setForm({ ...form, sender_city: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Recipient Name</Label><Input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Recipient Company</Label><Input value={form.recipient_company} onChange={(e) => setForm({ ...form, recipient_company: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Recipient Country</Label><Input value={form.recipient_country} onChange={(e) => setForm({ ...form, recipient_country: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Recipient City</Label><Input value={form.recipient_city} onChange={(e) => setForm({ ...form, recipient_city: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Origin</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Estimated Delivery</Label><Input type="date" value={form.estimated_delivery} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label>Customer Notes</Label><Textarea value={form.customer_notes} onChange={(e) => setForm({ ...form, customer_notes: e.target.value })} className="mt-1.5" rows={2} /></div>
          <div className="sm:col-span-2"><Label>Internal Notes</Label><Textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} className="mt-1.5" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Save Changes</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// === Event Dialog ===
function EventDialog({ shipmentId, event, nextSortOrder, onClose, onSaved }: {
  shipmentId: string;
  event: TrackingEvent | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: event?.title || '',
    status: (event?.status || 'in_transit') as ShipmentStatus,
    location: event?.location || '',
    description: event?.description || '',
    delay_reason: event?.delay_reason || '',
    image_url: event?.image_url || '',
    event_date: event ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop();
      const fileName = `event-${shipmentId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('shipment-images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('shipment-images').getPublicUrl(fileName);
      setForm({ ...form, image_url: urlData.publicUrl });
      toast.success('Image uploaded.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const data = {
        shipment_id: shipmentId,
        status: form.status,
        title: form.title,
        location: form.location,
        description: form.description,
        delay_reason: form.delay_reason,
        image_url: form.image_url,
        event_date: new Date(form.event_date).toISOString(),
      };

      if (isEdit && event) {
        const { error } = await supabase.from('tracking_events').update(data).eq('id', event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tracking_events').insert({
          ...data,
          sort_order: nextSortOrder,
          created_by: profile?.id,
        });
        if (error) throw error;
      }

      toast.success(isEdit ? 'Tracking event updated.' : 'Tracking event added.');
      onSaved();
      onClose();
    } catch {
      toast.error('Unable to save tracking event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tracking Update' : 'Add Shipment Update'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update the tracking event details.' : 'Add a new custom update to the shipment timeline.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Update Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" placeholder="e.g. Shipment Arrived at Processing Facility" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ShipmentStatus })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{SHIPMENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1.5" placeholder="e.g. Long Beach Port, CA, USA" />
          </div>
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Detailed Message</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={3} placeholder="Detailed description of the update" />
          </div>
          <div>
            <Label>Delay Reason (optional)</Label>
            <Input value={form.delay_reason} onChange={(e) => setForm({ ...form, delay_reason: e.target.value })} className="mt-1.5" placeholder="If delayed, provide the reason" />
          </div>
          <div>
            <Label>Image (optional)</Label>
            {form.image_url ? (
              <div className="relative mt-1.5 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="Event" className="h-24 rounded-lg border border-border object-cover" />
                <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <label className="mt-1.5 flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">{isEdit ? 'Update' : 'Add Update'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// === Delay Dialog ===
function DelayDialog({ shipmentId, onClose, onSaved }: { shipmentId: string; onClose: () => void; onSaved: () => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reason: '',
    explanation: '',
    new_estimated_delivery: '',
    location: '',
    customer_message: '',
  });

  async function handleSave() {
    if (!form.reason.trim()) {
      toast.error('Please provide a delay reason.');
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('delays').insert({
        shipment_id: shipmentId,
        reason: form.reason,
        explanation: form.explanation,
        new_estimated_delivery: form.new_estimated_delivery || null,
        location: form.location,
        customer_message: form.customer_message,
        is_active: true,
        created_by: profile?.id,
      });
      if (error) throw error;

      // Update shipment status to delayed
      await supabase.from('shipments').update({ status: 'delayed' }).eq('id', shipmentId);

      toast.success('Delay added successfully.');
      onSaved();
      onClose();
    } catch {
      toast.error('Unable to add delay.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Delay</DialogTitle>
          <DialogDescription>Record a delay for this shipment. This will be visible to customers on the tracking page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Delay Reason *</Label>
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-1.5" placeholder="e.g. Transportation schedule disruption" />
          </div>
          <div>
            <Label>Detailed Explanation</Label>
            <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} className="mt-1.5" rows={2} placeholder="Detailed explanation of the delay" />
          </div>
          <div>
            <Label>Current Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1.5" placeholder="Where the shipment currently is" />
          </div>
          <div>
            <Label>New Estimated Delivery Date</Label>
            <Input type="date" value={form.new_estimated_delivery} onChange={(e) => setForm({ ...form, new_estimated_delivery: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Customer-Facing Message</Label>
            <Textarea value={form.customer_message} onChange={(e) => setForm({ ...form, customer_message: e.target.value })} className="mt-1.5" rows={2} placeholder="Message shown to customers on the tracking page" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} variant="destructive">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
            <span className="ml-2">Add Delay</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// === Quick Status Dialog ===
function StatusDialog({ shipment, onClose, onSaved }: { shipment: Shipment; onClose: () => void; onSaved: () => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [location, setLocation] = useState(shipment.current_location);
  const [note, setNote] = useState('');

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('shipments').update({
        status,
        current_location: location || shipment.current_location,
      }).eq('id', shipment.id);

      if (error) throw error;

      // Add tracking event
      const info = getStatusInfo(status);
      await supabase.from('tracking_events').insert({
        shipment_id: shipment.id,
        status,
        title: info.label,
        location: location || shipment.current_location || '',
        description: note || `Shipment status updated to: ${info.label}`,
        event_date: new Date().toISOString(),
        sort_order: 999,
        created_by: profile?.id,
      });

      toast.success('Status updated successfully.');
      onSaved();
      onClose();
    } catch {
      toast.error('Unable to update status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>Change the shipment status and add a tracking event.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{SHIPMENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" placeholder="Current location" />
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" rows={2} placeholder="Additional details for the tracking event" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Update Status</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// === Quick Location Dialog ===
function LocationDialog({ shipment, onClose, onSaved }: { shipment: Shipment; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(shipment.current_location);
  const [latitude, setLatitude] = useState(shipment.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(shipment.longitude?.toString() || '');

  async function handleSave() {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('shipments').update({
        current_location: location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }).eq('id', shipment.id);

      if (error) throw error;
      toast.success('Location updated successfully.');
      onSaved();
      onClose();
    } catch {
      toast.error('Unable to update location.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
          <DialogDescription>Manually set the current location of the shipment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Current Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" placeholder="e.g. Singapore Port, Singapore" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Latitude (optional)</Label>
              <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="mt-1.5" placeholder="1.3521" />
            </div>
            <div>
              <Label>Longitude (optional)</Label>
              <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="mt-1.5" placeholder="103.8198" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Update Location</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
