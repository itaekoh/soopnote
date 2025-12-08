-- ============================================
-- 프로덕션용 RLS 정책 설정
-- ============================================
-- 이 파일은 프로덕션 배포 전에 실행하세요.
-- 개발 중에는 실행하지 마세요!

-- ============================================
-- 1. sn_users 테이블 RLS
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can view user profiles" ON sn_users;
DROP POLICY IF EXISTS "authenticated_users_can_read_all_profiles" ON sn_users;
DROP POLICY IF EXISTS "delete_own_profile" ON sn_users;
DROP POLICY IF EXISTS "select_own_profile" ON sn_users;
DROP POLICY IF EXISTS "update_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON sn_users;

-- RLS 활성화
ALTER TABLE sn_users ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사람이 모든 사용자의 기본 정보를 볼 수 있음
-- (게시글 작성자 이름, 아바타 표시용)
CREATE POLICY "anyone_can_read_users"
    ON sn_users FOR SELECT
    TO public
    USING (true);

-- 정책 2: 로그인한 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "users_can_update_own_profile"
    ON sn_users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 정책 3: 회원가입 시 프로필 생성 허용
CREATE POLICY "users_can_insert_own_profile"
    ON sn_users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 정책 4: 자신의 계정 삭제 가능
CREATE POLICY "users_can_delete_own_profile"
    ON sn_users FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- ============================================
-- 2. sn_categories 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE sn_categories ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사람이 카테고리를 볼 수 있음
CREATE POLICY "anyone_can_read_categories"
    ON sn_categories FOR SELECT
    TO public
    USING (true);

-- 정책 2: super_admin만 카테고리 생성/수정/삭제 가능
-- (클라이언트에서는 불가능, 서버 사이드 또는 Supabase Dashboard에서만)

-- ============================================
-- 3. sn_posts 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE sn_posts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사람이 발행된 게시글을 볼 수 있음
CREATE POLICY "anyone_can_read_published_posts"
    ON sn_posts FOR SELECT
    TO public
    USING (status = 'published');

-- 정책 2: 작성자는 자신의 모든 게시글(임시저장 포함)을 볼 수 있음
CREATE POLICY "authors_can_read_own_posts"
    ON sn_posts FOR SELECT
    TO authenticated
    USING (auth.uid() = author_id);

-- 정책 2-1: super_admin은 모든 게시글을 볼 수 있음
CREATE POLICY "super_admins_can_read_all_posts"
    ON sn_posts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE sn_users.id = auth.uid()
            AND sn_users.role = 'super_admin'
        )
    );

-- 정책 2-2: super_admin은 모든 게시글을 수정할 수 있음
CREATE POLICY "super_admins_can_update_all_posts"
    ON sn_posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE sn_users.id = auth.uid()
            AND sn_users.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE sn_users.id = auth.uid()
            AND sn_users.role = 'super_admin'
        )
    );

-- 정책 2-3: super_admin은 모든 게시글을 삭제할 수 있음
CREATE POLICY "super_admins_can_delete_all_posts"
    ON sn_posts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM sn_users
            WHERE sn_users.id = auth.uid()
            AND sn_users.role = 'super_admin'
        )
    );

-- 정책 3: writer/super_admin은 게시글을 작성할 수 있음
CREATE POLICY "writers_can_insert_posts"
    ON sn_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM sn_users
            WHERE id = auth.uid()
            AND role IN ('writer', 'super_admin')
        )
    );

-- 정책 4: 작성자는 자신의 게시글을 수정할 수 있음
CREATE POLICY "authors_can_update_own_posts"
    ON sn_posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- 정책 5: 작성자는 자신의 게시글을 삭제할 수 있음
CREATE POLICY "authors_can_delete_own_posts"
    ON sn_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- ============================================
-- 4. sn_comments 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE sn_comments ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사람이 댓글을 볼 수 있음
CREATE POLICY "anyone_can_read_comments"
    ON sn_comments FOR SELECT
    TO public
    USING (true);

-- 정책 2: 로그인한 사용자는 댓글을 작성할 수 있음
CREATE POLICY "authenticated_users_can_insert_comments"
    ON sn_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 정책 3: 작성자는 자신의 댓글을 수정할 수 있음
CREATE POLICY "users_can_update_own_comments"
    ON sn_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 정책 4: 작성자는 자신의 댓글을 삭제할 수 있음
CREATE POLICY "users_can_delete_own_comments"
    ON sn_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- 5. sn_likes 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE sn_likes ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사람이 좋아요 수를 볼 수 있음
CREATE POLICY "anyone_can_read_likes"
    ON sn_likes FOR SELECT
    TO public
    USING (true);

-- 정책 2: 로그인한 사용자는 좋아요를 추가할 수 있음
CREATE POLICY "authenticated_users_can_insert_likes"
    ON sn_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 정책 3: 로그인한 사용자는 자신의 좋아요를 삭제할 수 있음
CREATE POLICY "users_can_delete_own_likes"
    ON sn_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- 확인
-- ============================================

-- 모든 테이블의 RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'sn_%'
ORDER BY tablename;

-- 설정된 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'sn_%'
ORDER BY tablename, policyname;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ 프로덕션용 RLS 정책이 설정되었습니다!';
    RAISE NOTICE '';
    RAISE NOTICE '설정된 정책 요약:';
    RAISE NOTICE '- 누구나: 발행된 게시글, 댓글, 좋아요 읽기';
    RAISE NOTICE '- 로그인 사용자: 댓글, 좋아요 작성';
    RAISE NOTICE '- Writer: 게시글 작성, 자신의 글 수정/삭제';
    RAISE NOTICE '- 모든 사용자: 자신의 프로필 수정';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ super_admin 권한 관리는 Supabase Dashboard에서 수동으로 하세요.';
    RAISE NOTICE '===========================================';
END $$;
