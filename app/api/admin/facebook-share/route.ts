import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const GRAPH_VERSION = 'v21.0';

function json(body: Record<string, unknown>, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    // ── 인증 + 권한 ──────────────────────────────────────
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

    // ── 설정 확인 ────────────────────────────────────────
    const pageId = process.env.FB_PAGE_ID;
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!pageId || !pageToken) {
      return json(
        { error: '페이스북이 아직 설정되지 않았습니다. (FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN 환경변수 필요)' },
        400
      );
    }

    // ── 입력 ─────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const url = (body.url as string | undefined)?.trim();
    const message = (body.message as string | undefined)?.trim() || '';
    if (!url) {
      return json({ error: '게시할 글 링크(url)가 필요합니다.' }, 400);
    }

    // ── 페이지 피드에 링크 게시 ──────────────────────────
    const params = new URLSearchParams();
    params.append('message', message);
    params.append('link', url);
    params.append('access_token', pageToken);

    const fbRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`, {
      method: 'POST',
      body: params,
    });
    const fbData = await fbRes.json().catch(() => ({}));

    if (!fbRes.ok || fbData.error) {
      const msg = fbData.error?.message || `페이스북 게시 실패 (HTTP ${fbRes.status})`;
      return json({ error: msg }, 502);
    }

    return json({ ok: true, fbPostId: fbData.id });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('페이스북 게시 실패:', error);
    return json({ error: error.message || '페이스북 게시에 실패했습니다.' }, 500);
  }
}
