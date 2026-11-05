import { getInitialListData } from '@/lib/api/server-posts';
import { WildflowerListClient } from './WildflowerListClient';

/**
 * 목록을 서버에서 먼저 그린다. 배경은 app/tree-diagnose/page.tsx 주석 참고.
 * 서버 조회가 실패하면 빈 값이 넘어가고, 그때만 클라이언트가 직접 불러온다.
 */
export const revalidate = 60;

const POSTS_PER_PAGE = 12;

export default async function WildflowerPage() {
  const initial = await getInitialListData('wildflower', POSTS_PER_PAGE);
  return <WildflowerListClient initial={initial} />;
}
