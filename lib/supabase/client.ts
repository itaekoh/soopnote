import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 타임아웃이 포함된 커스텀 fetch 함수
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  // 환경에 따른 타임아웃 설정
  // 개발: 10초, 프로덕션: 30초 (Vercel cold start 및 네트워크 지연 고려)
  const timeout = process.env.NODE_ENV === 'production' ? 30000 : 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`⏱️ Supabase 요청 시간 초과: ${url} (${timeout}ms)`);
      throw new Error(`Supabase 요청 시간 초과 (${timeout}ms)`);
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
});
