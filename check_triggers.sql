-- 댓글/좋아요 관련 트리거 확인
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('sn_comments', 'sn_likes')
ORDER BY event_object_table, trigger_name;

-- 트리거가 있다면 삭제 (카운트 증가가 중복되는 경우)
-- DROP TRIGGER IF EXISTS trigger_increment_comment_count ON sn_comments;
-- DROP TRIGGER IF EXISTS trigger_decrement_comment_count ON sn_comments;
-- DROP TRIGGER IF EXISTS trigger_increment_like_count ON sn_likes;
-- DROP TRIGGER IF EXISTS trigger_decrement_like_count ON sn_likes;
