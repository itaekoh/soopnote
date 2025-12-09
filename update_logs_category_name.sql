-- sn_categories 테이블에서 logs 카테고리 이름을 "아카이브"로 변경

UPDATE sn_categories
SET name = '아카이브'
WHERE slug = 'logs' AND type = 'menu';

-- 변경 확인
SELECT id, name, slug, type
FROM sn_categories
WHERE slug = 'logs';
