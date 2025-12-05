-- ============================================
-- Auth 메타데이터 디버깅
-- ============================================

-- 1. auth.users의 실제 메타데이터 확인
SELECT
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'display_name' as extracted_display_name,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. sn_users와 비교
SELECT
    sn_users.email,
    sn_users.display_name as "sn_users_display_name",
    auth.users.raw_user_meta_data->>'display_name' as "auth_metadata_display_name",
    auth.users.raw_user_meta_data as "전체_메타데이터"
FROM public.sn_users
LEFT JOIN auth.users ON sn_users.id = auth.users.id;
