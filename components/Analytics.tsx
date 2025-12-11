'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer } from '@/lib/types/gtm';

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL이 변경될 때마다 페이지뷰 이벤트 전송
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    console.log('🔄 [Analytics] 페이지 변경 감지:', url);

    pushToDataLayer({
      event: 'page_view',
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  );
}
