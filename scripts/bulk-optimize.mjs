/**
 * 기존 quiz_public 이미지를 일괄 최적화하는 일회성 스크립트
 *
 * 실행: soopnote/ 디렉토리에서
 *   node scripts/bulk-optimize.mjs
 *
 * 동작:
 *   1. DB에서 모든 quiz_items 조회
 *   2. 각 이미지를 Storage에서 다운로드
 *   3. sharp로 최적화 (최장변 1200px, WebP q82)
 *   4. quiz/{item_id}/ 경로로 재업로드
 *   5. 기존 파일 삭제 + DB 경로 갱신
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local 로드
const envPath = resolve(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const clean = line.replace(/\r/g, '');
  const match = clean.match(/^([^#][^=]*)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('.env.local에서 Supabase 키를 찾을 수 없습니다.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // 1. 전체 quiz_items 조회
  const { data: items, error } = await admin
    .from('quiz_items')
    .select('id, image_path')
    .not('image_path', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('DB 조회 실패:', error.message);
    process.exit(1);
  }

  console.log(`\n총 ${items.length}개 문항 처리 시작\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;
  let totalSaved = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const idx = `[${i + 1}/${items.length}]`;

    try {
      // 2. 다운로드
      const { data: fileData, error: dlError } = await admin.storage
        .from('quiz_public')
        .download(item.image_path);

      if (dlError) throw new Error(`다운로드 실패: ${dlError.message}`);

      const originalBuffer = Buffer.from(await fileData.arrayBuffer());
      const originalKB = originalBuffer.length / 1024;

      // 3. sharp 최적화
      const optimized = await sharp(originalBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const optimizedKB = optimized.length / 1024;
      const savedKB = originalKB - optimizedKB;

      // 이미 충분히 작으면 경로만 정리
      const newFileName = `${nanoid()}.webp`;
      const newPath = `quiz/${item.id}/${newFileName}`;

      // 4. 업로드
      const { error: uploadError } = await admin.storage
        .from('quiz_public')
        .upload(newPath, optimized, { contentType: 'image/webp' });

      if (uploadError) throw new Error(`업로드 실패: ${uploadError.message}`);

      // 5. DB 경로 갱신
      const { error: updateError } = await admin
        .from('quiz_items')
        .update({ image_path: newPath })
        .eq('id', item.id);

      if (updateError) throw new Error(`DB 갱신 실패: ${updateError.message}`);

      // 6. 기존 파일 삭제
      if (item.image_path !== newPath) {
        await admin.storage.from('quiz_public').remove([item.image_path]);
      }

      success++;
      totalSaved += savedKB;
      console.log(
        `${idx} OK  ${originalKB.toFixed(0)}KB -> ${optimizedKB.toFixed(0)}KB` +
        `  (${savedKB > 0 ? '-' : '+'}${Math.abs(savedKB).toFixed(0)}KB)` +
        `  ${item.image_path}`
      );
    } catch (err) {
      failed++;
      console.error(`${idx} FAIL  ${item.image_path}: ${err.message}`);
    }
  }

  console.log(`\n========== 완료 ==========`);
  console.log(`성공: ${success}`);
  console.log(`실패: ${failed}`);
  console.log(`총 절감: ${(totalSaved / 1024).toFixed(1)}MB`);
}

main().catch(console.error);
