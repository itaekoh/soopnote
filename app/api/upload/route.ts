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

    // 2. SERVICE ROLE KEY로 Storage 업로드 (RLS 우회)
    const supabaseAdmin = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // 파일 확장자 추출 및 정리
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    // 안전한 파일명 생성 (nanoid + 확장자)
    const fileName = `${nanoid()}.${fileExtension}`;
    const filePath = `public/${userId}/${fileName}`;

    console.log('📁 업로드 파일 정보:', {
      originalName: file.name,
      sanitizedName: fileName,
      path: filePath,
      size: file.size,
      type: file.type,
      userId: userId
    });

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
    console.error('Unhandled Upload Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
