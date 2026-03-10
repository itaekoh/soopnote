import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MAX_APPLICANTS = 20;

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: '이름과 이메일을 입력해주세요.' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // 1. 마감 여부 확인
    const { count, error: countError } = await supabaseAdmin
      .from('beta_applicants')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    if ((count ?? 0) >= MAX_APPLICANTS) {
      return NextResponse.json({ error: '신청이 마감되었습니다. (20명 선착순 완료)' }, { status: 409 });
    }

    // 2. 중복 신청 확인
    const { data: existing } = await supabaseAdmin
      .from('beta_applicants')
      .select('id')
      .eq('email', emailLower)
      .single();

    if (existing) {
      return NextResponse.json({ error: '이미 신청하신 이메일입니다.' }, { status: 409 });
    }

    // 3. 신청 등록
    const { error: insertError } = await supabaseAdmin
      .from('beta_applicants')
      .insert({ name: name.trim(), email: emailLower });

    if (insertError) throw insertError;

    return NextResponse.json({ message: '신청이 완료되었습니다.' });
  } catch (error: any) {
    console.error('[beta/apply]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
