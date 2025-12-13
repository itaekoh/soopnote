/**
 * API 성능 측정 유틸리티
 */

export async function measureApiPerformance<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`⏱️ [${name}] 완료: ${duration}ms`);

    // 5초 이상 걸리면 경고
    if (duration > 5000) {
      console.warn(`⚠️ [${name}] 느린 응답: ${duration}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.error(`❌ [${name}] 실패: ${duration}ms`, error);
    throw error;
  }
}
