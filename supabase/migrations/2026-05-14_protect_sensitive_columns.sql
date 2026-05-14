-- ============================================
-- sn_users 민감 컬럼 보호 (자가 권한/구독 상승 차단)
-- ============================================
-- 문제: 기존 RLS "users_can_update_own_profile"는 컬럼 제한이 없어
-- 인증된 사용자가 본인 행의 role, subscription_*, is_test_account 등을
-- 임의로 변경 가능 → super_admin 자가 격상, 평생 프리미엄 등 악용 가능.
--
-- 해결: BEFORE UPDATE 트리거로 보호 컬럼 변경을 차단.
-- 정당한 변경 경로:
--   1. service_role (Edge Functions: verify-subscription, google-play-webhook)
--   2. SECURITY DEFINER RPC가 set_config('sn.skip_protect','on',true) 후 변경
-- ============================================

CREATE OR REPLACE FUNCTION sn_users_protect_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- service_role (Edge Functions) — 무조건 통과
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- 트러스티드 RPC 우회 플래그 (트랜잭션 로컬)
  IF current_setting('sn.skip_protect', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- 보호 컬럼 변경 차단
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'permission denied: role is managed by admin only';
  END IF;
  IF NEW.subscription_state IS DISTINCT FROM OLD.subscription_state THEN
    RAISE EXCEPTION 'permission denied: subscription_state is managed by server';
  END IF;
  IF NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at THEN
    RAISE EXCEPTION 'permission denied: subscription_expires_at is managed by server';
  END IF;
  IF NEW.subscription_product_id IS DISTINCT FROM OLD.subscription_product_id THEN
    RAISE EXCEPTION 'permission denied: subscription_product_id is managed by server';
  END IF;
  IF NEW.subscription_purchase_token IS DISTINCT FROM OLD.subscription_purchase_token THEN
    RAISE EXCEPTION 'permission denied: subscription_purchase_token is managed by server';
  END IF;
  IF NEW.is_test_account IS DISTINCT FROM OLD.is_test_account THEN
    RAISE EXCEPTION 'permission denied: use set_test_account_flag RPC';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sn_users_protect_columns_trigger ON sn_users;
CREATE TRIGGER sn_users_protect_columns_trigger
  BEFORE UPDATE ON sn_users
  FOR EACH ROW
  EXECUTE FUNCTION sn_users_protect_columns();

-- ============================================
-- 기존 set_test_account_flag RPC 업데이트 — 우회 플래그 추가
-- ============================================

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
  SELECT role INTO caller_role FROM sn_users WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'permission denied: super_admin only';
  END IF;

  -- 트리거 우회 (트랜잭션 로컬)
  PERFORM set_config('sn.skip_protect', 'on', true);

  UPDATE sn_users SET is_test_account = is_test WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found: %', target_user_id;
  END IF;
END;
$$;

-- ============================================
-- 새 RPC: admin_update_user_role
-- ============================================
-- super_admin만 다른 사용자의 role을 변경 가능.
-- 기존 클라이언트의 direct UPDATE는 트리거로 차단되므로 RPC 사용 필수.

CREATE OR REPLACE FUNCTION admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- role 유효성 검증
  IF new_role NOT IN ('user', 'writer', 'super_admin') THEN
    RAISE EXCEPTION 'invalid role: %', new_role;
  END IF;

  -- 호출자 권한 검증
  SELECT role INTO caller_role FROM sn_users WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'permission denied: super_admin only';
  END IF;

  -- 트리거 우회
  PERFORM set_config('sn.skip_protect', 'on', true);

  UPDATE sn_users SET role = new_role WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found: %', target_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION admin_update_user_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_user_role(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION admin_update_user_role(UUID, TEXT) IS
  'super_admin이 다른 사용자의 role을 변경하는 RPC. 트리거 우회.';

-- ============================================
-- 확인
-- ============================================
-- 일반 사용자가 본인 role을 super_admin으로 바꾸려 시도:
--   UPDATE sn_users SET role='super_admin' WHERE id=auth.uid();
--   → ERROR: permission denied: role is managed by admin only
--
-- 일반 사용자가 본인 subscription_state를 active로 변경 시도:
--   UPDATE sn_users SET subscription_state='active' WHERE id=auth.uid();
--   → ERROR: permission denied: subscription_state is managed by server
--
-- super_admin이 RPC로 다른 사용자 role 변경:
--   SELECT admin_update_user_role('<uuid>', 'writer');
--   → OK
