import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function json(data: object, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseAdmin = createClient(
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

    const { from, to } = await req.json() as { from?: string; to?: string };
    if (!from || !to) {
      return json({ error: 'from and to paths required' }, 400);
    }

    // 경로 검증 — quiz/{item_id}/* 또는 pending/{...}/* 형식만 허용
    const PATH_REGEX = /^(quiz|pending)\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)*$/;
    if (!PATH_REGEX.test(from) || from.includes('..')) {
      return json({ error: 'invalid from path' }, 400);
    }
    if (!PATH_REGEX.test(to) || to.includes('..')) {
      return json({ error: 'invalid to path' }, 400);
    }

    const { error } = await supabaseAdmin.storage
      .from('quiz_public')
      .move(from, to);

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({ moved: true, from, to });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('move-file error:', error);
    return json({ error: error.message }, 500);
  }
}
