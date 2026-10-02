import { createServerClient as createSSRClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login and setup pages through
  if (!pathname.startsWith('/admin') || pathname === '/admin/login' || pathname === '/admin/setup') {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  let res = NextResponse.next({ request: req });

  const supabase = createSSRClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session and get the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user has admin profile
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
