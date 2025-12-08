-- ============================================
-- 테이블 구조 확인
-- ============================================

-- sn_posts 테이블의 컬럼 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sn_posts'
ORDER BY ordinal_position;

-- sn_comments 테이블의 컬럼 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sn_comments'
ORDER BY ordinal_position;

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
    AND (tc.table_name = 'sn_posts' OR tc.table_name = 'sn_comments');
