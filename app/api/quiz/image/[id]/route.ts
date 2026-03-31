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

// 워터마크 타일 PNG (빌드 시 1회 로드)
const watermarkTile = readFileSync(
  join(process.cwd(), 'assets', 'watermark-tile.png')
);

/**
 * 워터마크 타일을 이미지 크기에 맞게 반복 합성
 */
async function applyWatermark(
  imageBuffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  // 타일을 이미지 크기만큼 반복해서 채운 오버레이 생성
  const tileMetadata = await sharp(watermarkTile).metadata();
  const tileW = tileMetadata.width!;
  const tileH = tileMetadata.height!;

  const cols = Math.ceil(width / tileW);
  const rows = Math.ceil(height / tileH);

  // 타일을 가로로 반복
  const rowImages: Buffer[] = [];
  for (let r = 0; r < rows; r++) {
    const tiles: sharp.OverlayOptions[] = [];
    for (let c = 0; c < cols; c++) {
      tiles.push({ input: watermarkTile, top: 0, left: c * tileW });
    }
    const rowBuffer = await sharp({
      create: {
        width: cols * tileW,
        height: tileH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(tiles)
      .png()
      .toBuffer();
    rowImages.push(rowBuffer);
  }

  // 세로로 합치기
  const overlayComposites: sharp.OverlayOptions[] = rowImages.map(
    (buf, i) => ({
      input: buf,
      top: i * tileH,
      left: 0,
    })
  );

  const fullOverlay = await sharp({
    create: {
      width: cols * tileW,
      height: rows * tileH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(overlayComposites)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  // 원본 이미지에 워터마크 합성
  return sharp(imageBuffer)
    .composite([{ input: fullOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 75 })
    .toBuffer();
}

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
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    // 3. 워터마크 합성
    const outputBuffer = await applyWatermark(resizedBuffer, width, height);

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
