import { NextRequest, NextResponse } from 'next/server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

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

    const EXTENSION_MAP: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const fileExtension = EXTENSION_MAP[file.type] || 'jpg';

    // 안전한 파일명 생성 (nanoid + 확장자)
    const fileName = `${nanoid()}.${fileExtension}`;
    const filePath = `public/${userId}/${fileName}`;

    console.log('📁 업로드:', { path: filePath, size: file.size, type: file.type });

    // Service Role Key로 Storage에 업로드 (RLS 우회)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, file);

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
      JSON.stringify({ location: publicUrlData.publicUrl }),
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
