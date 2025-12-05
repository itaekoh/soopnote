-- ============================================
-- 게시글 조회 RLS 정책 수정
-- ============================================

-- 현재 SELECT 정책 확인
SELECT policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'sn_posts' AND cmd = 'SELECT';

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view published posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON sn_posts;

-- 새로운 정책: 모든 사용자(로그인 안 해도)가 published 게시글을 볼 수 있음
CREATE POLICY "Anyone can view published posts"
ON sn_posts FOR SELECT
USING (status = 'published');

-- 작성자는 자신의 모든 게시글(draft 포함)을 볼 수 있음
CREATE POLICY "Authors can view own posts"
ON sn_posts FOR SELECT
USING (author_id = auth.uid());

-- 결과 확인
SELECT policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'sn_posts' AND cmd = 'SELECT';

-- 테스트: published 게시글 조회
SELECT id, title, status, published_date
FROM sn_posts
WHERE status = 'published'
ORDER BY published_date DESC
LIMIT 5;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 게시글 조회 RLS 정책 수정 완료';
    RAISE NOTICE '이제 로그인 없이도 published 게시글을 볼 수 있습니다.';
    RAISE NOTICE '=============================================';
END $$;
