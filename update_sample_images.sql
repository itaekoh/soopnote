-- ============================================
-- 예제 게시글에 이미지 URL 추가
-- ============================================

-- Unsplash 무료 이미지 사용
-- 야생화 일지 이미지 업데이트

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'
WHERE title = '산책로에서 만난 작은 봄, 현호색의 연분홍 이야기';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80'
WHERE title = '숲 속에 피어난 하얀 별, 노루귀를 만나다';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
WHERE title = '계곡을 따라 피어난 노란 붓꽃의 향연';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&q=80'
WHERE title = '돌담길 옆 작은 제비꽃의 보랏빛 속삭임';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&q=80'
WHERE title = '이슬 머금은 하늘색 물망초의 아침';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1469259943454-aa100abcaab0?w=800&q=80'
WHERE title = '바람에 흔들리는 하얀 매발톱꽃';

-- 나무진단 이미지 업데이트

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80'
WHERE title = '오래된 느티나무의 새 생명, 가지 톱질 후 빠른 회복의 비결';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
WHERE title = '소나무 재선충병 조기 발견과 긴급 처치 사례';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80'
WHERE title = '벚나무 가지 고사 원인 진단 및 영양 처방';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
WHERE title = '은행나무 뿌리 부패 치료 및 토양 개선 작업';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=800&q=80'
WHERE title = '단풍나무 탄저병 진단과 친환경 방제';

UPDATE sn_posts
SET featured_image_url = 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80'
WHERE title = '회화나무 동공 처리 및 구조 안전성 확보';

-- 결과 확인
SELECT
    title as 제목,
    CASE
        WHEN featured_image_url IS NOT NULL THEN '✓ 있음'
        ELSE '✗ 없음'
    END as 이미지
FROM sn_posts
ORDER BY created_at DESC;

-- 완료 메시지
DO $$
DECLARE
    with_image INTEGER;
    without_image INTEGER;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE featured_image_url IS NOT NULL),
        COUNT(*) FILTER (WHERE featured_image_url IS NULL)
    INTO with_image, without_image
    FROM sn_posts;

    RAISE NOTICE '=============================================';
    RAISE NOTICE '✓ 이미지 URL 업데이트 완료';
    RAISE NOTICE '이미지 있음: % 개', with_image;
    RAISE NOTICE '이미지 없음: % 개', without_image;
    RAISE NOTICE '=============================================';
END $$;
