import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// 토큰 비용 없는 가벼운 연결 점검 (models 조회)
export const runtime = 'nodejs';
export const maxDuration = 15;

function json(body: Record<string, unknown>, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  try {
    // 인증 + 권한 (생성 API와 동일 패턴)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];

    const supabaseAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await supabaseAdmin
      .from('sn_users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || !['super_admin', 'writer'].includes(profile.role)) {
      return json({ error: 'Forbidden' }, 403);
    }

    // 1) 키 자체가 없는 경우
    if (!process.env.ANTHROPIC_API_KEY) {
      return json({ status: 'not_configured', message: 'API 키가 설정되지 않았습니다.' });
    }

    // 2) 키 유효성 확인 (models 조회 — 무료, 토큰 미소모)
    try {
      const anthropic = new Anthropic();
      await anthropic.models.retrieve('claude-sonnet-4-6');
      return json({ status: 'connected', model: 'claude-sonnet-4-6' });
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      if (err?.status === 401) {
        return json({ status: 'invalid_key', message: 'API 키가 유효하지 않습니다.' });
      }
      return json({ status: 'error', message: err?.message || '연결 확인에 실패했습니다.' });
    }
  } catch (e: unknown) {
    const err = e as Error;
    return json({ status: 'error', message: err.message || '연결 확인에 실패했습니다.' }, 500);
  }
}
