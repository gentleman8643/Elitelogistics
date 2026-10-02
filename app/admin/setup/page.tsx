'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function AdminSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    async function checkAdmins() {
      const supabase = createBrowserClient();
      const { data } = await supabase.from('admin_profiles').select('id').limit(1);
      setAdminExists((data?.length ?? 0) > 0);
      setChecking(false);
    }
    checkAdmins();
  }, []);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    const failedRule = PASSWORD_RULES.find((r) => !r.test(password));
    if (failedRule) {
      toast.error(`Password requirement not met: ${failedRule.label}`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient();

      // Check if any admin already exists (double-check on submit)
      const { data: existing } = await supabase
        .from('admin_profiles')
        .select('id')
        .limit(1);
      if (existing && existing.length > 0) {
        toast.error('An admin account already exists. Please log in instead.');
        router.push('/admin/login');
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Unable to create account.');

      // Insert the admin profile row — RLS allows this because no super_admin exists yet
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({ id: data.user.id, name, role: 'super_admin' });

      if (profileError) {
        // Profile insert failed — clean up the auth user so they can retry
        await supabase.auth.signOut();
        throw new Error('Account created but profile setup failed. Please try again.');
      }

      toast.success('Administrator account created successfully! Please log in.');
      // Sign out the setup session so the user logs in fresh
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (err: any) {
      toast.error(err.message || 'Unable to create admin account.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-border/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Setup Unavailable</CardTitle>
            <CardDescription>
              An administrator account already exists. For security, the initial setup page is disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/login">Go to Admin Login</Link>
            </Button>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                <span className="inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to website
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Package className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Elite Logistics — First Admin Setup</CardTitle>
          <CardDescription>
            Create the first super administrator account. This page will be disabled after setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <Label htmlFor="name">Admin Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" placeholder="John Smith" />
            </div>
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" placeholder="admin@elitelogistics.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="px-10" placeholder="Strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm" type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="pl-10" placeholder="Re-enter password" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-slate-50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Password requirements:</p>
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule.label} className="flex items-center gap-2 text-xs">
                    {rule.test(password) ? <Check className="h-3.5 w-3.5 text-green-600" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className={rule.test(password) ? 'text-green-700' : 'text-muted-foreground'}>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span className="ml-2">{loading ? 'Creating account...' : 'Create Super Admin Account'}</span>
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
              <span className="inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Go to login
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
