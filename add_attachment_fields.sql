-- ============================================
-- sn_posts 테이블에 첨부파일 필드 추가
-- ============================================
-- 문서 첨부 기능을 위한 필드 추가 (PDF, HWP, DOC 등)

BEGIN;

-- 1. 첨부파일 URL 필드 추가
ALTER TABLE sn_posts
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size BIGINT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- 2. 필드에 대한 설명 추가
COMMENT ON COLUMN sn_posts.attachment_url IS '첨부파일 URL (Supabase Storage)';
COMMENT ON COLUMN sn_posts.attachment_name IS '첨부파일 원본 파일명';
COMMENT ON COLUMN sn_posts.attachment_size IS '첨부파일 크기 (bytes)';
COMMENT ON COLUMN sn_posts.attachment_type IS '첨부파일 MIME 타입';

-- 3. 변경사항 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sn_posts'
AND column_name LIKE 'attachment%'
ORDER BY ordinal_position;

COMMIT;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 첨부파일 필드 추가 완료';
    RAISE NOTICE '  - attachment_url: 파일 URL';
    RAISE NOTICE '  - attachment_name: 파일명';
    RAISE NOTICE '  - attachment_size: 파일 크기';
    RAISE NOTICE '  - attachment_type: MIME 타입';
    RAISE NOTICE '=============================================';
END $$;
