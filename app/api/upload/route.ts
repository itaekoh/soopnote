import { NextRequest, NextResponse } from 'next/server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { optimizeUpload } from '@/lib/images/optimize';

// edge 가 아니라 nodejs. sharp 로 서버에서 이미지를 줄이기 때문이다.
// 예전에는 edge 라 서버에서 손댈 방법이 없어 브라우저 압축에만 기댔고,
// 그래서 압축을 안 하는 경로(관리자 AI 글쓰기)로 5MB 짜리가 그대로 올라갔다.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. ANON KEY로 사용자 인증 확인
    const supabaseAuth = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !user) {
      console.error('Upload Error: Unauthorized', userError);
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. SERVICE ROLE KEY + admin 권한 확인
    const supabaseAdmin = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabaseAdmin
      .from('sn_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'writer'].includes(profile.role)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden: Admin only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 파일 검증: MIME 타입 + 크기 제한
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!ALLOWED_MIMES.includes(file.type)) {
      return new NextResponse(JSON.stringify({ error: `허용되지 않는 파일 형식: ${file.type}` }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(JSON.stringify({ error: '파일 크기가 10MB를 초과합니다.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // 서버에서 줄인다. 브라우저 압축은 업로드 시간을 줄여 주지만,
    // 경로마다 설정이 다르고 PNG 는 목표치를 못 맞추면 원본을 그대로
    // 돌려주기 때문에 최종 보장이 되지 못한다.
    const optimized = await optimizeUpload(await file.arrayBuffer(), file.type);

    // 안전한 파일명 생성 (nanoid + 확장자)
    const fileName = `${nanoid()}.${optimized.extension}`;

    // folder=posts 면 대표 이미지(썸네일), 아니면 에디터 본문 이미지.
    // 썸네일도 이 API 를 거치게 해서 최적화를 한곳에서 책임진다.
    const folder = formData.get('folder');
    const filePath =
      folder === 'posts' ? `posts/${fileName}` : `public/${userId}/${fileName}`;

    console.log('📁 업로드:', {
      path: filePath,
      원본: `${(optimized.originalBytes / 1024 / 1024).toFixed(2)}MB ${file.type}`,
      저장: `${(optimized.bytes / 1024 / 1024).toFixed(2)}MB ${optimized.contentType}`,
      크기: optimized.width ? `${optimized.width}x${optimized.height}` : '-',
    });

    // Service Role Key로 Storage에 업로드 (RLS 우회)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, optimized.buffer, { contentType: optimized.contentType });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Public URL 생성
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
        throw new Error('Failed to get public URL for the uploaded file.');
    }
    
    return new NextResponse(
      JSON.stringify({
        location: publicUrlData.publicUrl,
        bytes: optimized.bytes,
        originalBytes: optimized.originalBytes,
        width: optimized.width,
        height: optimized.height,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Upload Error:', error);
    return new NextResponse(JSON.stringify({ error: '파일 업로드에 실패했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
