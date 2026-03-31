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
  const fontSize = Math.max(14, Math.floor(width / 22));
  const step = fontSize * 4;

  for (let y = -height; y < height * 2; y += step) {
    for (let x = -width; x < width * 2; x += step) {
      // 흰색 외곽선 + 반투명 텍스트로 어떤 배경에서도 보이도록
      texts.push(
        `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})" ` +
          `font-size="${fontSize}" ` +
          `stroke="rgba(0,0,0,0.15)" stroke-width="1" ` +
          `fill="rgba(255,255,255,0.35)">soopnote.com</text>`
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
      .toBuffer();

    // 2. 메타데이터
    const metadata = await sharp(resizedBuffer).metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    // 3. 워터마크 생성 (PNG로 변환하여 폰트 의존성 해결)
    const watermarkSvg = createWatermarkSvg(width, height);
    const watermarkBuffer = await sharp(Buffer.from(watermarkSvg))
      .resize(width, height)
      .png()
      .toBuffer();

    // 4. 합성 → JPEG
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
