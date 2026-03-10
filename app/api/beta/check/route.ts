import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MIN_QUIZ_SESSIONS = 10; // 퀴즈 세션 최소 횟수

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    // 1. 신청자 확인
    const { data: applicant } = await supabaseAdmin
      .from('beta_applicants')
      .select('id, name, applied_at, benefit_granted, benefit_months, benefit_granted_at')
      .eq('email', email)
      .single();

    if (!applicant) {
      return NextResponse.json({ error: '신청 내역이 없습니다.' }, { status: 404 });
    }

    // 2. sn_users에서 user_id 조회
    const { data: user } = await supabaseAdmin
      .from('sn_users')
      .select('id, ads_free_until')
      .eq('email', email)
      .single();

    if (!user) {
      // 앱에 아직 로그인 안 한 경우
      return NextResponse.json({
        applicant,
        quizSessions: 0,
        qualified: false,
        appLinked: false,
        message: '앱에서 해당 이메일로 로그인한 기록이 없습니다.',
      });
    }

    // 3. quiz_attempts: distinct quiz_run_id 수 = 퀴즈 세션 횟수
    const { count: quizSessions } = await supabaseAdmin
      .from('quiz_attempts')
      .select('quiz_run_id', { count: 'exact', head: false })
      .eq('user_id', user.id)
      .eq('attempt_no', 1); // 1차 시도만 카운트 (중복 제거 효과)

    // 4. 현재 혜택 부여된 수 (선착순 판단용)
    const { count: grantedCount } = await supabaseAdmin
      .from('beta_applicants')
      .select('*', { count: 'exact', head: true })
      .eq('benefit_granted', true);

    const sessions = quizSessions ?? 0;
    const granted = grantedCount ?? 0;

    return NextResponse.json({
      applicant,
      quizSessions: sessions,
      qualified: sessions >= MIN_QUIZ_SESSIONS,
      appLinked: true,
      benefitMonthsIfGranted: granted < 10 ? 12 : 6, // 선착순 10명 1년, 나머지 6개월
      slotsRemaining: { year: Math.max(0, 10 - granted), half: Math.max(0, 20 - granted) },
    });
  } catch (error: any) {
    console.error('[beta/check]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
