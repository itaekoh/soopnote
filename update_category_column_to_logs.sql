-- ============================================
-- 카테고리 변경: column → logs
-- ============================================
-- "칼럼" 카테고리를 "Logs"로 변경합니다.

BEGIN;

-- 1. 카테고리 업데이트
UPDATE sn_categories
SET
    name = 'Logs',
    slug = 'logs',
    description = '기술, AI, 실무 팁과 다양한 생각들'
WHERE slug = 'column';

-- 2. 변경 확인
SELECT
    id,
    name,
    slug,
    description,
    display_order
FROM sn_categories
WHERE slug = 'logs';

-- 3. 관련 게시글 수 확인
SELECT
    COUNT(*) as post_count
FROM sn_posts
WHERE category_id = (SELECT id FROM sn_categories WHERE slug = 'logs');

COMMIT;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
DECLARE
    v_post_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_post_count
    FROM sn_posts
    WHERE category_id = (SELECT id FROM sn_categories WHERE slug = 'logs');

    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 카테고리 변경 완료';
    RAISE NOTICE '  - 이름: 칼럼 → Logs';
    RAISE NOTICE '  - slug: column → logs';
    RAISE NOTICE '  - 관련 게시글: % 개', v_post_count;
    RAISE NOTICE '=============================================';
END $$;
