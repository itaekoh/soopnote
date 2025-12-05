-- ============================================
-- 모든 public 조회 RLS 정책 수정
-- ============================================

-- ============================================
-- 1. sn_categories - 모든 사용자가 active 카테고리 조회 가능
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view active categories" ON sn_categories;

-- 새 정책: 모든 사용자가 활성 카테고리 조회 가능
CREATE POLICY "Anyone can view active categories"
ON sn_categories FOR SELECT
USING (is_active = true);


-- ============================================
-- 2. sn_posts - published 게시글 조회 가능
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view published posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON sn_posts;

-- 새 정책: 모든 사용자가 published 게시글 조회 가능
CREATE POLICY "Anyone can view published posts"
ON sn_posts FOR SELECT
USING (status = 'published');

-- 작성자는 자신의 모든 게시글 조회 가능
CREATE POLICY "Authors can view own posts"
ON sn_posts FOR SELECT
USING (author_id = auth.uid());


-- ============================================
-- 3. sn_posts_full 뷰 - 권한 부여
-- ============================================

-- public에게 뷰 조회 권한 부여
GRANT SELECT ON sn_posts_full TO anon, authenticated;


-- ============================================
-- 4. sn_categories_hierarchy 뷰 - 권한 부여
-- ============================================

-- public에게 뷰 조회 권한 부여
GRANT SELECT ON sn_categories_hierarchy TO anon, authenticated;


-- ============================================
-- 5. sn_users - 프로필 조회 (display_name, avatar 등)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view user profiles" ON sn_users;

-- 새 정책: 모든 사용자가 다른 사용자의 공개 프로필 조회 가능
CREATE POLICY "Anyone can view user profiles"
ON sn_users FOR SELECT
USING (true);


-- ============================================
-- 결과 확인
-- ============================================

-- 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('sn_posts', 'sn_categories', 'sn_users')
ORDER BY tablename, cmd;

-- 뷰 권한 확인
SELECT
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_name IN ('sn_posts_full', 'sn_categories_hierarchy')
ORDER BY table_name, grantee;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 모든 public 조회 RLS 정책 수정 완료';
    RAISE NOTICE '이제 로그인 없이도 다음 항목을 조회할 수 있습니다:';
    RAISE NOTICE '  - published 게시글 (sn_posts, sn_posts_full)';
    RAISE NOTICE '  - 활성 카테고리 (sn_categories)';
    RAISE NOTICE '  - 사용자 공개 프로필 (sn_users)';
    RAISE NOTICE '=============================================';
END $$;
