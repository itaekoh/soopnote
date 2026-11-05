import sharp from 'sharp';

/**
 * 업로드 이미지 최적화 (서버 전용)
 *
 * 왜 서버에서 하는가
 * ────────────────────────────────────────────────────────────────
 * 예전에는 브라우저(browser-image-compression)에만 맡겼다. 그런데
 *
 *  - 관리자 AI 글쓰기 화면은 대표 이미지에 압축이 아예 없었다.
 *  - 글쓰기 화면은 maxSizeMB 4 / maxWidthOrHeight 2048 로 느슨했고,
 *    PNG 는 브라우저 압축이 목표치를 못 맞추면 그냥 원본을 돌려준다.
 *
 * 그 결과 2816x1536 / 5.33MB PNG 가 그대로 올라가 있었다(2026-11-05 확인).
 * 사진을 PNG 로 저장한 것이라 용량의 대부분이 포맷 선택 탓이었다.
 *
 * 브라우저 압축은 업로드 시간을 줄여 주니 그대로 두되, 최종 보장은
 * 여기서 한다. 어떤 경로로 들어와도 이 함수를 지나간다.
 */

/** 최장변 상한. 썸네일도 본문도 이보다 크게 쓰이는 자리가 없다. */
const MAX_EDGE = 1600;
const WEBP_QUALITY = 82;

export type OptimizeResult = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  width?: number;
  height?: number;
  originalBytes: number;
  bytes: number;
};

/**
 * GIF 는 건드리지 않는다. 움직이는 이미지를 정지 WebP 로 바꾸면
 * 사용자가 올린 것과 다른 물건이 된다.
 */
function isPassthrough(mime: string): boolean {
  return mime === 'image/gif';
}

export async function optimizeUpload(
  input: ArrayBuffer | Buffer,
  mimeType: string
): Promise<OptimizeResult> {
  const original = Buffer.isBuffer(input) ? input : Buffer.from(input);

  if (isPassthrough(mimeType)) {
    return {
      buffer: original,
      contentType: mimeType,
      extension: 'gif',
      originalBytes: original.length,
      bytes: original.length,
    };
  }

  const image = sharp(original, { failOn: 'none' });
  const meta = await image.metadata();

  // 애니메이션이 들어 있는 WebP 도 그대로 둔다.
  if (meta.pages && meta.pages > 1) {
    return {
      buffer: original,
      contentType: mimeType,
      extension: mimeType === 'image/webp' ? 'webp' : 'gif',
      width: meta.width,
      height: meta.height,
      originalBytes: original.length,
      bytes: original.length,
    };
  }

  const optimized = await image
    // rotate() 가 resize 보다 먼저여야 한다. 뒤에 두면 EXIF 방향이
    // 반영되기 전 크기로 줄어서, 휴대폰 사진의 가로·세로가 뒤바뀐다.
    .rotate()
    // withoutEnlargement: 작은 그림을 억지로 키우지 않는다.
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: optimized.data,
    contentType: 'image/webp',
    extension: 'webp',
    width: optimized.info.width,
    height: optimized.info.height,
    originalBytes: original.length,
    bytes: optimized.data.length,
  };
}
