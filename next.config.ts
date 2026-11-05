import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // 게시글 썸네일이 올라가는 Supabase 스토리지.
      // 여기를 열어 둬야 next/image 가 원본 대신 줄인 WebP/AVIF 를 내줄 수 있다.
      // 예전에는 <img src> 로 원본을 그대로 받아서, 홈 한 번 여는 데
      // 이미지만 8.85MB(그중 한 장이 5.6MB PNG)가 나갔다.
      {
        protocol: 'https',
        hostname: 'otthqvsekttrljmonvdg.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 개발 모드 chunk 로딩 안정성 개선
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // chunk 로딩 타임아웃 증가 (기본값: 120000ms -> 300000ms)
      config.output = {
        ...config.output,
        chunkLoadTimeout: 300000,
      };
    }
    return config;
  },
  // 개발 서버 안정성 옵션
  devIndicators: {
    position: 'bottom-right',
  },
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
