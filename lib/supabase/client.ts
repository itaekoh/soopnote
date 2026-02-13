import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 타임아웃이 포함된 커스텀 fetch 함수
// Supabase 요청이 걸리면 무한 대기하는 문제 방지
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = process.env.NODE_ENV === 'production' ? 15000 : 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // 기존 signal과 타임아웃 signal 모두 존중
  // AbortSignal.any()가 없는 환경을 위한 폴백
  let signal: AbortSignal = controller.signal;
  if (options.signal) {
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal) {
      signal = (AbortSignal as any).any([options.signal, controller.signal]);
    } else {
      // AbortSignal.any 미지원 시: 기존 signal이 abort되면 우리 controller도 abort
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      signal = controller.signal;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Supabase 요청 시간 초과 (${timeout}ms)`);
    }
    throw error;
  }
};

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
});
