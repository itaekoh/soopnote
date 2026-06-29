import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PERSONA, PERSONA_SETTING_KEY } from '@/lib/ai-write/prompt';

export const runtime = 'nodejs';

function json(body: Record<string, unknown>, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// 인증 + 권한(super_admin/writer) 확인 후 supabaseAdmin 반환
async function authorize(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: json({ error: 'Unauthorized' }, 401) };
  }
  const token = authHeader.split(' ')[1];

  const supabaseAuth = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !user) {
    return { error: json({ error: 'Unauthorized' }, 401) };
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
    return { error: json({ error: 'Forbidden' }, 403) };
  }
  return { supabaseAdmin };
}

// 현재 편집 가능한 페르소나 + 기본값 반환
export async function GET(req: NextRequest) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { supabaseAdmin } = auth;

  let persona = DEFAULT_PERSONA;
  let isCustom = false;
  let tableReady = true;
  try {
    const { data, error } = await supabaseAdmin!
      .from('sn_settings')
      .select('value')
      .eq('key', PERSONA_SETTING_KEY)
      .single();
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = 행 없음(정상). 그 외 에러는 테이블 미존재 등으로 간주
      tableReady = false;
    } else if (data?.value?.trim()) {
      persona = data.value;
      isCustom = true;
    }
  } catch {
    tableReady = false;
  }

  return json({ persona, defaultPersona: DEFAULT_PERSONA, isCustom, tableReady });
}

// 페르소나 저장(없으면 생성)
export async function PUT(req: NextRequest) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { supabaseAdmin } = auth;

  const body = await req.json().catch(() => ({}));
  const persona = (body.persona as string | undefined)?.trim();
  if (!persona) {
    return json({ error: '내용을 입력해주세요.' }, 400);
  }

  const { error } = await supabaseAdmin!
    .from('sn_settings')
    .upsert(
      { key: PERSONA_SETTING_KEY, value: persona, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) {
    return json(
      {
        error:
          'sn_settings 테이블에 저장하지 못했습니다. 테이블이 생성되어 있는지 확인해주세요. (' +
          error.message +
          ')',
      },
      500
    );
  }
  return json({ ok: true });
}
