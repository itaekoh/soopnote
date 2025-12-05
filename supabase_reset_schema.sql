-- ============================================
-- Soopnote Database RESET Script
-- ============================================
-- ⚠️ 경고: 이 스크립트는 모든 데이터를 삭제합니다!
-- ⚠️ 기존 데이터를 완전히 제거하고 새로 시작하려면 이 파일을 실행하세요
-- ============================================

-- RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON sn_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sn_users;
DROP POLICY IF EXISTS "Super admins can view all users" ON sn_users;
DROP POLICY IF EXISTS "Anyone can view published posts" ON sn_posts;
DROP POLICY IF EXISTS "Writers and admins can create posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON sn_posts;
DROP POLICY IF EXISTS "Super admins can update all posts" ON sn_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON sn_posts;
DROP POLICY IF EXISTS "Super admins can delete all posts" ON sn_posts;
DROP POLICY IF EXISTS "Anyone can view categories" ON sn_categories;
DROP POLICY IF EXISTS "Super admins can manage categories" ON sn_categories;
DROP POLICY IF EXISTS "Anyone can view comments" ON sn_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON sn_comments;
DROP POLICY IF EXISTS "Authors can update own comments" ON sn_comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON sn_comments;
DROP POLICY IF EXISTS "Anyone can view likes" ON sn_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON sn_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON sn_likes;

-- 뷰 삭제
DROP VIEW IF EXISTS sn_posts_full;
DROP VIEW IF EXISTS sn_categories_hierarchy;

-- 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_sn_users_updated_at ON sn_users;
DROP TRIGGER IF EXISTS trigger_update_sn_categories_updated_at ON sn_categories;
DROP TRIGGER IF EXISTS trigger_update_sn_posts_updated_at ON sn_posts;
DROP TRIGGER IF EXISTS trigger_update_sn_comments_updated_at ON sn_comments;
DROP TRIGGER IF EXISTS trigger_update_post_comment_count_insert ON sn_comments;
DROP TRIGGER IF EXISTS trigger_update_post_comment_count_delete ON sn_comments;
DROP TRIGGER IF EXISTS trigger_update_post_like_count_insert ON sn_likes;
DROP TRIGGER IF EXISTS trigger_update_post_like_count_delete ON sn_likes;

-- 함수 삭제
DROP FUNCTION IF EXISTS update_sn_users_updated_at();
DROP FUNCTION IF EXISTS update_post_comment_count();
DROP FUNCTION IF EXISTS update_post_like_count();

-- 테이블 삭제 (의존성 순서에 따라)
DROP TABLE IF EXISTS sn_images CASCADE;
DROP TABLE IF EXISTS sn_likes CASCADE;
DROP TABLE IF EXISTS sn_comments CASCADE;
DROP TABLE IF EXISTS sn_post_categories CASCADE;
DROP TABLE IF EXISTS sn_posts CASCADE;
DROP TABLE IF EXISTS sn_categories CASCADE;
DROP TABLE IF EXISTS sn_users CASCADE;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '모든 Soopnote 테이블과 데이터가 삭제되었습니다.';
    RAISE NOTICE '이제 supabase_schema.sql 파일을 실행하여 새로 생성하세요.';
END $$;
