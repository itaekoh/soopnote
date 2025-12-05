-- ============================================
-- 빠른 해결: 현재 사용자의 display_name 수정
-- ============================================

-- 현재 "사용자"로 표시된 모든 사용자를 이메일 앞부분으로 변경
UPDATE sn_users
SET display_name = SPLIT_PART(email, '@', 1),
    updated_at = NOW()
WHERE display_name = '사용자';

-- 결과 확인
SELECT id, email, display_name, updated_at
FROM sn_users;
