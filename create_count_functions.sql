-- 게시글 카운트 증감 함수 생성
-- 댓글 수, 좋아요 수, 조회 수 증감을 위한 RPC 함수

-- 1. 댓글 수 증가
CREATE OR REPLACE FUNCTION increment_comment_count(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE sn_posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 댓글 수 감소
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE sn_posts
  SET comment_count = GREATEST(comment_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 좋아요 수 증가
CREATE OR REPLACE FUNCTION increment_like_count(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE sn_posts
  SET like_count = like_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 좋아요 수 감소
CREATE OR REPLACE FUNCTION decrement_like_count(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE sn_posts
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 조회 수 증가 (기존에 있을 수 있지만 재생성)
CREATE OR REPLACE FUNCTION increment_view_count(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE sn_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION increment_comment_count(bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_comment_count(bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_like_count(bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_like_count(bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_view_count(bigint) TO authenticated, anon;
