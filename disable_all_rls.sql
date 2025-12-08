-- ============================================
-- 모든 테이블의 RLS 비활성화 (개발용)
-- ============================================

-- 1. sn_users RLS 비활성화
ALTER TABLE sn_users DISABLE ROW LEVEL SECURITY;

-- 2. sn_posts RLS 비활성화
ALTER TABLE sn_posts DISABLE ROW LEVEL SECURITY;

-- 3. sn_categories RLS 비활성화
ALTER TABLE sn_categories DISABLE ROW LEVEL SECURITY;

-- 4. sn_comments RLS 비활성화 (혹시 있다면)
ALTER TABLE sn_comments DISABLE ROW LEVEL SECURITY;

-- 5. sn_likes RLS 비활성화 (혹시 있다면)
ALTER TABLE sn_likes DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'sn_%'
ORDER BY tablename;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ 모든 테이블의 RLS가 비활성화되었습니다.';
    RAISE NOTICE '⚠️ 주의: 프로덕션 배포 전에 RLS를 다시 활성화하고';
    RAISE NOTICE '   적절한 정책을 설정해야 합니다!';
    RAISE NOTICE '===========================================';
END $$;
