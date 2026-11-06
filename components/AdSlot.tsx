'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({ adSlot, adFormat, className }: AdSlotProps) {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (adRef.current) return;
    adRef.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);

  // AdSense 미승인(ENABLED 미설정): 운영에서는 아무것도 표시하지 않음 — 빈 "광고 영역" 박스가
  // 사용자에게 미완성 화면처럼 보였음. 개발 환경에서만 위치 확인용 placeholder 표시.
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ADSENSE_ENABLED) {
    return null;
  }
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm py-8 ${className ?? ''}`}
      >
        광고 영역
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      data-ad-client="ca-pub-8188428194984994"
      data-ad-slot={adSlot}
      data-ad-format={adFormat || 'auto'}
      data-full-width-responsive="true"
      style={{ display: 'block' }}
    />
  );
}
