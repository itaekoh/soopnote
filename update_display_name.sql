-- ============================================
-- Display Name 변경
-- ============================================

-- 사용자 display_name 업데이트
-- 아래 이메일과 새 이름을 본인 것으로 수정 후 실행

UPDATE sn_users
SET display_name = '원하는이름'
WHERE email = '본인이메일@example.com';

-- 결과 확인
SELECT id, email, display_name, role, created_at
FROM sn_users
WHERE email = '본인이메일@example.com';
