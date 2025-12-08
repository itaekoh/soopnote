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
};

export default nextConfig;
