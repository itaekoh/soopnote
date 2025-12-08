'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);

    // ChunkLoadError 감지 및 자동 리로드
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch')
    ) {
      console.log('🔄 ChunkLoadError 감지 - 3초 후 자동으로 페이지를 새로고침합니다...');

      // 3초 후 자동 리로드
      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const isChunkError =
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch');

  if (isChunkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">페이지를 불러오는 중입니다</h2>
          <p className="text-gray-600 mb-4">
            개발 서버가 준비되는 동안 잠시만 기다려주세요.
          </p>
          <p className="text-sm text-gray-500 mb-4">3초 후 자동으로 새로고침됩니다...</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              지금 새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <div className="mt-6 space-x-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
