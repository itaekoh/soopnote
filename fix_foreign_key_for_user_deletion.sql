-- ============================================
-- Foreign Key 제약조건 수정: 회원 탈퇴 시 게시글/댓글 익명화
-- ============================================

-- 현재 Foreign Key 제약조건 확인
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'sn_posts' OR tc.table_name = 'sn_comments')
    AND ccu.table_name = 'sn_users';

-- ============================================
-- 1. sn_posts.author_id FK 수정
-- ============================================

-- 기존 FK 제약조건 삭제
ALTER TABLE sn_posts
DROP CONSTRAINT IF EXISTS sn_posts_author_id_fkey;

-- 새로운 FK 제약조건 추가 (ON DELETE SET NULL)
ALTER TABLE sn_posts
ADD CONSTRAINT sn_posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES sn_users(id)
ON DELETE SET NULL;  -- 사용자 삭제 시 author_id를 NULL로 설정

-- ============================================
-- 2. sn_comments.user_id FK 수정 (컬럼명 주의!)
-- ============================================

-- 기존 FK 제약조건 삭제
ALTER TABLE sn_comments
DROP CONSTRAINT IF EXISTS sn_comments_user_id_fkey;

-- 새로운 FK 제약조건 추가 (ON DELETE SET NULL)
ALTER TABLE sn_comments
ADD CONSTRAINT sn_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES sn_users(id)
ON DELETE SET NULL;  -- 사용자 삭제 시 user_id를 NULL로 설정

-- ============================================
-- 3. 컬럼이 NULL 허용하는지 확인
-- ============================================

-- sn_posts.author_id가 NULL 허용하지 않으면 변경
ALTER TABLE sn_posts
ALTER COLUMN author_id DROP NOT NULL;

-- sn_comments.user_id가 NULL 허용하지 않으면 변경
ALTER TABLE sn_comments
ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- 4. 검증
-- ============================================

-- 수정된 FK 제약조건 확인
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'sn_posts' OR tc.table_name = 'sn_comments')
    AND ccu.table_name = 'sn_users';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Foreign Key 제약조건이 수정되었습니다.';
    RAISE NOTICE '회원 탈퇴 시 게시글/댓글이 삭제되지 않고';
    RAISE NOTICE 'author_id만 NULL로 설정됩니다.';
    RAISE NOTICE '=========================================';
END $$;
