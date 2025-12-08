import { ImageResponse } from 'next/og';

// 이미지 메타데이터
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// 아이콘 생성
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#26422E',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7DD3AE',
          borderRadius: '8px',
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
