import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 타임아웃이 포함된 커스텀 fetch 함수
// Supabase 요청이 걸리면 무한 대기하는 문제 방지
//
// 여기는 마지막 안전망이다. lib/api/* 는 withRetryAndTimeout(기본 8초)으로
// 더 짧게 끊으므로 이 타이머까지 오는 경우는 그 밖의 호출(인증·스토리지 등)뿐이다.
const fetchWithTimeout = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = process.env.NODE_ENV === 'production' ? 15000 : 10000;
  const controller = new AbortController();
  // 이 타이머가 끊은 것인지, 호출자가 먼저 취소한 것인지 구분한다.
  // 구분하지 않으면 8초에 취소된 요청도 "시간 초과 (10000ms)" 로 찍혀
  // 나중에 로그를 볼 때 엉뚱한 타이머를 의심하게 된다.
  let timedOut = false;
  const id = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

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
    if (error.name === 'AbortError' && timedOut) {
      throw new Error(`Supabase 요청 시간 초과 (${timeout}ms)`);
    }
    // 호출자가 취소한 경우는 원래 오류를 그대로 올려보낸다.
    // 바깥의 타임아웃·오류 메시지가 가려지지 않도록.
    throw error;
  }
};

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
});
