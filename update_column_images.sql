-- ============================================
-- 칼럼 게시글에 이미지 URL 추가
-- ============================================

-- 칼럼 게시글에 Unsplash 무료 이미지 추가

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80'
WHERE title = '도심 속 작은 숲이 우리에게 주는 것들';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80'
WHERE title = '나무의사, 그들은 무엇을 하는 사람들인가';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800&q=80'
WHERE title = '가로수가 겪는 보이지 않는 고통들';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80'
WHERE title = '소나무재선충병, 우리 숲을 위협하는 보이지 않는 적';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80'
WHERE title = '기후변화 시대, 나무는 어떻게 적응하고 있을까';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
WHERE title = '나무와 더불어 사는 삶의 기술';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 칼럼 이미지 URL 업데이트 완료';
    RAISE NOTICE '=============================================';
END $$;
