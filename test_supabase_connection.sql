-- ============================================
-- Supabase 연결 및 데이터 확인
-- ============================================

-- 1. RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('sn_users', 'sn_posts', 'sn_categories', 'sn_posts_full')
ORDER BY tablename;

-- 2. 게시글 수 확인
SELECT COUNT(*) as total_posts FROM sn_posts;

-- 3. 발행된 게시글 수 확인
SELECT COUNT(*) as published_posts FROM sn_posts WHERE status = 'published';

-- 4. 사용자 수 확인
SELECT COUNT(*) as total_users FROM sn_users;

-- 5. 최근 게시글 5개 확인
SELECT
    id,
    title,
    status,
    created_at,
    category_id
FROM sn_posts
ORDER BY created_at DESC
LIMIT 5;

-- 6. sn_posts_full 뷰 확인
SELECT COUNT(*) as posts_in_view FROM sn_posts_full;

-- 7. Featured 게시글 확인
SELECT COUNT(*) as featured_posts FROM sn_posts WHERE is_featured = true;
