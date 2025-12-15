-- ============================================
-- 추가 RPC 함수 생성 (VIEW 대체용)
-- ============================================
-- 목적: sn_posts_full VIEW 사용을 중단하고 RPC로 대체
-- 성능 개선: content 필드 제외, 필요한 데이터만 조회
-- ============================================

-- 1. 카테고리별 최신 게시글 조회 RPC
-- getLatestPostsByCategory() 대체용
DROP FUNCTION IF EXISTS get_latest_posts_by_category(integer, integer);

CREATE OR REPLACE FUNCTION get_latest_posts_by_category(
    in_category_id INT,
    in_limit INT DEFAULT 5
)
RETURNS TABLE (
    id INT,
    author_id UUID,
    category_id INT,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    status TEXT,
    published_date TEXT,
    view_count INT,
    like_count INT,
    comment_count INT,
    featured_image_url TEXT,
    read_time TEXT,
    location TEXT,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    author_name TEXT,
    author_avatar TEXT,
    category_name TEXT,
    category_slug TEXT,
    subcategory_ids INT[],
    subcategory_names TEXT[]
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.author_id, p.category_id, p.title, p.slug, p.excerpt,
        p.status,
        TO_CHAR(p.published_date, 'YYYY-MM-DD') as published_date,
        p.view_count, p.like_count, p.comment_count,
        p.featured_image_url, p.read_time, p.location,
        p.is_featured, p.created_at, p.updated_at, p.published_at,
        u.display_name AS author_name,
        u.avatar_url AS author_avatar,
        main_cat.name AS category_name,
        main_cat.slug AS category_slug,
        ARRAY_AGG(DISTINCT sub_cat.id) FILTER (WHERE sub_cat.id IS NOT NULL) as subcategory_ids,
        ARRAY_AGG(DISTINCT sub_cat.name) FILTER (WHERE sub_cat.name IS NOT NULL) as subcategory_names
    FROM sn_posts p
    LEFT JOIN sn_users u ON p.author_id = u.id
    LEFT JOIN sn_categories main_cat ON p.category_id = main_cat.id
    LEFT JOIN sn_post_categories pc_sub ON p.id = pc_sub.post_id
    LEFT JOIN sn_categories sub_cat ON pc_sub.category_id = sub_cat.id AND sub_cat.type = 'attribute'
    WHERE
        p.category_id = in_category_id
        AND p.status = 'published'
    GROUP BY p.id, u.id, main_cat.id
    ORDER BY p.published_date DESC
    LIMIT in_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Featured 게시글 조회 RPC
-- getFeaturedPosts() 대체용
DROP FUNCTION IF EXISTS get_featured_posts(integer);

CREATE OR REPLACE FUNCTION get_featured_posts(
    in_limit INT DEFAULT 5
)
RETURNS TABLE (
    id INT,
    author_id UUID,
    category_id INT,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    status TEXT,
    published_date TEXT,
    view_count INT,
    like_count INT,
    comment_count INT,
    featured_image_url TEXT,
    read_time TEXT,
    location TEXT,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    author_name TEXT,
    author_avatar TEXT,
    category_name TEXT,
    category_slug TEXT,
    subcategory_ids INT[],
    subcategory_names TEXT[]
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.author_id, p.category_id, p.title, p.slug, p.excerpt,
        p.status,
        TO_CHAR(p.published_date, 'YYYY-MM-DD') as published_date,
        p.view_count, p.like_count, p.comment_count,
        p.featured_image_url, p.read_time, p.location,
        p.is_featured, p.created_at, p.updated_at, p.published_at,
        u.display_name AS author_name,
        u.avatar_url AS author_avatar,
        main_cat.name AS category_name,
        main_cat.slug AS category_slug,
        ARRAY_AGG(DISTINCT sub_cat.id) FILTER (WHERE sub_cat.id IS NOT NULL) as subcategory_ids,
        ARRAY_AGG(DISTINCT sub_cat.name) FILTER (WHERE sub_cat.name IS NOT NULL) as subcategory_names
    FROM sn_posts p
    LEFT JOIN sn_users u ON p.author_id = u.id
    LEFT JOIN sn_categories main_cat ON p.category_id = main_cat.id
    LEFT JOIN sn_post_categories pc_sub ON p.id = pc_sub.post_id
    LEFT JOIN sn_categories sub_cat ON pc_sub.category_id = sub_cat.id AND sub_cat.type = 'attribute'
    WHERE
        p.status = 'published'
        AND p.is_featured = true
    GROUP BY p.id, u.id, main_cat.id
    ORDER BY p.published_date DESC
    LIMIT in_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 권한 설정
-- ============================================
GRANT EXECUTE ON FUNCTION get_latest_posts_by_category(integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_featured_posts(integer) TO anon, authenticated;
