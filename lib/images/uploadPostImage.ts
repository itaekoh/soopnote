import { supabase } from '@/lib/supabase/client';

/**
 * 대표 이미지(썸네일) 업로드
 *
 * 예전에는 글쓰기 화면마다 supabase.storage.upload() 를 직접 불렀다.
 * 그래서 화면에 따라 압축 설정이 달랐고, 관리자 AI 글쓰기 화면은 아예
 * 압축이 없었다. 2816x1536 / 5.33MB PNG 가 그대로 올라간 경로다.
 *
 * 이제 /api/upload 한곳을 지나가고, 거기서 서버가 줄인다(lib/images/optimize).
 */
export async function uploadPostImage(file: File): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('로그인이 필요합니다. 다시 로그인한 뒤 시도해주세요.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'posts');

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `이미지 업로드 실패 (HTTP ${res.status})`);
  }

  if (typeof data.originalBytes === 'number' && typeof data.bytes === 'number') {
    const mb = (n: number) => (n / 1024 / 1024).toFixed(2);
    console.log(`✓ 대표 이미지: ${mb(data.originalBytes)}MB → ${mb(data.bytes)}MB`);
  }

  return data.location as string;
}
