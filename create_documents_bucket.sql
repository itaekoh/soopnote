-- ============================================
-- Supabase Storage: documents 버킷 생성
-- ============================================
-- PDF, HWP, DOC 등 문서 파일 저장용 버킷

-- 1. documents 버킷 생성 (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. documents 버킷 정책 설정
-- 2-1. 인증된 사용자는 업로드 가능
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- 2-2. 모든 사용자는 다운로드 가능 (public read)
CREATE POLICY "Anyone can download documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- 2-3. 작성자는 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- 2-4. 작성자는 자신의 파일 업데이트 가능
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- 3. 확인
SELECT * FROM storage.buckets WHERE id = 'documents';

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ documents 버킷 생성 완료';
    RAISE NOTICE '  - 버킷 ID: documents';
    RAISE NOTICE '  - Public Access: Yes';
    RAISE NOTICE '  - 업로드: 인증된 사용자만';
    RAISE NOTICE '  - 다운로드: 모든 사용자';
    RAISE NOTICE '=============================================';
END $$;
