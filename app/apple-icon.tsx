import { ImageResponse } from 'next/og';

// 이미지 메타데이터
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Apple 아이콘 생성
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: 'linear-gradient(135deg, #26422E 0%, #3A5F42 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7DD3AE',
        }}
      >
        🌿
      </div>
    ),
    {
      ...size,
    }
  );
}
