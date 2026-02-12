import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 타임아웃이 포함된 커스텀 fetch 함수
// Supabase 요청이 걸리면 무한 대기하는 문제 방지
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = process.env.NODE_ENV === 'production' ? 15000 : 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
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
