'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmins() {
      const supabase = createBrowserClient();
      const { data } = await supabase.rpc('admin_exists');
      setHasAdmins(Boolean(data));
    }
    checkAdmins();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('This account does not have admin access.');
      }

      toast.success('Welcome back!');
      // Use replace so back button doesn't return to login
      router.replace('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  if (hasAdmins === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md border-border/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Package className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Elite Logistics — First Admin Setup</CardTitle>
            <CardDescription>
              No administrator accounts exist yet. Create the first super admin account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/setup">Go to Setup Page</Link>
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Package className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Elite Logistics — Administrator Login</CardTitle>
          <CardDescription>Sign in to access the Elite Logistics dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" placeholder="admin@elitelogistics.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="px-10" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span className="ml-2">{loading ? 'Signing in...' : 'Sign In'}</span>
            </Button>
          </form>
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
