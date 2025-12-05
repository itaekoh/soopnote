-- ============================================
-- 테스트 데이터 삭제 (초기화)
-- ============================================

-- ============================================
-- 1. 삭제 전 현재 데이터 확인
-- ============================================

-- 전체 게시글 수 확인
SELECT
    '전체 게시글 수' as 구분,
    COUNT(*) as 개수
FROM sn_posts
UNION ALL
SELECT
    '본인이 작성한 게시글 수' as 구분,
    COUNT(*) as 개수
FROM sn_posts
WHERE author_id = auth.uid();

-- 카테고리별 게시글 수
SELECT
    c.name as 카테고리,
    COUNT(p.id) as 게시글수,
    COUNT(CASE WHEN p.author_id = auth.uid() THEN 1 END) as 본인작성
FROM sn_categories c
LEFT JOIN sn_posts p ON c.id = p.category_id
WHERE c.type = 'menu'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- 삭제될 게시글 목록 미리보기
SELECT
    p.id,
    c.name as 카테고리,
    p.title as 제목,
    p.published_date as 날짜,
    p.created_at as 생성일
FROM sn_posts p
JOIN sn_categories c ON p.category_id = c.id
WHERE p.author_id = auth.uid()
ORDER BY p.created_at DESC;

-- ============================================
-- 2. 게시글 삭제 (관련 데이터 자동 삭제됨)
-- ============================================

-- 옵션 1: 본인이 작성한 게시글만 삭제 (권장)
DELETE FROM sn_posts
WHERE author_id = auth.uid();

-- 옵션 2: 모든 게시글 삭제 (주의!)
-- DELETE FROM sn_posts;

-- ============================================
-- 3. 관련 테이블 데이터도 함께 정리
-- ============================================

-- 게시글-카테고리 매핑 (CASCADE로 자동 삭제되지만 확인)
-- DELETE FROM sn_post_categories
-- WHERE post_id NOT IN (SELECT id FROM sn_posts);

-- 댓글 (CASCADE로 자동 삭제되지만 확인)
-- DELETE FROM sn_comments
-- WHERE post_id NOT IN (SELECT id FROM sn_posts);

-- 좋아요 (CASCADE로 자동 삭제되지만 확인)
-- DELETE FROM sn_likes
-- WHERE post_id NOT IN (SELECT id FROM sn_posts);

-- ============================================
-- 4. 삭제 후 결과 확인
-- ============================================

-- 남은 게시글 수 확인
SELECT
    '삭제 후 전체 게시글 수' as 구분,
    COUNT(*) as 개수
FROM sn_posts;

-- 카테고리별 확인
SELECT
    c.name as 카테고리,
    COUNT(p.id) as 남은게시글수
FROM sn_categories c
LEFT JOIN sn_posts p ON c.id = p.category_id
WHERE c.type = 'menu'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 방금 삭제된 개수는 이미 삭제되어서 확인 불가
    -- 현재 남은 개수 표시
    SELECT COUNT(*) INTO deleted_count FROM sn_posts;

    RAISE NOTICE '=============================================';
    RAISE NOTICE '데이터 삭제 완료!';
    RAISE NOTICE '현재 남은 게시글: % 개', deleted_count;
    RAISE NOTICE '이제 insert_sample_data.sql을 실행하세요.';
    RAISE NOTICE '=============================================';
END $$;
