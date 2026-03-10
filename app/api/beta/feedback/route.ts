import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { email, content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
    }
    if (content.trim().length < 5) {
      return NextResponse.json({ error: '내용을 5자 이상 입력해주세요.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('beta_feedback')
      .insert({
        email: email?.trim().toLowerCase() || null,
        content: content.trim(),
      });

    if (error) throw error;

    return NextResponse.json({ message: '소중한 의견 감사합니다!' });
  } catch (error: any) {
    console.error('[beta/feedback]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
