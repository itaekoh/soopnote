-- ============================================
-- 게시물 조회 성능 최적화 스크립트 (v3 - DROP FUNCTION 포함)
-- ============================================
-- v3: 기존 함수 파라미터 시그니처 변경 오류 해결 (DROP FUNCTION 추가)
-- ============================================

-- 1. Trigram 확장 활성화 (ILIKE 검색 성능 향상용)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 필수 인덱스 생성 (이미 생성되었다면 실행되지 않음)
CREATE INDEX IF NOT EXISTS idx_sn_posts_status ON sn_posts(status);
CREATE INDEX IF NOT EXISTS idx_sn_posts_category_id ON sn_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_sn_posts_author_id ON sn_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_sn_posts_published_date ON sn_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_sn_posts_view_count ON sn_posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_sn_posts_search_trgm ON sn_posts USING gin ((title || ' ' || excerpt) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sn_post_categories_post_id_category_id ON sn_post_categories(post_id, category_id);

-- ============================================
-- 3. 게시물 조회용 RPC 함수 생성 (v3)
-- ============================================

-- 기존 함수 삭제 (파라미터 시그니처가 변경되었으므로 반드시 먼저 삭제해야 합니다.)
DROP FUNCTION IF EXISTS get_paginated_posts(integer, integer[], uuid, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION get_paginated_posts(
    in_category_id INT DEFAULT NULL,
    in_subcategory_ids INT[] DEFAULT NULL,
    in_author_id UUID DEFAULT NULL,
    in_status TEXT DEFAULT 'published',
    in_search TEXT DEFAULT NULL,
    in_sort TEXT DEFAULT 'latest',
    in_page INT DEFAULT 1,
    in_limit INT DEFAULT 10
)
RETURNS TABLE (
    id INT,
    author_id UUID,
    category_id INT,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    content TEXT,
    status TEXT,
    published_date TEXT,
    view_count INT,
    like_count INT,
    comment_count INT,
    featured_image_url TEXT,
    read_time INT,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    author_name TEXT,
    author_avatar TEXT,
    category_name TEXT,
    category_slug TEXT,
    subcategory_ids INT[],
    subcategory_names TEXT[],
    total_count BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    WITH filtered_posts AS (
        SELECT
            p.id,
            COUNT(*) OVER() AS exact_count
        FROM sn_posts p
        WHERE
            p.status = in_status
            AND (in_category_id IS NULL OR p.category_id = in_category_id)
            AND (in_author_id IS NULL OR p.author_id = in_author_id)
            AND (in_search IS NULL OR (p.title || ' ' || p.excerpt) ILIKE '%' || in_search || '%')
            AND (in_subcategory_ids IS NULL OR EXISTS (
                SELECT 1
                FROM sn_post_categories pc
                WHERE pc.post_id = p.id AND pc.category_id = ANY(in_subcategory_ids)
            ))
        ORDER BY
            CASE WHEN in_sort = 'latest' THEN p.published_date END DESC,
            CASE WHEN in_sort = 'oldest' THEN p.published_date END ASC,
            CASE WHEN in_sort = 'popular' THEN p.view_count END DESC
        LIMIT in_limit
        OFFSET (in_page - 1) * in_limit
    ),
    post_details AS (
        SELECT
            fp.id,
            p.author_id,
            p.category_id,
            p.title,
            p.slug,
            p.excerpt,
            p.content,
            p.status,
            TO_CHAR(p.published_date, 'YYYY-MM-DD') as published_date,
            p.view_count,
            p.like_count,
            p.comment_count,
            p.featured_image_url,
            p.read_time,
            p.is_featured,
            p.created_at,
            p.updated_at,
            p.published_at,
            u.display_name AS author_name,
            u.avatar_url AS author_avatar,
            cat.name AS category_name,
            cat.slug AS category_slug,
            fp.exact_count as total_count
        FROM filtered_posts fp
        JOIN sn_posts p ON fp.id = p.id
        LEFT JOIN sn_users u ON p.author_id = u.id
        LEFT JOIN sn_categories cat ON p.category_id = cat.id
    )
    SELECT
        pd.*,
        (SELECT ARRAY_AGG(DISTINCT sub_cat.id) FROM sn_post_categories pc_sub JOIN sn_categories sub_cat ON pc_sub.category_id = sub_cat.id WHERE pc_sub.post_id = pd.id) as subcategory_ids,
        (SELECT ARRAY_AGG(DISTINCT sub_cat.name) FROM sn_post_categories pc_sub JOIN sn_categories sub_cat ON pc_sub.category_id = sub_cat.id WHERE pc_sub.post_id = pd.id) as subcategory_names
    FROM post_details pd;
END;
$$ LANGUAGE plpgsql;

-- 권한 설정
GRANT EXECUTE ON FUNCTION get_paginated_posts TO anon, authenticated;
