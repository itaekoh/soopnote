import { getInitialListData } from '@/lib/api/server-posts';
import { TreeDiagnoseListClient } from './TreeDiagnoseListClient';

/**
 * 목록을 서버에서 먼저 그린다.
 *
 * 예전에는 브라우저가 열린 뒤에 카테고리를 찾고, 그 결과로 다시 게시글을
 * 불러왔다. 왕복 두 번이 순서대로 이어져서 둘 중 하나만 흔들려도 화면은
 * "게시글을 불러오는 중..." 에 머물렀다. 이제 HTML 에 목록이 실려 나가므로
 * 첫 화면에는 네트워크가 끼지 않는다.
 *
 * 서버 조회가 실패하면 빈 값이 넘어가고, 그때는 클라이언트가 평소대로
 * 직접 불러온다 — 실패하면 오류 UI 와 '다시 시도' 가 뜬다.
 */
export const revalidate = 60;

const POSTS_PER_PAGE = 12;

export default async function TreeDiagnosePage() {
  const initial = await getInitialListData('tree-diagnose', POSTS_PER_PAGE);
  return <TreeDiagnoseListClient initial={initial} />;
}
