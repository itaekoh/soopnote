-- 좋아요 카운트 트리거 수정 (SECURITY DEFINER 추가)
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER
SECURITY DEFINER  -- RLS를 우회하여 실행
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sn_posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE sn_posts
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 기존 데이터 동기화: sn_posts의 like_count를 실제 sn_likes 개수로 업데이트
UPDATE sn_posts
SET like_count = (
    SELECT COUNT(*)
    FROM sn_likes
    WHERE sn_likes.post_id = sn_posts.id
);
