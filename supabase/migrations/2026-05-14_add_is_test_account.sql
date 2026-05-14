-- ============================================
-- sn_users: is_test_account 플래그 추가
-- ============================================
-- 목적: 본인 부계정 등 테스트 계정을 통계에서 제외하기 위한 플래그
-- Supabase Studio → SQL Editor 에서 실행
-- ============================================

ALTER TABLE sn_users
  ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN NOT NULL DEFAULT FALSE;

-- 인덱스 (구독 분석 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_sn_users_is_test_account
  ON sn_users (is_test_account)
  WHERE is_test_account = TRUE;

COMMENT ON COLUMN sn_users.is_test_account IS
  '테스트 계정 여부 (본인 부계정 등). 구독 분석 등 통계에서 기본 제외 대상.';

-- ============================================
-- RPC: super_admin만 다른 회원의 테스트 플래그 변경 가능
-- ============================================
-- RLS 우회: SECURITY DEFINER + 함수 내부에서 권한 직접 검증
-- (sn_users의 일반 UPDATE 정책은 그대로 두고, 이 RPC로만 변경)

CREATE OR REPLACE FUNCTION set_test_account_flag(
  target_user_id UUID,
  is_test BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- 호출자 권한 확인
  SELECT role INTO caller_role
  FROM sn_users
  WHERE id = auth.uid();

  IF caller_role IS NULL OR caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'permission denied: super_admin only';
  END IF;

  -- 업데이트
  UPDATE sn_users
  SET is_test_account = is_test
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found: %', target_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION set_test_account_flag(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_test_account_flag(UUID, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION set_test_account_flag(UUID, BOOLEAN) IS
  '관리자가 회원의 is_test_account 플래그를 변경하는 RPC. super_admin 전용.';
