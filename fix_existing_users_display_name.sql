-- ============================================
-- 기존 사용자의 display_name 수정
-- ============================================

-- 1. 먼저 auth.users의 메타데이터를 확인하고 sn_users 업데이트
UPDATE public.sn_users
SET display_name = COALESCE(
    NULLIF(TRIM(auth.users.raw_user_meta_data->>'display_name'), ''),
    SPLIT_PART(auth.users.email, '@', 1)
)
FROM auth.users
WHERE sn_users.id = auth.users.id
  AND (
    sn_users.display_name IS NULL
    OR sn_users.display_name = ''
    OR sn_users.display_name = '사용자'
  );

-- 완료 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.sn_users;

  RAISE NOTICE '% 명의 사용자 display_name이 업데이트되었습니다.', updated_count;
END $$;
