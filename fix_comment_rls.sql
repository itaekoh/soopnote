-- 댓글 테이블 RLS 정책 확인 및 수정
-- 문제: is_deleted를 true로 업데이트할 때 RLS 정책 위반

-- 1. 기존 정책 확인 (참고용)
-- SELECT polname, polcmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'sn_comments';

-- 2. 기존 UPDATE 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can update their own comments" ON sn_comments;
DROP POLICY IF EXISTS "댓글 작성자는 자신의 댓글을 수정할 수 있습니다" ON sn_comments;

-- 3. 새로운 UPDATE 정책 생성
-- USING: 본인의 댓글만 선택 가능
-- WITH CHECK: is_deleted 업데이트를 포함한 모든 업데이트 허용
CREATE POLICY "댓글 작성자는 자신의 댓글을 수정할 수 있습니다"
ON sn_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. SELECT 정책도 확인 및 수정 (삭제된 댓글도 조회 가능하도록)
DROP POLICY IF EXISTS "Anyone can view comments" ON sn_comments;
DROP POLICY IF EXISTS "누구나 댓글을 조회할 수 있습니다" ON sn_comments;

CREATE POLICY "누구나 댓글을 조회할 수 있습니다"
ON sn_comments
FOR SELECT
TO public
USING (true);

-- 5. INSERT 정책 확인
DROP POLICY IF EXISTS "Users can create comments" ON sn_comments;
DROP POLICY IF EXISTS "로그인한 사용자는 댓글을 작성할 수 있습니다" ON sn_comments;

CREATE POLICY "로그인한 사용자는 댓글을 작성할 수 있습니다"
ON sn_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. DELETE 정책 (필요시)
DROP POLICY IF EXISTS "Users can delete their own comments" ON sn_comments;

-- 실제 DELETE는 사용하지 않으므로 정책 불필요
-- (is_deleted 플래그 사용)
