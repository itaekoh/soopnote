import { getInitialListData } from '@/lib/api/server-posts';
import { LogsListClient } from './LogsListClient';

/**
 * 목록을 서버에서 먼저 그린다. 배경은 app/tree-diagnose/page.tsx 주석 참고.
 *
 * 서브카테고리 목록은 아직 브라우저에서 불러온다. 첫 화면의 글 목록을
 * 막지 않는 부가 정보라 이번 범위에 넣지 않았다.
 */
export const revalidate = 60;

const POSTS_PER_PAGE = 12;

export default async function LogsPage() {
  const initial = await getInitialListData('logs', POSTS_PER_PAGE);
  return <LogsListClient initial={initial} />;
}
