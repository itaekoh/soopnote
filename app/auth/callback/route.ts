import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 중간 페이지로 리다이렉트 → 브라우저 쿠키 정착 후 홈으로 이동
      return NextResponse.redirect(`${origin}/auth/complete`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
