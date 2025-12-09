-- 첨부파일이 있는 게시글 확인
SELECT 
  id,
  title,
  attachment_url,
  attachment_name,
  attachment_size,
  attachment_type,
  created_at
FROM sn_posts
WHERE attachment_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
