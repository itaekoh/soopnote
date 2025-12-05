-- ============================================
-- sn_posts RLS 정책 수정 (403 Forbidden 해결)
-- ============================================

-- 1. 현재 사용자 role 확인
SELECT
    id,
    email,
    display_name,
    role,
    CASE
        WHEN role IN ('writer', 'super_admin') THEN '글쓰기 가능 ✓'
        ELSE '글쓰기 불가 ✗ (role을 writer로 변경 필요)'
    END as status
FROM sn_users
WHERE id = auth.uid();

-- 2. 현재 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'sn_posts';

-- ============================================
-- 3. 기존 INSERT 정책 삭제 및 재생성
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Writers and admins can create posts" ON sn_posts;

-- 새로운 INSERT 정책 (더 명확한 방식)
CREATE POLICY "Writers and admins can create posts"
ON sn_posts FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM sn_users
        WHERE role IN ('writer', 'super_admin')
    )
);

-- ============================================
-- 4. 작성자의 자신의 게시글도 볼 수 있도록 SELECT 정책 추가
-- ============================================

-- 기존 SELECT 정책 확인 (published만 보이는 정책)
-- 작성자가 자신의 draft도 볼 수 있도록 정책 추가

DROP POLICY IF EXISTS "Authors can view own posts" ON sn_posts;

CREATE POLICY "Authors can view own posts"
ON sn_posts FOR SELECT
USING (author_id = auth.uid());

-- ============================================
-- 5. 검증: 테스트 쿼리
-- ============================================

-- 현재 사용자가 글을 작성할 수 있는지 확인
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM sn_users
            WHERE id = auth.uid()
            AND role IN ('writer', 'super_admin')
        ) THEN '글쓰기 권한 있음 ✓'
        ELSE '글쓰기 권한 없음 ✗'
    END as permission_check;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'sn_posts RLS 정책이 수정되었습니다!';
    RAISE NOTICE '- INSERT 정책 재생성 완료';
    RAISE NOTICE '- 작성자가 자신의 draft도 볼 수 있도록 SELECT 정책 추가';
    RAISE NOTICE '';
    RAISE NOTICE '위의 검증 쿼리 결과를 확인하세요:';
    RAISE NOTICE '- 현재 사용자 role이 writer 또는 super_admin이어야 합니다.';
    RAISE NOTICE '- 아니면 sn_users 테이블에서 role을 변경하세요.';
    RAISE NOTICE '=============================================';
END $$;
