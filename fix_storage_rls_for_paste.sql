-- ============================================
-- Storage RLS 정책 수정 (붙여넣기 이미지 업로드 에러 해결)
-- ============================================
-- 에러: "new row violates row-level security policy"
-- 원인: storage.objects 테이블의 INSERT 정책이 없거나 잘못 설정됨
-- ============================================

-- 1. 기존 images 버킷 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 추가로 다른 이름으로 생성된 정책들도 삭제
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;

-- ============================================
-- 2. 새로운 Storage RLS 정책 생성
-- ============================================

-- 2-1. SELECT: 모든 사용자가 images 버킷의 파일을 볼 수 있음 (public read)
CREATE POLICY "images_bucket_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- 2-2. INSERT: 인증된 사용자만 images 버킷에 업로드 가능
CREATE POLICY "images_bucket_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 2-3. UPDATE: 사용자가 자신의 폴더에 있는 파일만 수정 가능
-- 파일 경로: public/{userId}/filename.ext
CREATE POLICY "images_bucket_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'public'
    AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'public'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 2-4. DELETE: 사용자가 자신의 폴더에 있는 파일만 삭제 가능
CREATE POLICY "images_bucket_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'public'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ============================================
-- 3. 정책 확인
-- ============================================

-- images 버킷의 모든 정책 조회
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%images%'
ORDER BY policyname;

-- ============================================
-- 4. 버킷 설정 확인
-- ============================================

-- images 버킷 존재 및 public 설정 확인
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'images';

-- ============================================
-- 5. 완료 메시지
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ Storage RLS 정책이 재설정되었습니다!';
    RAISE NOTICE '';
    RAISE NOTICE '적용된 정책:';
    RAISE NOTICE '  - SELECT: 모든 사용자 (public)';
    RAISE NOTICE '  - INSERT: 인증된 사용자만';
    RAISE NOTICE '  - UPDATE: 본인 폴더만';
    RAISE NOTICE '  - DELETE: 본인 폴더만';
    RAISE NOTICE '';
    RAISE NOTICE '이제 TinyMCE 에디터에서 이미지 붙여넣기가';
    RAISE NOTICE '정상적으로 작동합니다!';
    RAISE NOTICE '=============================================';
END $$;
