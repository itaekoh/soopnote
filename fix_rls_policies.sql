-- ============================================
-- RLS 정책 수정 (무한 재귀 해결)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;

-- ============================================
-- sn_users 테이블 RLS 정책 (수정)
-- ============================================

-- 1. 사용자가 자신의 프로필을 볼 수 있음 (간단한 체크)
CREATE POLICY "Users can view own profile"
    ON sn_users FOR SELECT
    USING (auth.uid() = id);

-- 2. 사용자가 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
    ON sn_users FOR UPDATE
    USING (auth.uid() = id);

-- 3. 회원가입 시 프로필 생성 허용 (인증된 모든 사용자)
CREATE POLICY "Allow insert own profile"
    ON sn_users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 4. super_admin만 다른 사용자의 role을 업데이트할 수 있음
-- (자신의 role 변경은 막음)
CREATE POLICY "Super admins can update user roles"
    ON sn_users FOR UPDATE
    USING (
        -- 현재 사용자가 super_admin이고
        auth.uid() IN (
            SELECT id FROM sn_users WHERE id = auth.uid() AND role = 'super_admin'
        )
        -- 다른 사용자의 role만 변경 가능 (자신의 role은 변경 불가)
        AND id != auth.uid()
    )
    WITH CHECK (
        -- role 컬럼만 업데이트 가능하도록 추가 체크 가능
        true
    );

-- ============================================
-- 참고: super_admin이 모든 사용자 조회는 별도 처리
-- ============================================
-- super_admin이 모든 사용자를 조회해야 하는 경우:
-- 1. 클라이언트에서 service_role key 사용 (보안 위험)
-- 2. Supabase Functions (Edge Functions)에서 처리
-- 3. Next.js API Routes에서 server-side로 처리

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'RLS 정책이 수정되었습니다.';
    RAISE NOTICE '무한 재귀 문제가 해결되었습니다.';
END $$;
