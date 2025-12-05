-- ============================================
-- RLS 정책 수정 v2 (INSERT 정책 수정)
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;
DROP POLICY IF EXISTS "Allow insert own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON sn_users;

-- ============================================
-- sn_users 테이블 RLS 정책 (재작성)
-- ============================================

-- 1. SELECT: 사용자가 자신의 프로필을 볼 수 있음
CREATE POLICY "select_own_profile"
    ON sn_users FOR SELECT
    USING (auth.uid() = id);

-- 2. INSERT: 인증된 사용자는 자신의 프로필을 생성할 수 있음
CREATE POLICY "insert_own_profile"
    ON sn_users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. UPDATE: 사용자가 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "update_own_profile"
    ON sn_users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'RLS 정책이 재작성되었습니다.';
    RAISE NOTICE 'INSERT 정책이 수정되었습니다.';
END $$;
