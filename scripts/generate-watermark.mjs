/**
 * 워터마크 타일 PNG 생성 스크립트
 * 로컬에서 1회 실행 → assets/watermark-tile.png 생성
 * Vercel에서는 이 PNG를 sharp로 합성만 하면 됨 (폰트 불필요)
 *
 * 실행: node scripts/generate-watermark.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const OUTPUT_PATH = 'assets/watermark-tile.png';

// 타일 크기 (이 패턴이 반복됨)
const TILE_WIDTH = 300;
const TILE_HEIGHT = 200;
const FONT_SIZE = 16;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${TILE_HEIGHT}">
  <defs>
    <style>
      text {
        font-family: Arial, Helvetica, sans-serif;
        font-size: ${FONT_SIZE}px;
        font-weight: bold;
        fill: rgba(255, 255, 255, 0.30);
      }
    </style>
  </defs>
  <!-- 대각선 배치 -->
  <text x="20" y="40" transform="rotate(-30, 20, 40)">soopnote.com</text>
  <text x="170" y="40" transform="rotate(-30, 170, 40)">soopnote.com</text>
  <text x="90" y="120" transform="rotate(-30, 90, 120)">soopnote.com</text>
  <text x="240" y="120" transform="rotate(-30, 240, 120)">soopnote.com</text>
  <text x="20" y="190" transform="rotate(-30, 20, 190)">soopnote.com</text>
  <text x="170" y="190" transform="rotate(-30, 170, 190)">soopnote.com</text>
</svg>`;

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

await sharp(Buffer.from(svg))
  .png()
  .toFile(OUTPUT_PATH);

console.log(`✅ Watermark tile generated: ${OUTPUT_PATH} (${TILE_WIDTH}x${TILE_HEIGHT})`);
