-- ============================================
-- sn_categories 테이블에 attribute_key 컬럼 추가
-- ============================================

-- attribute_key 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE sn_categories
ADD COLUMN IF NOT EXISTS attribute_key TEXT;

-- 결과 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sn_categories'
ORDER BY ordinal_position;
