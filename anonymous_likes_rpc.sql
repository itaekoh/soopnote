-- ============================================
-- 익명 사용자 좋아요 RPC 함수
-- ============================================
-- 이 함수들은 익명 사용자가 좋아요를 추가/제거할 수 있도록 합니다.
-- SECURITY DEFINER를 사용하여 RLS를 우회합니다.

-- 좋아요 수 증가 함수
CREATE OR REPLACE FUNCTION increment_anonymous_like_count(p_post_id INTEGER)
RETURNS TABLE (
    success BOOLEAN,
    new_like_count INTEGER,
    message TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_count INTEGER;
    v_new_count INTEGER;
BEGIN
    -- 게시글이 존재하는지 확인
    SELECT like_count INTO v_current_count
    FROM sn_posts
    WHERE id = p_post_id AND status = 'published';

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, '게시글을 찾을 수 없습니다.'::TEXT;
        RETURN;
    END IF;

    -- like_count 증가
    UPDATE sn_posts
    SET like_count = like_count + 1
    WHERE id = p_post_id AND status = 'published'
    RETURNING like_count INTO v_new_count;

    RETURN QUERY SELECT true, v_new_count, '좋아요가 추가되었습니다.'::TEXT;
END;
$$;

-- 좋아요 수 감소 함수
CREATE OR REPLACE FUNCTION decrement_anonymous_like_count(p_post_id INTEGER)
RETURNS TABLE (
    success BOOLEAN,
    new_like_count INTEGER,
    message TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_count INTEGER;
    v_new_count INTEGER;
BEGIN
    -- 게시글이 존재하는지 확인
    SELECT like_count INTO v_current_count
    FROM sn_posts
    WHERE id = p_post_id AND status = 'published';

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, '게시글을 찾을 수 없습니다.'::TEXT;
        RETURN;
    END IF;

    -- like_count 감소 (0 이하로 내려가지 않도록)
    UPDATE sn_posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = p_post_id AND status = 'published'
    RETURNING like_count INTO v_new_count;

    RETURN QUERY SELECT true, v_new_count, '좋아요가 취소되었습니다.'::TEXT;
END;
$$;

-- 함수 사용 권한 부여 (모든 사용자, 익명 포함)
GRANT EXECUTE ON FUNCTION increment_anonymous_like_count(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_anonymous_like_count(INTEGER) TO anon, authenticated;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✓ 익명 사용자 좋아요 RPC 함수가 생성되었습니다!';
    RAISE NOTICE '';
    RAISE NOTICE '생성된 함수:';
    RAISE NOTICE '- increment_anonymous_like_count(post_id)';
    RAISE NOTICE '- decrement_anonymous_like_count(post_id)';
    RAISE NOTICE '';
    RAISE NOTICE '이제 익명 사용자도 좋아요를 추가/제거할 수 있습니다.';
    RAISE NOTICE '===========================================';
END $$;
