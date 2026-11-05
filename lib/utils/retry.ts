/**
 * 타임아웃 · 재시도 유틸
 *
 * 2026-11-05 수정 배경
 * ────────────────────────────────────────────────────────────────────
 * 예전 구현은 `Promise.race([fn(), 타이머])` 였다. 타이머가 먼저 터져도
 * 진행 중이던 요청은 끊기지 않고 그대로 살아 있었다. 그래서:
 *
 *  1. 타임아웃마다 버려진 요청이 하나씩 남고, 재시도가 같은 질의를 또
 *     날린다 → 한 번의 호출에 동시 요청이 최대 4개까지 쌓인다.
 *  2. 브라우저는 호스트당 동시 연결을 ~6개로 제한한다. 버려진 요청이
 *     그 자리를 차지하면 정작 필요한 요청이 출발조차 못 한다.
 *  3. maxRetries 3 + timeoutMs 15000 + delay 1000 이면 한 호출에 최악
 *     15+1+15+2+15+4+15 = 67초. 카테고리 조회 → 게시글 조회로 이어지는
 *     화면은 134초. 사용자 입장에서는 그냥 무한 로딩이었다.
 *
 * 지금은 AbortController 로 요청을 실제로 끊는다. fn 은 signal 을 받아
 * Supabase 쿼리의 `.abortSignal(signal)` 에 반드시 넘겨야 한다. 넘기지
 * 않으면 요청은 계속 살아 있고(= 예전 동작), 다만 Promise 는 제때 끝난다.
 */

/** 재시도 사이 대기 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** signal 을 받아 실제 요청에 연결해야 하는 함수 */
export type AbortableFn<T> = (signal: AbortSignal) => Promise<T>;

/**
 * 기본값. 최악의 경우를 계산할 수 있게 한곳에 모아둔다.
 *   한 호출 = TIMEOUT_MS + RETRY_DELAY_MS + TIMEOUT_MS = 17초
 */
export const DEFAULT_TIMEOUT_MS = 8_000;
export const DEFAULT_MAX_RETRIES = 1;
export const DEFAULT_RETRY_DELAY_MS = 1_000;

/** 타임아웃으로 중단된 요청. 호출 측에서 구분할 수 있게 따로 둔다. */
export class TimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`요청 시간이 초과되었습니다 (${Math.round(timeoutMs / 1000)}초). 네트워크 상태를 확인해주세요.`);
    this.name = 'TimeoutError';
  }
}

/**
 * 재시도할 가치가 있는 오류인가.
 *
 * 400번대는 요청 자체가 잘못된 것이라 몇 번을 보내도 같은 답이 온다.
 * 408(시간 초과)·429(요청 과다)만 예외로 둔다. PostgREST/Postgres 오류
 * 코드도 질의가 틀린 경우(문법·제약 위반·조회 결과 없음)는 재시도하지 않는다.
 */
export function isTransientError(error: any): boolean {
  const status = Number(error?.status ?? error?.statusCode);
  if (Number.isFinite(status) && status >= 400 && status < 500) {
    return status === 408 || status === 429;
  }

  const code = String(error?.code ?? '');
  // PGRST1xx: 요청 파싱 실패 / 결과 없음, 22·23·42: SQL 데이터·제약·문법 오류
  if (/^(PGRST1|22|23|42)/.test(code)) return false;

  return true;
}

/**
 * 타임아웃이 지나면 요청을 끊는다.
 *
 * abort 와 reject 를 함께 건다. abort 는 실제 연결을 닫아 커넥션을 돌려주고,
 * reject 는 fn 이 signal 을 무시하더라도 Promise 가 반드시 끝나게 만든다.
 */
export async function withTimeout<T>(
  fn: AbortableFn<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // 순서가 중요하다. abort() 를 먼저 부르면 fetch 가 그 자리에서
      // AbortError 로 거부되면서 race 가 그걸로 끝나버린다. 그러면 사용자는
      // "signal is aborted without reason" 같은 문구를 보게 된다.
      // 먼저 reject 로 결과를 확정한 뒤에 연결을 닫는다.
      reject(new TimeoutError(timeoutMs));
      controller.abort();
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(controller.signal), expiry]);
  } finally {
    clearTimeout(timer);
    // 정상 종료든 실패든, 남아 있는 요청이 없도록 확실히 닫는다.
    controller.abort();
  }
}

/**
 * 재시도 래퍼. 취소는 다루지 않는다 — 그건 withTimeout 의 몫이고,
 * 둘을 합친 것이 아래 withRetryAndTimeout 이다.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    retryOn?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    delay = DEFAULT_RETRY_DELAY_MS,
    retryOn = isTransientError,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !retryOn(error)) throw error;

      console.warn(
        `⚠️ API 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}) - ${delay}ms 후 재시도`,
        error
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 재시도 + 타임아웃.
 *
 * 시도마다 새 AbortController 를 만들어 fn 에 넘기고, 시간이 지나면 끊는다.
 * 지수 백오프는 쓰지 않는다. 대기가 길어질수록 사용자는 화면이 멈춘 것으로
 * 받아들이는데, 여기서 다루는 건 대부분 순간적인 네트워크 흔들림이라
 * 한 번 더 바로 시도해보고 안 되면 오류를 보여주는 편이 낫다.
 *
 * 최악의 경우: timeoutMs + delay + timeoutMs (기본값 기준 17초)
 */
export async function withRetryAndTimeout<T>(
  fn: AbortableFn<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    timeoutMs?: number;
    retryOn?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...retryOptions } = options;

  // 시도마다 withTimeout 이 새 AbortController 를 만든다. 이전 시도의
  // 요청은 그때 이미 끊겼으므로 중복 요청이 쌓이지 않는다.
  return withRetry(() => withTimeout(fn, timeoutMs), retryOptions);
}
