'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/lib/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  SHIPMENT_TYPE_OPTIONS,
  DELIVERY_PRIORITIES,
  SHIPMENT_STATUSES,
  getServiceInfo,
} from '@/lib/constants';
import type { ShipmentType, DeliveryPriority, ShipmentStatus } from '@/lib/types';
import { toast } from 'sonner';

function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ELT-${year}-${random}`;
}

export default function CreateShipmentPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(generateTrackingNumber());
  const [imageUrl, setImageUrl] = useState('');

  const [form, setForm] = useState({
    reference_number: '',
    shipment_type: 'international' as ShipmentType,
    package_description: '',
    package_category: '',
    weight: '',
    dimensions: '',
    quantity: '1',
    sender_name: '',
    sender_company: '',
    sender_country: '',
    sender_city: '',
    sender_contact: '',
    recipient_name: '',
    recipient_company: '',
    recipient_country: '',
    recipient_city: '',
    recipient_contact: '',
    origin: '',
    destination: '',
    current_location: '',
    latitude: '',
    longitude: '',
    estimated_delivery: '',
    delivery_priority: 'standard' as DeliveryPriority,
    status: 'created' as ShipmentStatus,
    customer_notes: '',
    internal_notes: '',
  });

  function handleChange(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop();
      const fileName = `shipment-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('shipment-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('shipment-images')
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      toast.success('Image uploaded successfully.');
    } catch {
      toast.error('Unable to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage() {
    setImageUrl('');
  }

  function copyTracking() {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function regenerateTracking() {
    setTrackingNumber(generateTrackingNumber());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.recipient_name && !form.recipient_name.trim()) {
      toast.error('Please enter at least a recipient name.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();

      // Check uniqueness
      const { data: existing } = await supabase
        .from('shipments')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .maybeSingle();

      if (existing) {
        const newTracking = generateTrackingNumber();
        setTrackingNumber(newTracking);
        toast.error('Tracking number collision detected. A new one has been generated.');
        setLoading(false);
        return;
      }

      const insertData = {
        tracking_number: trackingNumber,
        reference_number: form.reference_number,
        shipment_type: form.shipment_type,
        package_description: form.package_description,
        package_category: form.package_category,
        weight: form.weight ? parseFloat(form.weight) : 0,
        dimensions: form.dimensions,
        quantity: form.quantity ? parseInt(form.quantity) : 1,
        image_url: imageUrl,
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
        current_location: form.current_location || form.origin,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        estimated_delivery: form.estimated_delivery || null,
        original_estimated_delivery: form.estimated_delivery || null,
        delivery_priority: form.delivery_priority,
        status: form.status,
        customer_notes: form.customer_notes,
        internal_notes: form.internal_notes,
        created_by: profile?.id,
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;

      // Create initial tracking event
      await supabase.from('tracking_events').insert({
        shipment_id: data.id,
        status: form.status,
        title: 'Shipment Created',
        location: form.origin || form.current_location || '',
        description: `Shipment ${trackingNumber} has been created and is ready for processing.`,
        event_date: new Date().toISOString(),
        sort_order: 0,
        created_by: profile?.id,
      });

      toast.success('Shipment created successfully!');
      router.push(`/admin/shipments/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to create shipment. Please check the required fields.');
    } finally {
      setLoading(false);
    }
  }

  const canEdit = profile?.role !== 'viewer';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/shipments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Shipment</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the shipment details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tracking Number */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Tracking Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-11 flex-1 items-center rounded-md border border-input bg-slate-50 px-4 font-mono text-base font-medium">
                  {trackingNumber}
                </div>
                <Button type="button" variant="outline" size="icon" onClick={copyTracking} title="Copy tracking number">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="outline" onClick={regenerateTracking} title="Generate new tracking number">
                  Refresh
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This tracking number is automatically generated and unique. Copy it to share with the customer.
            </p>
          </CardContent>
        </Card>

        {/* Shipment Information */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Shipment Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input id="reference_number" value={form.reference_number} onChange={(e) => handleChange('reference_number', e.target.value)} className="mt-1.5" placeholder="Customer reference" />
            </div>
            <div>
              <Label htmlFor="shipment_type">Shipment Type *</Label>
              <Select value={form.shipment_type} onValueChange={(v) => handleChange('shipment_type', v)}>
                <SelectTrigger id="shipment_type" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHIPMENT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="package_category">Package Category</Label>
              <Input id="package_category" value={form.package_category} onChange={(e) => handleChange('package_category', e.target.value)} className="mt-1.5" placeholder="e.g. Electronics" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="package_description">Package Description</Label>
              <Input id="package_description" value={form.package_description} onChange={(e) => handleChange('package_description', e.target.value)} className="mt-1.5" placeholder="Brief description of the package contents" />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.01" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} className="mt-1.5" placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input id="dimensions" value={form.dimensions} onChange={(e) => handleChange('dimensions', e.target.value)} className="mt-1.5" placeholder="e.g. 50x40x30 cm" />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} className="mt-1.5" placeholder="1" />
            </div>
          </CardContent>
        </Card>

        {/* Shipment Image */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Shipment Image</CardTitle>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Shipment" className="h-40 rounded-lg border border-border object-cover" />
                <button type="button" onClick={removeImage} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors">
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Upload image (max 5MB)</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage || !canEdit} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Sender */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Sender</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input id="sender_name" value={form.sender_name} onChange={(e) => handleChange('sender_name', e.target.value)} className="mt-1.5" placeholder="John Smith" />
            </div>
            <div>
              <Label htmlFor="sender_company">Company</Label>
              <Input id="sender_company" value={form.sender_company} onChange={(e) => handleChange('sender_company', e.target.value)} className="mt-1.5" placeholder="Company name" />
            </div>
            <div>
              <Label htmlFor="sender_country">Country</Label>
              <Input id="sender_country" value={form.sender_country} onChange={(e) => handleChange('sender_country', e.target.value)} className="mt-1.5" placeholder="United States" />
            </div>
            <div>
              <Label htmlFor="sender_city">City</Label>
              <Input id="sender_city" value={form.sender_city} onChange={(e) => handleChange('sender_city', e.target.value)} className="mt-1.5" placeholder="Los Angeles" />
            </div>
            <div>
              <Label htmlFor="sender_contact">Contact Info</Label>
              <Input id="sender_contact" value={form.sender_contact} onChange={(e) => handleChange('sender_contact', e.target.value)} className="mt-1.5" placeholder="Phone or email" />
            </div>
          </CardContent>
        </Card>

        {/* Recipient */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Recipient</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="recipient_name">Recipient Name</Label>
              <Input id="recipient_name" value={form.recipient_name} onChange={(e) => handleChange('recipient_name', e.target.value)} className="mt-1.5" placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="recipient_company">Company</Label>
              <Input id="recipient_company" value={form.recipient_company} onChange={(e) => handleChange('recipient_company', e.target.value)} className="mt-1.5" placeholder="Company name" />
            </div>
            <div>
              <Label htmlFor="recipient_country">Country</Label>
              <Input id="recipient_country" value={form.recipient_country} onChange={(e) => handleChange('recipient_country', e.target.value)} className="mt-1.5" placeholder="United Kingdom" />
            </div>
            <div>
              <Label htmlFor="recipient_city">City</Label>
              <Input id="recipient_city" value={form.recipient_city} onChange={(e) => handleChange('recipient_city', e.target.value)} className="mt-1.5" placeholder="London" />
            </div>
            <div>
              <Label htmlFor="recipient_contact">Contact Info</Label>
              <Input id="recipient_contact" value={form.recipient_contact} onChange={(e) => handleChange('recipient_contact', e.target.value)} className="mt-1.5" placeholder="Phone or email" />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" value={form.origin} onChange={(e) => handleChange('origin', e.target.value)} className="mt-1.5" placeholder="Origin facility" />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" value={form.destination} onChange={(e) => handleChange('destination', e.target.value)} className="mt-1.5" placeholder="Destination city, country" />
            </div>
            <div>
              <Label htmlFor="current_location">Current Location</Label>
              <Input id="current_location" value={form.current_location} onChange={(e) => handleChange('current_location', e.target.value)} className="mt-1.5" placeholder="Current facility (defaults to origin)" />
            </div>
            <div>
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} className="mt-1.5" placeholder="33.765" />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} className="mt-1.5" placeholder="-118.195" />
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="estimated_delivery">Estimated Delivery Date</Label>
              <Input id="estimated_delivery" type="date" value={form.estimated_delivery} onChange={(e) => handleChange('estimated_delivery', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="delivery_priority">Delivery Priority</Label>
              <Select value={form.delivery_priority} onValueChange={(v) => handleChange('delivery_priority', v)}>
                <SelectTrigger id="delivery_priority" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DELIVERY_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Current Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger id="status" className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHIPMENT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer_notes">Customer-Facing Notes</Label>
              <Textarea id="customer_notes" value={form.customer_notes} onChange={(e) => handleChange('customer_notes', e.target.value)} className="mt-1.5" rows={2} placeholder="Notes visible to customers on the tracking page" />
            </div>
            <div>
              <Label htmlFor="internal_notes">Internal Admin Notes</Label>
              <Textarea id="internal_notes" value={form.internal_notes} onChange={(e) => handleChange('internal_notes', e.target.value)} className="mt-1.5" rows={3} placeholder="Private notes for admin use only — never shown to customers" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/shipments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || !canEdit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">{loading ? 'Creating...' : 'Create Shipment'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
