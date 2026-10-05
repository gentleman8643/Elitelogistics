'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, Users, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import type { SiteSettings, AdminProfile } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [removeAdminId, setRemoveAdminId] = useState<string | null>(null);

  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient();
      const [{ data: settingsData }, { data: adminData }] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('admin_profiles').select('*').order('created_at', { ascending: false }),
      ]);
      setSettings(settingsData as SiteSettings);
      setAdmins((adminData || []) as AdminProfile[]);
      setLoading(false);
    }
    loadData();
  }, []);

  function updateSettings(field: keyof SiteSettings, value: string) {
    if (settings) setSettings({ ...settings, [field]: value });
  }

  async function handleSaveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from('settings').update({
        company_name: settings.company_name,
        contact_email: settings.contact_email,
        phone: settings.phone,
        company_phone_full: settings.company_phone_full,
        whatsapp_number: settings.whatsapp_number,
        signal_contact_url: settings.signal_contact_url,
        address: settings.address,
        business_hours: settings.business_hours,
        social_facebook: settings.social_facebook,
        social_twitter: settings.social_twitter,
        social_linkedin: settings.social_linkedin,
        social_instagram: settings.social_instagram,
        website_description: settings.website_description,
        updated_at: new Date().toISOString(),
      }).eq('id', 1);

      if (error) throw error;
      toast.success('Settings saved successfully.');
    } catch {
      toast.error('Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function removeAdmin(adminId: string) {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('admin_profiles').delete().eq('id', adminId);
    if (error) {
      toast.error('Unable to remove admin.');
      return;
    }
    setAdmins(admins.filter((a) => a.id !== adminId));
    toast.success('Admin removed.');
    setRemoveAdminId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="py-20 text-center">
        <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage website information and admin accounts.</p>
      </div>

      {/* General Settings */}
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-lg">Website Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" value={settings?.company_name || ''} onChange={(e) => updateSettings('company_name', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" value={settings?.contact_email || ''} onChange={(e) => updateSettings('contact_email', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Display Phone</Label>
            <Input id="phone" value={settings?.phone || ''} onChange={(e) => updateSettings('phone', e.target.value)} className="mt-1.5" placeholder="(213) 942-0224" />
          </div>
          <div>
            <Label htmlFor="company_phone_full">Full Phone (for tel: links)</Label>
            <Input id="company_phone_full" value={settings?.company_phone_full || ''} onChange={(e) => updateSettings('company_phone_full', e.target.value)} className="mt-1.5" placeholder="+12139420224" />
          </div>
          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input id="whatsapp_number" value={settings?.whatsapp_number || ''} onChange={(e) => updateSettings('whatsapp_number', e.target.value)} className="mt-1.5" placeholder="12139420224" />
          </div>
          <div>
            <Label htmlFor="signal_contact_url">Signal Contact URL</Label>
            <Input id="signal_contact_url" value={settings?.signal_contact_url || ''} onChange={(e) => updateSettings('signal_contact_url', e.target.value)} className="mt-1.5" placeholder="https://signal.me/#p/+12139420224" />
          </div>
          <div>
            <Label htmlFor="business_hours">Business Hours</Label>
            <Input id="business_hours" value={settings?.business_hours || ''} onChange={(e) => updateSettings('business_hours', e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={settings?.address || ''} onChange={(e) => updateSettings('address', e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website_description">Website Description</Label>
            <Textarea id="website_description" value={settings?.website_description || ''} onChange={(e) => updateSettings('website_description', e.target.value)} className="mt-1.5" rows={2} />
          </div>
          <div>
            <Label htmlFor="social_facebook">Facebook URL</Label>
            <Input id="social_facebook" value={settings?.social_facebook || ''} onChange={(e) => updateSettings('social_facebook', e.target.value)} className="mt-1.5" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <Label htmlFor="social_twitter">Twitter URL</Label>
            <Input id="social_twitter" value={settings?.social_twitter || ''} onChange={(e) => updateSettings('social_twitter', e.target.value)} className="mt-1.5" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <Label htmlFor="social_linkedin">LinkedIn URL</Label>
            <Input id="social_linkedin" value={settings?.social_linkedin || ''} onChange={(e) => updateSettings('social_linkedin', e.target.value)} className="mt-1.5" placeholder="https://linkedin.com/..." />
          </div>
          <div>
            <Label htmlFor="social_instagram">Instagram URL</Label>
            <Input id="social_instagram" value={settings?.social_instagram || ''} onChange={(e) => updateSettings('social_instagram', e.target.value)} className="mt-1.5" placeholder="https://instagram.com/..." />
          </div>
        </CardContent>
        <div className="flex justify-end border-t border-border p-4">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Save Settings</span>
          </Button>
        </div>
      </Card>

      {/* Admin Management */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Admin Accounts</CardTitle>
          <Button size="sm" onClick={() => setAddAdminOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">Added {format(new Date(admin.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={admin.role === 'super_admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                    {admin.role.replace('_', ' ')}
                  </Badge>
                  {admin.id !== profile?.id && (
                    <Button variant="ghost" size="icon" onClick={() => setRemoveAdminId(admin.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      {addAdminOpen && (
        <AddAdminDialog onClose={() => setAddAdminOpen(false)} onAdded={() => {
          setAddAdminOpen(false);
          // Reload admins
          createBrowserClient().from('admin_profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
            setAdmins((data || []) as AdminProfile[]);
          });
        }} />
      )}

      {/* Remove Admin Confirmation */}
      <AlertDialog open={!!removeAdminId} onOpenChange={(open) => !open && setRemoveAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin?</AlertDialogTitle>
            <AlertDialogDescription>This will revoke admin access for this user. They will no longer be able to log in to the dashboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeAdminId && removeAdmin(removeAdminId)} className="bg-red-600 hover:bg-red-700">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddAdminDialog({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('admin');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, name: name.trim(), role }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Failed to create admin account.');
      }

      toast.success('Admin account created successfully.');
      onAdded();
    } catch (err: any) {
      toast.error(err.message || 'Unable to create admin account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Admin Account</DialogTitle>
          <DialogDescription>Create a new admin account with limited access.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Admin name" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="admin@elitelogistics.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" placeholder="At least 8 characters" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'viewer')}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin / Staff — Can create and edit shipments</SelectItem>
                <SelectItem value="viewer">Viewer — Can view shipments only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2">Create Account</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
