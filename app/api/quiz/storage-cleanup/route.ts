import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

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
  return user;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function listAllFiles(
  admin: ReturnType<typeof getAdminClient>,
  bucket: string,
  folder: string
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await admin.storage.from(bucket).list(folder, { limit: 1000 });
  if (error || !data) return paths;

  for (const item of data) {
    const fullPath = folder ? `${folder}/${item.name}` : item.name;
    if (item.id === null) {
      // It's a folder — recurse
      const children = await listAllFiles(admin, bucket, fullPath);
      paths.push(...children);
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

// GET: scan for orphan files
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const admin = getAdminClient();

    // 1. Collect all storage files recursively
    const allFiles = await listAllFiles(admin, 'quiz_public', '');

    // 2. Get all image_path values from DB
    const { data: rows, error: dbError } = await admin
      .from('quiz_items')
      .select('image_path');

    if (dbError) {
      throw new Error(`DB query failed: ${dbError.message}`);
    }

    const usedPaths = new Set(
      (rows || []).map((r: { image_path: string }) => r.image_path).filter(Boolean)
    );

    // 3. Diff
    const orphans = allFiles.filter((f) => !usedPaths.has(f));

    return jsonResponse({
      orphans,
      totalFiles: allFiles.length,
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
