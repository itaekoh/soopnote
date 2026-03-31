export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: item, error: dbError } = await supabaseAdmin
      .from('quiz_items')
      .select('image_path')
      .eq('id', id)
      .single();

    if (dbError || !item || !item.image_path) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const { data: fileData, error: storageError } = await supabaseAdmin.storage
      .from('quiz_public')
      .download(item.image_path);

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: 'Image not found in storage' },
        { status: 404 }
      );
    }

    const imageBuffer = Buffer.from(await fileData.arrayBuffer());

    // 리사이즈 + 품질 제한 (워터마크는 클라이언트 CSS 오버레이)
    const outputBuffer = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
