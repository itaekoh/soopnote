-- ============================================
-- Archive 카테고리 서브카테고리 재구성
-- ============================================

-- 1. 기존 logs 서브카테고리 삭제 (매핑 테이블 먼저 정리)
DELETE FROM sn_post_categories 
WHERE category_id IN (
  SELECT id FROM sn_categories 
  WHERE parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu')
);

-- 2. 기존 logs 서브카테고리 삭제
DELETE FROM sn_categories 
WHERE parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu');

-- 3. logs 카테고리 ID 가져오기 (INSERT에서 사용)
DO $$
DECLARE
  logs_category_id INTEGER;
BEGIN
  -- logs 카테고리 ID 조회
  SELECT id INTO logs_category_id 
  FROM sn_categories 
  WHERE slug = 'logs' AND type = 'menu';

  -- 새로운 서브카테고리 생성
  INSERT INTO sn_categories (name, slug, type, parent_id, description, display_order, created_at, updated_at) 
  VALUES
    ('Daily', 'daily', 'attribute', logs_category_id, '일상/생각', 1, NOW(), NOW()),
    ('Tech', 'tech', 'attribute', logs_category_id, 'AI, 개발, 도구, 튜토리얼', 2, NOW(), NOW()),
    ('Insights', 'insights', 'attribute', logs_category_id, '칼럼/인사이트/경험', 3, NOW(), NOW()),
    ('Tree & Field', 'tree-field', 'attribute', logs_category_id, '나무의사 현장/정리', 4, NOW(), NOW()),
    ('Business', 'business', 'attribute', logs_category_id, '창업/전략/운영', 5, NOW(), NOW());
  
  RAISE NOTICE 'Archive 서브카테고리 생성 완료';
END $$;

-- 4. 결과 확인
SELECT 
  c.id,
  c.name,
  c.slug,
  c.type,
  c.description,
  c.display_order,
  parent.name as parent_name
FROM sn_categories c
LEFT JOIN sn_categories parent ON c.parent_id = parent.id
WHERE c.parent_id = (SELECT id FROM sn_categories WHERE slug = 'logs' AND type = 'menu')
ORDER BY c.display_order;
