import { getInitialListData } from '@/lib/api/server-posts';
import { LogsListClient } from './LogsListClient';

/**
 * 목록을 서버에서 먼저 그린다. 배경은 app/tree-diagnose/page.tsx 주석 참고.
 *
 * 서브카테고리(필터 칩)도 함께 받아 넘긴다. 예전에는 브라우저가 카테고리를
 * 찾고 그 id 로 하위 속성을 받는 순차 왕복을 또 한 번 했다.
 */
export const revalidate = 60;

const POSTS_PER_PAGE = 12;

export default async function LogsPage() {
  const initial = await getInitialListData('logs', POSTS_PER_PAGE, { withSubcategories: true });
  return <LogsListClient initial={initial} />;
}
