-- sn_posts_full 뷰 다시 생성 (attachment 필드 포함)

-- 기존 뷰 삭제
DROP VIEW IF EXISTS sn_posts_full;

-- 뷰 재생성
CREATE OR REPLACE VIEW sn_posts_full AS
SELECT
    p.*,
    u.display_name as author_name,
    u.avatar_url as author_avatar,
    c.name as category_name,
    c.slug as category_slug,
    ARRAY_AGG(DISTINCT pc_sub.category_id) FILTER (WHERE pc_sub.category_id IS NOT NULL) as subcategory_ids,
    ARRAY_AGG(DISTINCT c_sub.name) FILTER (WHERE c_sub.name IS NOT NULL) as subcategory_names
FROM sn_posts p
LEFT JOIN sn_users u ON p.author_id = u.id
LEFT JOIN sn_categories c ON p.category_id = c.id
LEFT JOIN sn_post_categories pc_sub ON p.id = pc_sub.post_id
LEFT JOIN sn_categories c_sub ON pc_sub.category_id = c_sub.id AND c_sub.type = 'attribute'
GROUP BY p.id, u.display_name, u.avatar_url, c.name, c.slug;

-- 권한 설정
GRANT SELECT ON sn_posts_full TO anon, authenticated;
