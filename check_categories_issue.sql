-- ============================================
-- 카테고리 로딩 문제 진단
-- ============================================

-- 1. 카테고리 데이터 존재 여부 확인
SELECT
    'sn_categories 전체 행 수' as info,
    COUNT(*) as count
FROM sn_categories
UNION ALL
SELECT
    'type=menu인 카테고리 수' as info,
    COUNT(*) as count
FROM sn_categories
WHERE type = 'menu'
UNION ALL
SELECT
    'is_active=true인 카테고리 수' as info,
    COUNT(*) as count
FROM sn_categories
WHERE is_active = true
UNION ALL
SELECT
    'type=menu AND is_active=true' as info,
    COUNT(*) as count
FROM sn_categories
WHERE type = 'menu' AND is_active = true;

-- 2. 메뉴 카테고리 목록 확인
SELECT
    id,
    name,
    slug,
    type,
    is_active,
    display_order
FROM sn_categories
WHERE type = 'menu'
ORDER BY display_order;

-- 3. RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'sn_categories';

-- 4. 현재 사용자가 카테고리를 조회할 수 있는지 테스트
SELECT
    id,
    name,
    slug,
    type
FROM sn_categories
WHERE type = 'menu' AND is_active = true
ORDER BY display_order;

-- ============================================
-- 문제 해결: 카테고리 데이터가 없는 경우
-- ============================================

-- 카테고리 데이터가 없으면 초기 데이터 삽입
DO $$
BEGIN
    -- 메뉴 카테고리 삽입
    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'wildflower') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description, is_active)
        VALUES (NULL, '야생화 일지', 'wildflower', 'menu', 1, '야생화 관찰 기록', true);
        RAISE NOTICE '✓ 야생화 일지 카테고리 생성';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'tree-diagnose') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description, is_active)
        VALUES (NULL, '나무진단', 'tree-diagnose', 'menu', 2, '나무의사의 전문 진단 기록', true);
        RAISE NOTICE '✓ 나무진단 카테고리 생성';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sn_categories WHERE slug = 'column') THEN
        INSERT INTO sn_categories (parent_id, name, slug, type, display_order, description, is_active)
        VALUES (NULL, '칼럼', 'column', 'menu', 3, '환경 및 자연 관련 칼럼', true);
        RAISE NOTICE '✓ 칼럼 카테고리 생성';
    END IF;
END $$;

-- ============================================
-- 문제 해결: RLS 정책 수정
-- ============================================

-- 기존 정책 확인 후 없으면 생성
DO $$
BEGIN
    -- "Anyone can view categories" 정책이 없으면 생성
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'sn_categories'
        AND policyname = 'Anyone can view categories'
    ) THEN
        CREATE POLICY "Anyone can view categories"
        ON sn_categories FOR SELECT
        USING (true);
        RAISE NOTICE '✓ 카테고리 SELECT 정책 생성';
    ELSE
        RAISE NOTICE 'ℹ️  카테고리 SELECT 정책 이미 존재';
    END IF;
END $$;

-- ============================================
-- 검증: 다시 조회
-- ============================================

-- 메뉴 카테고리 최종 확인
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ 메뉴 카테고리 조회 가능 (' || COUNT(*) || '개)'
        ELSE '✗ 메뉴 카테고리 없음'
    END as status
FROM sn_categories
WHERE type = 'menu' AND is_active = true;

-- 상세 목록
SELECT id, name, slug, display_order
FROM sn_categories
WHERE type = 'menu' AND is_active = true
ORDER BY display_order;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
DECLARE
    menu_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO menu_count
    FROM sn_categories
    WHERE type = 'menu' AND is_active = true;

    RAISE NOTICE '=============================================';
    RAISE NOTICE '카테고리 진단 완료';
    RAISE NOTICE '메뉴 카테고리: % 개', menu_count;
    IF menu_count > 0 THEN
        RAISE NOTICE '상태: 정상 ✓';
    ELSE
        RAISE NOTICE '상태: 카테고리 없음 ✗';
    END IF;
    RAISE NOTICE '=============================================';
END $$;
