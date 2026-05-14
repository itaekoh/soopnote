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
