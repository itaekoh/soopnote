export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 워터마크 타일 PNG (프로세스 시작 시 1회 로드)
const watermarkTile = readFileSync(
  join(process.cwd(), 'assets', 'watermark-tile.png')
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

    // 1. 리사이즈
    const resizedBuffer = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    // TODO: 워터마크 임시 비활성화 — 기본 이미지 파이프라인 확인용
    const outputBuffer = resizedBuffer;

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
