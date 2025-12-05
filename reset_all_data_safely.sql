-- ============================================
-- 전체 데이터 안전하게 초기화
-- ============================================
-- 주의: 이 스크립트는 모든 게시글, 댓글, 좋아요를 삭제합니다!
-- 사용자 정보(sn_users)와 카테고리(sn_categories)는 유지됩니다.
-- ============================================

-- ============================================
-- 1. 삭제 전 데이터 백업 확인
-- ============================================

DO $$
DECLARE
    total_posts INTEGER;
    total_comments INTEGER;
    total_likes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_posts FROM sn_posts;
    SELECT COUNT(*) INTO total_comments FROM sn_comments;
    SELECT COUNT(*) INTO total_likes FROM sn_likes;

    RAISE NOTICE '=============================================';
    RAISE NOTICE '⚠️  데이터 삭제 전 확인';
    RAISE NOTICE '게시글: % 개', total_posts;
    RAISE NOTICE '댓글: % 개', total_comments;
    RAISE NOTICE '좋아요: % 개', total_likes;
    RAISE NOTICE '';
    RAISE NOTICE '이 데이터를 모두 삭제하시겠습니까?';
    RAISE NOTICE '계속하려면 아래 DELETE 문의 주석을 해제하세요.';
    RAISE NOTICE '=============================================';
END $$;

-- ============================================
-- 2. 데이터 삭제 (주석 해제하여 실행)
-- ============================================

-- 주석을 해제하고 실행하세요:

-- 게시글-카테고리 매핑 삭제
-- DELETE FROM sn_post_categories;

-- 댓글 삭제
-- DELETE FROM sn_comments;

-- 좋아요 삭제
-- DELETE FROM sn_likes;

-- 게시글 삭제
-- DELETE FROM sn_posts;

-- ============================================
-- 3. AUTO INCREMENT 초기화 (선택사항)
-- ============================================

-- 게시글 ID를 1부터 다시 시작하고 싶으면 주석 해제:
-- ALTER SEQUENCE sn_posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sn_post_categories_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sn_comments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE sn_likes_id_seq RESTART WITH 1;

-- ============================================
-- 4. 삭제 후 확인
-- ============================================

SELECT
    'sn_posts' as 테이블,
    COUNT(*) as 남은개수
FROM sn_posts
UNION ALL
SELECT
    'sn_post_categories' as 테이블,
    COUNT(*) as 남은개수
FROM sn_post_categories
UNION ALL
SELECT
    'sn_comments' as 테이블,
    COUNT(*) as 남은개수
FROM sn_comments
UNION ALL
SELECT
    'sn_likes' as 테이블,
    COUNT(*) as 남은개수
FROM sn_likes;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '초기화 완료!';
    RAISE NOTICE '사용자 정보와 카테고리는 유지되었습니다.';
    RAISE NOTICE '이제 insert_sample_data.sql을 실행할 수 있습니다.';
    RAISE NOTICE '=============================================';
END $$;
