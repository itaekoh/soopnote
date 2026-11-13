-- 조회수 원자적 증가 RPC (익명 포함)
--
-- 문제: incrementViewCount 가 브라우저 anon 클라이언트로 sn_posts 를 직접 UPDATE 했는데
--       RLS 가 익명 UPDATE 를 조용히 막아(0행, 에러 없음) 로그인 조회만 집계됐다.
--       또 read-then-write 라 동시 접속 시 레이스로 증가분이 유실됐다.
-- 해결: SECURITY DEFINER 함수로 RLS 를 우회하고, view_count = view_count + 1 로 원자적 증가.
--       published 글만 증가(초안/보관글은 제외). 좋아요의 increment_anonymous_like_count 와 동일 패턴.
--
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요. 한 번만 실행하면 됩니다.

create or replace function public.increment_post_view(p_post_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sn_posts
  set view_count = view_count + 1
  where id = p_post_id and status = 'published';
$$;

-- 익명/로그인 사용자 모두 호출 허용
grant execute on function public.increment_post_view(bigint) to anon, authenticated;
