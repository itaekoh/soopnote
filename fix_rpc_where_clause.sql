-- ============================================
-- RPC 함수 WHERE 조건 버그 수정
-- ============================================
-- 문제: OR 연산자 우선순위로 인해 이전 AND 조건들이 무시됨
-- 증상:
--   1. 나무진단 목록이 안 나옴
--   2. 아카이브 서브카테고리 필터 안 됨
-- 해결: 괄호로 OR 조건을 감싸서 우선순위 명확화
-- ============================================

-- 1. get_posts_count 함수 수정
DROP FUNCTION IF EXISTS get_posts_count(integer, integer[], uuid, text, text, boolean);

CREATE OR REPLACE FUNCTION get_posts_count(
    in_category_id INT DEFAULT NULL,
    in_subcategory_ids INT[] DEFAULT NULL,
    in_author_id UUID DEFAULT NULL,
    in_status TEXT DEFAULT 'published',
    in_search TEXT DEFAULT NULL,
    in_is_featured BOOLEAN DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    total_rows BIGINT;
BEGIN
    SELECT COUNT(DISTINCT p.id)
    INTO total_rows
    FROM sn_posts p
    LEFT JOIN sn_post_categories pc ON p.id = pc.post_id
    WHERE
        p.status = in_status
        AND (in_author_id IS NULL OR p.author_id = in_author_id)
        AND (in_is_featured IS NULL OR p.is_featured = in_is_featured)
        AND (in_search IS NULL OR (p.title || ' ' || p.excerpt) ILIKE '%' || in_search || '%')
        AND (
            -- ✅ 괄호로 OR 조건 전체를 감쌈
            (
                in_subcategory_ids IS NULL
                AND (in_category_id IS NULL OR p.category_id = in_category_id)
            ) OR (
                in_subcategory_ids IS NOT NULL AND pc.category_id = ANY(in_subcategory_ids)
            )
        );
    RETURN total_rows;
END;
$$ LANGUAGE plpgsql;

-- 2. get_paginated_posts 함수 수정
DROP FUNCTION IF EXISTS get_paginated_posts(integer, integer[], uuid, text, text, text, integer, integer, boolean);

CREATE OR REPLACE FUNCTION get_paginated_posts(
    in_category_id INT DEFAULT NULL,
    in_subcategory_ids INT[] DEFAULT NULL,
    in_author_id UUID DEFAULT NULL,
    in_status TEXT DEFAULT 'published',
    in_search TEXT DEFAULT NULL,
    in_sort TEXT DEFAULT 'latest',
    in_page INT DEFAULT 1,
    in_limit INT DEFAULT 10,
    in_is_featured BOOLEAN DEFAULT NULL
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
    WITH filtered_posts AS (
      SELECT p.id as post_id
      FROM sn_posts p
      LEFT JOIN sn_post_categories pc ON p.id = pc.post_id
      WHERE
        p.status = in_status
        AND (in_author_id IS NULL OR p.author_id = in_author_id)
        AND (in_is_featured IS NULL OR p.is_featured = in_is_featured)
        AND (in_search IS NULL OR (p.title || ' ' || p.excerpt) ILIKE '%' || in_search || '%')
        AND (
            -- ✅ 괄호로 OR 조건 전체를 감쌈
            (
                in_subcategory_ids IS NULL
                AND (in_category_id IS NULL OR p.category_id = in_category_id)
            ) OR (
                in_subcategory_ids IS NOT NULL AND pc.category_id = ANY(in_subcategory_ids)
            )
        )
      GROUP BY p.id
      ORDER BY
          CASE WHEN in_sort = 'latest' THEN p.published_date END DESC,
          CASE WHEN in_sort = 'oldest' THEN p.published_date END ASC,
          CASE WHEN in_sort = 'popular' THEN p.view_count END DESC
      LIMIT in_limit
      OFFSET (in_page - 1) * in_limit
    )
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
    FROM filtered_posts
    JOIN sn_posts p ON filtered_posts.post_id = p.id
    LEFT JOIN sn_users u ON p.author_id = u.id
    LEFT JOIN sn_categories main_cat ON p.category_id = main_cat.id
    LEFT JOIN sn_post_categories pc_sub ON p.id = pc_sub.post_id
    LEFT JOIN sn_categories sub_cat ON pc_sub.category_id = sub_cat.id AND sub_cat.type = 'attribute'
    GROUP BY p.id, u.id, main_cat.id;
END;
$$ LANGUAGE plpgsql;

-- 3. 권한 설정
GRANT EXECUTE ON FUNCTION get_posts_count(integer, integer[], uuid, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_paginated_posts(integer, integer[], uuid, text, text, text, integer, integer, boolean) TO anon, authenticated;

-- ============================================
-- 테스트 쿼리 (실행 후 확인)
-- ============================================

-- 테스트 1: 나무진단 카테고리 (category_id만 사용)
-- SELECT * FROM get_paginated_posts(
--     2,        -- tree-diagnose category_id (실제 ID로 변경)
--     NULL,     -- subcategory_ids
--     NULL,     -- author_id
--     'published',
--     NULL,     -- search
--     'latest',
--     1,
--     10,
--     NULL      -- is_featured
-- );

-- 테스트 2: 아카이브 서브카테고리 필터 (subcategory_ids 사용)
-- SELECT * FROM get_paginated_posts(
--     3,        -- logs category_id (실제 ID로 변경)
--     ARRAY[10, 11], -- Tech, Tree & Field subcategory IDs (실제 ID로 변경)
--     NULL,
--     'published',
--     NULL,
--     'latest',
--     1,
--     10,
--     NULL
-- );
