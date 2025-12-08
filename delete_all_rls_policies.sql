-- ============================================
-- 모든 RLS 정책 완전 삭제
-- ============================================

-- sn_users 테이블의 모든 정책 삭제
DROP POLICY IF EXISTS "Anyone can view user profiles" ON sn_users;
DROP POLICY IF EXISTS "authenticated_users_can_read_all_profiles" ON sn_users;
DROP POLICY IF EXISTS "delete_own_profile" ON sn_users;
DROP POLICY IF EXISTS "select_own_profile" ON sn_users;
DROP POLICY IF EXISTS "update_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON sn_users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON sn_users;
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Allow insert own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;
DROP POLICY IF EXISTS "Authenticated users can view basic user info" ON sn_users;

-- RLS 비활성화 (개발 중에만 사용)
ALTER TABLE sn_users DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE tablename = 'sn_users';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ 모든 RLS 정책이 삭제되었습니다.';
    RAISE NOTICE '✓ RLS가 비활성화되었습니다.';
    RAISE NOTICE '주의: 프로덕션 배포 전에 RLS를 다시 활성화해야 합니다!';
    RAISE NOTICE '===========================================';
END $$;
