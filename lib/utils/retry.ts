/**
 * 재시도 로직이 포함된 비동기 함수 래퍼
 * @param fn 실행할 비동기 함수
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @param delay 재시도 간 지연 시간(ms) (기본값: 1000)
 * @param retryOn 재시도 조건 함수 (에러를 받아서 재시도 여부 반환)
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
    maxRetries = 3,
    delay = 1000,
    retryOn = () => true, // 기본적으로 모든 에러에 대해 재시도
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 마지막 시도였거나 재시도 조건을 만족하지 않으면 에러 throw
      if (attempt === maxRetries || !retryOn(error)) {
        throw error;
      }

      // 재시도 전 대기
      const waitTime = delay * Math.pow(2, attempt); // 지수 백오프
      console.warn(
        `⚠️ API 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}) - ${waitTime}ms 후 재시도...`,
        error
      );
      await sleep(waitTime);
    }
  }

  throw lastError;
}

/**
 * 타임아웃이 포함된 Promise 래퍼
 * @param promise 실행할 Promise
 * @param timeoutMs 타임아웃 시간(ms)
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`요청 시간 초과 (${timeoutMs}ms)`)), timeoutMs)
    ),
  ]);
}

/**
 * 지연 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도와 타임아웃을 모두 적용한 래퍼
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    timeoutMs?: number;
    retryOn?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const { timeoutMs = 10000, ...retryOptions } = options;

  return withRetry(
    () => withTimeout(fn(), timeoutMs),
    retryOptions
  );
}
