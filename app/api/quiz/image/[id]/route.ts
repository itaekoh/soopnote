export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function createWatermarkSvg(width: number, height: number): string {
  const texts: string[] = [];
  const fontSize = Math.max(16, Math.floor(width / 20));
  const step = fontSize * 5;

  for (let y = -height; y < height * 2; y += step) {
    for (let x = -width; x < width * 2; x += step) {
      texts.push(
        `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})" ` +
          `font-size="${fontSize}" font-family="Arial, sans-serif" ` +
          `fill="rgba(255,255,255,0.25)">soopnote.com</text>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${texts.join('')}</svg>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Look up the quiz_items record to get image_path
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

    // Download the original image from Supabase Storage
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

    // 1. 먼저 리사이즈한 buffer를 생성
    const resizedBuffer = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .toBuffer();

    // 2. 리사이즈된 이미지의 실제 크기 확인
    const metadata = await sharp(resizedBuffer).metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    // 3. 실제 크기에 맞는 워터마크 SVG 생성
    const watermarkSvg = createWatermarkSvg(width, height);
    const watermarkBuffer = Buffer.from(watermarkSvg);

    // 4. 리사이즈된 이미지에 워터마크 합성 → JPEG 출력
    const outputBuffer = await sharp(resizedBuffer)
      .composite([{ input: watermarkBuffer, top: 0, left: 0 }])
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
    console.error('Watermark image processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
