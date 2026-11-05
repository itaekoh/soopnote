'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * 홈은 서버에서 그린다. 그래서 '다시 시도' 는 더 이상 브라우저에서 데이터를
 * 다시 부르는 게 아니라, 서버에 이 화면을 다시 그려 달라고 요청하는 것이다.
 */
export function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
    >
      {pending ? '불러오는 중...' : '다시 시도'}
    </button>
  );
}
