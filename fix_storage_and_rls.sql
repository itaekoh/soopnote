-- ============================================
-- Storage와 RLS 정책 수정
-- ============================================

-- ============================================
-- 1. Storage Bucket 'images' RLS 정책 설정
-- ============================================

-- images 버킷에 대한 RLS 정책 추가

-- 모든 사용자가 이미지를 볼 수 있음 (public read)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 로그인한 사용자가 이미지를 업로드할 수 있음
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.uid() IS NOT NULL
);

-- 업로드한 사용자가 자신의 이미지를 업데이트할 수 있음
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 업로드한 사용자가 자신의 이미지를 삭제할 수 있음
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. sn_post_categories 테이블 RLS 정책 추가
-- ============================================

-- RLS 활성화
ALTER TABLE sn_post_categories ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시글-카테고리 매핑을 볼 수 있음
CREATE POLICY "Anyone can view post categories"
ON sn_post_categories FOR SELECT
USING (true);

-- writer와 super_admin이 매핑을 생성할 수 있음
CREATE POLICY "Writers can create post categories"
ON sn_post_categories FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM sn_users
        WHERE id = auth.uid() AND role IN ('writer', 'super_admin')
    )
);

-- 게시글 작성자가 매핑을 업데이트/삭제할 수 있음
CREATE POLICY "Authors can update post categories"
ON sn_post_categories FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM sn_posts
        WHERE sn_posts.id = sn_post_categories.post_id
        AND sn_posts.author_id = auth.uid()
    )
);

CREATE POLICY "Authors can delete post categories"
ON sn_post_categories FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM sn_posts
        WHERE sn_posts.id = sn_post_categories.post_id
        AND sn_posts.author_id = auth.uid()
    )
);

-- ============================================
-- 3. 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Storage와 RLS 정책이 설정되었습니다!';
    RAISE NOTICE '- Storage images 버킷: 업로드 가능';
    RAISE NOTICE '- sn_post_categories: RLS 정책 추가 완료';
    RAISE NOTICE '이제 글쓰기가 정상적으로 작동합니다.';
    RAISE NOTICE '=============================================';
END $$;
