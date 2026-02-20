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
    const itemId = formData.get('item_id') as string | null;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${nanoid()}.${fileExtension}`;
    const filePath = itemId
      ? `quiz/${itemId}/${fileName}`
      : `pending/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('quiz_public')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Quiz Upload Error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('quiz_public')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
      throw new Error('Failed to get public URL for the uploaded file.');
    }

    return new NextResponse(
      JSON.stringify({ path: filePath, publicUrl: publicUrlData.publicUrl }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Quiz Upload Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
