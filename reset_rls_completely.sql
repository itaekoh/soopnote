-- ============================================
-- RLS 정책 완전 초기화 및 재설정
-- ============================================

-- 1. sn_users 테이블의 모든 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Allow insert own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;
DROP POLICY IF EXISTS "Authenticated users can view basic user info" ON sn_users;

-- 2. RLS 활성화 확인
ALTER TABLE sn_users ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 정책 생성 (더 단순하고 명확하게)

-- 모든 인증된 사용자가 모든 사용자의 기본 정보를 볼 수 있음
-- (게시글 작성자 정보 표시, 권한 체크 등에 필요)
CREATE POLICY "authenticated_users_can_read_all_profiles"
    ON sn_users FOR SELECT
    TO authenticated
    USING (true);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "users_can_update_own_profile"
    ON sn_users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 회원가입 시 프로필 생성 허용
CREATE POLICY "users_can_insert_own_profile"
    ON sn_users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 계정만 삭제 가능
CREATE POLICY "users_can_delete_own_profile"
    ON sn_users FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ RLS 정책이 완전히 재설정되었습니다.';
    RAISE NOTICE '모든 인증된 사용자가 모든 프로필을 읽을 수 있습니다.';
    RAISE NOTICE '사용자는 자신의 프로필만 수정/삭제 가능합니다.';
    RAISE NOTICE '===========================================';
END $$;

-- 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sn_users'
ORDER BY policyname;
