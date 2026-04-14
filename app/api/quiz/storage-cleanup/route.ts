import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// edge → nodejs: 재귀 API 호출이 많아 edge 타임아웃 발생 방지
export const runtime = 'nodejs';

function jsonResponse(data: object, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user) return null;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('sn_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') return null;

  return user;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: scan for orphan files
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const admin = getAdminClient();

    // 1. Get all image_path values from DB
    const { data: rows, error: dbError } = await admin
      .from('quiz_items')
      .select('image_path');

    if (dbError) {
      throw new Error(`DB query failed: ${dbError.message}`);
    }

    const usedPaths = new Set(
      (rows || []).map((r: { image_path: string }) => r.image_path).filter(Boolean)
    );

    const orphans: string[] = [];
    let totalFiles = 0;

    // 2. Scan pending/ folder (단일 API 호출)
    const { data: pendingFiles, error: pendingErr } = await admin.storage
      .from('quiz_public')
      .list('pending', { limit: 1000 });

    if (!pendingErr && pendingFiles) {
      for (const file of pendingFiles) {
        if (file.id !== null) {
          // actual file (not subfolder)
          totalFiles++;
          const path = `pending/${file.name}`;
          if (!usedPaths.has(path)) {
            orphans.push(path);
          }
        }
      }
    }

    // 3. Scan quiz/ subfolders (item_id 단위)
    const { data: quizFolders, error: quizErr } = await admin.storage
      .from('quiz_public')
      .list('quiz', { limit: 1000 });

    if (!quizErr && quizFolders) {
      for (const folder of quizFolders) {
        if (folder.id === null) {
          // subfolder = item_id
          const itemId = folder.name;
          const { data: files } = await admin.storage
            .from('quiz_public')
            .list(`quiz/${itemId}`, { limit: 100 });

          for (const file of files || []) {
            if (file.id !== null) {
              totalFiles++;
              const path = `quiz/${itemId}/${file.name}`;
              if (!usedPaths.has(path)) {
                orphans.push(path);
              }
            }
          }
        }
      }
    }

    return jsonResponse({
      orphans,
      totalFiles,
      usedFiles: usedPaths.size,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Storage cleanup scan error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

// DELETE: remove specified orphan files
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { paths } = (await req.json()) as { paths: string[] };
    if (!Array.isArray(paths) || paths.length === 0) {
      return jsonResponse({ error: 'No paths provided' }, 400);
    }

    const admin = getAdminClient();
    const { error } = await admin.storage.from('quiz_public').remove(paths);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }

    return jsonResponse({ deleted: paths.length });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Storage cleanup delete error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
