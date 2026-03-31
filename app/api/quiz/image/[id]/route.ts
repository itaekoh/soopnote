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

    // 2. 메타데이터
    const metadata = await sharp(resizedBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;

    // 3. 워터마크 타일을 이미지 크기에 맞게 반복 생성
    const tileInfo = await sharp(watermarkTile).metadata();
    const tileW = tileInfo.width!;
    const tileH = tileInfo.height!;

    // 타일 배수 크기로 캔버스 생성 (경계 초과 방지)
    const canvasW = Math.ceil(width / tileW) * tileW;
    const canvasH = Math.ceil(height / tileH) * tileH;

    const composites: sharp.OverlayOptions[] = [];
    for (let y = 0; y < canvasH; y += tileH) {
      for (let x = 0; x < canvasW; x += tileW) {
        composites.push({ input: watermarkTile, top: y, left: x });
      }
    }

    // 타일 배수 캔버스에 배치 → 이미지 크기로 crop
    const watermarkOverlay = await sharp({
      create: {
        width: canvasW,
        height: canvasH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composites)
      .extract({ left: 0, top: 0, width, height })
      .png()
      .toBuffer();

    // 4. 원본에 워터마크 합성
    const outputBuffer = await sharp(resizedBuffer)
      .composite([{ input: watermarkOverlay, top: 0, left: 0 }])
      .jpeg({ quality: 75 })
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
