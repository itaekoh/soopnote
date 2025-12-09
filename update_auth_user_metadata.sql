-- ============================================
-- Supabase Authentication Users Display Name 변경
-- ============================================
-- ⚠️ 주의: auth.users는 Supabase 인증 시스템이 관리하는 테이블입니다.
-- 가능하면 Dashboard UI에서 수정하거나 supabase.auth.updateUser() 사용 권장

-- 1. auth.users 테이블의 raw_user_meta_data 업데이트
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('display_name', '원하는이름')
WHERE email = '본인이메일@example.com';

-- 2. sn_users 테이블도 함께 업데이트 (일관성 유지)
UPDATE sn_users
SET display_name = '원하는이름'
WHERE email = '본인이메일@example.com';

-- 3. 결과 확인
SELECT
  id,
  email,
  raw_user_meta_data->>'display_name' as auth_display_name,
  created_at
FROM auth.users
WHERE email = '본인이메일@example.com';

SELECT id, email, display_name, role
FROM sn_users
WHERE email = '본인이메일@example.com';
