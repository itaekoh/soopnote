-- ============================================
-- 기존 RLS 정책 확인 및 수정
-- ============================================

-- 1. 먼저 기존 정책들을 모두 삭제
DROP POLICY IF EXISTS "Anyone can view published posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON sn_posts;
DROP POLICY IF EXISTS "Writers can create posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON sn_posts;

-- 2. RLS가 활성화되어 있는지 확인하고 활성화
ALTER TABLE sn_posts ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 정책 생성
-- 모든 사용자가 published 게시글을 볼 수 있음
CREATE POLICY "Anyone can view published posts"
ON sn_posts FOR SELECT
USING (status = 'published');

-- writer와 super_admin이 자신의 모든 게시글을 볼 수 있음
CREATE POLICY "Authors can view own posts"
ON sn_posts FOR SELECT
USING (
    auth.uid() = author_id
    OR EXISTS (
        SELECT 1 FROM sn_users
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- writer와 super_admin이 게시글을 생성할 수 있음
CREATE POLICY "Writers can create posts"
ON sn_posts FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM sn_users
        WHERE id = auth.uid() AND role IN ('writer', 'super_admin')
    )
);

-- 작성자가 자신의 게시글을 수정할 수 있음
CREATE POLICY "Authors can update own posts"
ON sn_posts FOR UPDATE
USING (
    auth.uid() = author_id
    OR EXISTS (
        SELECT 1 FROM sn_users
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 작성자가 자신의 게시글을 삭제할 수 있음
CREATE POLICY "Authors can delete own posts"
ON sn_posts FOR DELETE
USING (
    auth.uid() = author_id
    OR EXISTS (
        SELECT 1 FROM sn_users
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'sn_posts 테이블 RLS 정책이 재설정되었습니다!';
    RAISE NOTICE '- published 게시글: 모든 사용자가 조회 가능';
    RAISE NOTICE '- draft/archived: 작성자와 관리자만 조회 가능';
    RAISE NOTICE '=============================================';
END $$;
