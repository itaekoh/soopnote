-- ============================================
-- 사용자 display_name 확인 및 수정
-- ============================================

-- 1. 현재 상태 확인
SELECT
    sn_users.id,
    sn_users.email,
    sn_users.display_name as "현재_display_name",
    auth.users.raw_user_meta_data->>'display_name' as "메타데이터_display_name",
    SPLIT_PART(sn_users.email, '@', 1) as "이메일_기반_이름"
FROM public.sn_users
LEFT JOIN auth.users ON sn_users.id = auth.users.id;

-- 2. display_name이 비어있거나 '-'인 경우 이메일 기반으로 업데이트
UPDATE public.sn_users
SET display_name = SPLIT_PART(email, '@', 1),
    updated_at = NOW()
WHERE display_name IS NULL
   OR display_name = ''
   OR display_name = '-'
   OR display_name = '사용자';

-- 3. 특정 사용자의 display_name을 직접 수정하려면 아래 주석을 해제하고 실행하세요
-- UPDATE public.sn_users
-- SET display_name = '원하는이름',
--     updated_at = NOW()
-- WHERE email = 'your@email.com';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'display_name 업데이트가 완료되었습니다.';
    RAISE NOTICE '위의 SELECT 결과를 확인하여 제대로 업데이트되었는지 확인하세요.';
END $$;
