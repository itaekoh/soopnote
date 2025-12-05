-- ============================================
-- Storage Bucket 생성 및 설정
-- ============================================

-- 'images' 버킷이 없으면 생성
-- Supabase Dashboard에서 수동으로 생성해야 합니다:
-- 1. Storage > Create new bucket
-- 2. Name: images
-- 3. Public bucket: ✓ (체크)
-- 4. Allowed MIME types: image/* (선택사항)
-- 5. File size limit: 10MB (선택사항)

-- 또는 아래 SQL 실행 (Supabase Dashboard에서 지원하는 경우):
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 확인 쿼리
-- ============================================

-- 버킷 목록 확인
SELECT * FROM storage.buckets;

-- images 버킷 존재 여부 확인
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
            'images 버킷이 존재합니다 ✓'
        ELSE
            'images 버킷을 생성해야 합니다 ✗'
    END as status;
