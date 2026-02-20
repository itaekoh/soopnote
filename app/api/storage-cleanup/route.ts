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
  if (!authHeader?.startsWith('Bearer ')) return null;
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
      const children = await listAllFiles(admin, bucket, fullPath);
      paths.push(...children);
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

function getPublicUrl(
  admin: ReturnType<typeof getAdminClient>,
  bucket: string,
  path: string
): string {
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || '';
}

// GET: scan orphan files across images & documents buckets
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const admin = getAdminClient();

    // 1. List all files in both buckets
    const [imageFiles, documentFiles] = await Promise.all([
      listAllFiles(admin, 'images', ''),
      listAllFiles(admin, 'documents', ''),
    ]);

    // 2. Get all relevant columns from sn_posts
    const { data: posts, error: dbError } = await admin
      .from('sn_posts')
      .select('featured_image_url, attachment_url, content');

    if (dbError) throw new Error(`DB query failed: ${dbError.message}`);

    // Build a set of all referenced URLs (featured_image_url + attachment_url)
    const referencedUrls = new Set<string>();
    // Also collect all content for inline image search
    const allContent: string[] = [];

    for (const post of posts || []) {
      if (post.featured_image_url) referencedUrls.add(post.featured_image_url);
      if (post.attachment_url) referencedUrls.add(post.attachment_url);
      if (post.content) allContent.push(post.content);
    }

    const joinedContent = allContent.join(' ');

    // 3. Find orphan images
    const imageOrphans: string[] = [];
    for (const path of imageFiles) {
      const publicUrl = getPublicUrl(admin, 'images', path);
      if (!referencedUrls.has(publicUrl) && !joinedContent.includes(publicUrl)) {
        imageOrphans.push(path);
      }
    }

    // 4. Find orphan documents
    const documentOrphans: string[] = [];
    for (const path of documentFiles) {
      const publicUrl = getPublicUrl(admin, 'documents', path);
      if (!referencedUrls.has(publicUrl)) {
        documentOrphans.push(path);
      }
    }

    return jsonResponse({
      images: {
        total: imageFiles.length,
        orphans: imageOrphans,
      },
      documents: {
        total: documentFiles.length,
        orphans: documentOrphans,
      },
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Storage cleanup scan error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

// DELETE: remove specified orphan files from a given bucket
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateAdmin(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { bucket, paths } = (await req.json()) as { bucket: string; paths: string[] };
    if (!bucket || !Array.isArray(paths) || paths.length === 0) {
      return jsonResponse({ error: 'bucket and paths are required' }, 400);
    }

    const allowed = ['images', 'documents'];
    if (!allowed.includes(bucket)) {
      return jsonResponse({ error: 'Invalid bucket' }, 400);
    }

    const admin = getAdminClient();
    const { error } = await admin.storage.from(bucket).remove(paths);
    if (error) throw new Error(`Storage delete failed: ${error.message}`);

    return jsonResponse({ deleted: paths.length });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Storage cleanup delete error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
