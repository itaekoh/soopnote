-- ============================================
-- 사용자 권한 업데이트 (빠른 해결)
-- ============================================

-- 현재 로그인한 사용자에게 writer 권한 부여
UPDATE sn_users
SET role = 'writer',
    updated_at = NOW()
WHERE id = auth.uid();

-- 또는 이메일로 특정 사용자에게 권한 부여
-- UPDATE sn_users
-- SET role = 'writer',
--     updated_at = NOW()
-- WHERE email = 'your@email.com'; -- 본인 이메일로 변경

-- 결과 확인
SELECT id, email, display_name, role, updated_at
FROM sn_users
WHERE id = auth.uid();

-- 권한 확인
SELECT
    CASE
        WHEN role IN ('writer', 'super_admin') THEN '글쓰기 가능 ✓'
        ELSE '글쓰기 불가 ✗'
    END as status
FROM sn_users
WHERE id = auth.uid();
