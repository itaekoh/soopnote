import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MIN_QUIZ_SESSIONS = 10;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const emailLower = email?.trim().toLowerCase();

    if (!emailLower) {
      return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
    }

    // 1. 신청자 확인
    const { data: applicant } = await supabaseAdmin
      .from('beta_applicants')
      .select('id, benefit_granted')
      .eq('email', emailLower)
      .single();

    if (!applicant) {
      return NextResponse.json({ error: '신청 내역이 없습니다.' }, { status: 404 });
    }
    if (applicant.benefit_granted) {
      return NextResponse.json({ error: '이미 혜택이 적용되었습니다.' }, { status: 409 });
    }

    // 2. 앱 사용자 확인
    const { data: user } = await supabaseAdmin
      .from('sn_users')
      .select('id')
      .eq('email', emailLower)
      .single();

    if (!user) {
      return NextResponse.json({ error: '앱에서 해당 이메일로 로그인한 기록이 없습니다.' }, { status: 404 });
    }

    // 3. 퀴즈 세션 수 재확인 (서버에서 검증)
    const { count: quizSessions } = await supabaseAdmin
      .from('quiz_attempts')
      .select('quiz_run_id', { count: 'exact', head: false })
      .eq('user_id', user.id)
      .eq('attempt_no', 1);

    if ((quizSessions ?? 0) < MIN_QUIZ_SESSIONS) {
      return NextResponse.json({
        error: `퀴즈 ${MIN_QUIZ_SESSIONS}세션 이상 참여 후 신청 가능합니다. (현재: ${quizSessions ?? 0}세션)`,
      }, { status: 403 });
    }

    // 4. 선착순 자리 확인 및 혜택 개월 수 결정
    const { count: grantedCount } = await supabaseAdmin
      .from('beta_applicants')
      .select('*', { count: 'exact', head: true })
      .eq('benefit_granted', true);

    const granted = grantedCount ?? 0;
    if (granted >= 20) {
      return NextResponse.json({ error: '모든 혜택 자리가 마감되었습니다.' }, { status: 409 });
    }

    const benefitMonths = granted < 10 ? 12 : 6;
    const adsFreUntil = new Date();
    adsFreUntil.setMonth(adsFreUntil.getMonth() + benefitMonths);
    const adminNote = `beta_tester_2025_${benefitMonths}m`;

    // 5. sn_users 업데이트
    const { error: updateUserError } = await supabaseAdmin
      .from('sn_users')
      .update({
        ads_free_until: adsFreUntil.toISOString(),
        admin_note: adminNote,
      })
      .eq('id', user.id);

    if (updateUserError) throw updateUserError;

    // 6. beta_applicants 업데이트
    const { error: updateApplicantError } = await supabaseAdmin
      .from('beta_applicants')
      .update({
        benefit_granted: true,
        benefit_months: benefitMonths,
        benefit_granted_at: new Date().toISOString(),
        user_id: user.id,
      })
      .eq('id', applicant.id);

    if (updateApplicantError) throw updateApplicantError;

    return NextResponse.json({
      message: `${benefitMonths}개월 광고 제거 혜택이 적용되었습니다!`,
      benefitMonths,
      adsFreUntil: adsFreUntil.toISOString(),
    });
  } catch (error: any) {
    console.error('[beta/grant]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
