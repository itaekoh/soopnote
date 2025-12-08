'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // ChunkLoadError 감지 및 자동 리로드
    if (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch')
    ) {
      console.log('🔄 ChunkLoadError 감지 - 3초 후 자동으로 페이지를 새로고침합니다...');

      // 3초 후 자동 리로드 (사용자에게 메시지를 보여줄 시간)
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        this.state.error?.message.includes('Loading chunk') ||
        this.state.error?.message.includes('Failed to fetch');

      if (isChunkError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">페이지를 불러오는 중입니다</h2>
              <p className="text-gray-600 mb-4">
                개발 서버가 준비되는 동안 잠시만 기다려주세요.
              </p>
              <p className="text-sm text-gray-500">3초 후 자동으로 새로고침됩니다...</p>
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

      // 일반 에러
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
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <div className="mt-6 space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                새로고침
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
