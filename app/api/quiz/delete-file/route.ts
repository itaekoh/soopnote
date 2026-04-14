import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function json(data: object, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(req: NextRequest) {
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

    const body = await req.json() as { path?: string };
    if (!body.path || typeof body.path !== 'string') {
      return json({ error: 'path required' }, 400);
    }

    const { error } = await supabaseAdmin.storage.from('quiz_public').remove([body.path]);
    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({ deleted: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('delete-file error:', error);
    return json({ error: error.message }, 500);
  }
}
