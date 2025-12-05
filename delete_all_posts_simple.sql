-- ============================================
-- 모든 게시글 삭제 (간단 버전)
-- ============================================

-- 1. 삭제 전 확인
SELECT
    c.name as 카테고리,
    COUNT(p.id) as 게시글수
FROM sn_categories c
LEFT JOIN sn_posts p ON c.id = p.category_id
WHERE c.type = 'menu'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- 전체 게시글 목록
SELECT
    p.id,
    c.name as 카테고리,
    p.title as 제목,
    p.published_date as 날짜
FROM sn_posts p
JOIN sn_categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;

-- 2. 모든 게시글 삭제 (CASCADE로 댓글, 좋아요도 자동 삭제)
DELETE FROM sn_posts;

-- 3. 결과 확인
SELECT
    '삭제 완료! 남은 게시글 수: ' || COUNT(*) as 결과
FROM sn_posts;

-- 4. 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 모든 게시글이 삭제되었습니다.';
    RAISE NOTICE '이제 insert_sample_data.sql을 실행하세요.';
    RAISE NOTICE '=============================================';
END $$;
