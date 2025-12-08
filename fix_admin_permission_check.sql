-- ============================================
-- 관리자 권한 체크 문제 해결
-- ============================================

-- 기존 정책 확인 및 수정

-- 1. 사용자가 자신의 프로필(role 포함)을 볼 수 있도록 정책 확인
-- 이미 "Users can view own profile" 정책이 있어야 함
-- 혹시 없다면 생성:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'sn_users'
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
            ON sn_users FOR SELECT
            USING (auth.uid() = id);
        RAISE NOTICE '✓ "Users can view own profile" 정책 생성됨';
    ELSE
        RAISE NOTICE '✓ "Users can view own profile" 정책 이미 존재';
    END IF;
END $$;

-- 2. 모든 인증된 사용자가 다른 사용자의 기본 정보(이름, 아바타)를 볼 수 있도록 허용
-- (게시글 작성자 정보 표시를 위해 필요)
DROP POLICY IF EXISTS "Authenticated users can view basic user info" ON sn_users;

CREATE POLICY "Authenticated users can view basic user info"
    ON sn_users FOR SELECT
    USING (
        auth.role() = 'authenticated'
    );

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ RLS 정책 수정 완료';
    RAISE NOTICE '이제 사용자가 자신의 role을 조회할 수 있습니다.';
    RAISE NOTICE '===========================================';
END $$;
