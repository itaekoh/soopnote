// ============================================
// Posts API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import { withRetryAndTimeout } from '@/lib/utils/retry';
import type {
  Post,
  PostFull,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilterParams,
  PaginatedResponse,
} from '@/lib/types/database.types';
import { getCategoriesByParent } from './categories';

/**
 * 게시글 slug 생성 (제목 -> URL 친화적 문자열)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100) + '-' + Date.now();
}

/**
 * 게시글 생성
 */
export async function createPost(
  postData: CreatePostRequest,
  authorId: string
): Promise<Post> {
  const slug = generateSlug(postData.title);

  // 1. 게시글 생성
  const { data: post, error: postError } = await supabase
    .from('sn_posts')
    .insert({
      author_id: authorId,
      category_id: postData.category_id,
      title: postData.title,
      slug: slug,
      excerpt: postData.excerpt,
      content: postData.content,
      published_date: postData.published_date,
      location: postData.location,
      read_time: postData.read_time,
      featured_image_url: postData.featured_image_url,
      attachment_url: postData.attachment_url,
      attachment_name: postData.attachment_name,
      attachment_size: postData.attachment_size,
      attachment_type: postData.attachment_type,
      status: postData.status || 'draft',
      published_at: postData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (postError) {
    console.error('Error creating post:', postError);
    throw postError;
  }

  // 2. 서브카테고리 연결
  if (postData.subcategory_ids && postData.subcategory_ids.length > 0) {
    const mappings = postData.subcategory_ids.map((catId) => ({
      post_id: post.id,
      category_id: catId,
    }));

    const { error: mappingError } = await supabase
      .from('sn_post_categories')
      .insert(mappings);

    if (mappingError) {
      console.error('Error creating post-category mappings:', mappingError);
      // 게시글은 이미 생성되었으므로 경고만 출력
    }
  }

  return post;
}

/**
 * 게시글 업데이트
 */
export async function updatePost(postData: UpdatePostRequest): Promise<Post> {
  const { id, subcategory_ids, ...updateFields } = postData;

  // 1. 게시글 업데이트
  const { data: post, error: postError } = await supabase
    .from('sn_posts')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (postError) {
    console.error('Error updating post:', postError);
    throw postError;
  }

  // 2. 서브카테고리 업데이트 (선택적)
  if (subcategory_ids !== undefined) {
    // 기존 매핑 삭제
    await supabase.from('sn_post_categories').delete().eq('post_id', id);

    // 새 매핑 추가
    if (subcategory_ids.length > 0) {
      const mappings = subcategory_ids.map((catId) => ({
        post_id: id,
        category_id: catId,
      }));

      const { error: mappingError } = await supabase
        .from('sn_post_categories')
        .insert(mappings);

      if (mappingError) {
        console.error('Error updating post-category mappings:', mappingError);
      }
    }
  }

  return post;
}

/**
 * 게시글 삭제
 */
export async function deletePost(postId: number): Promise<void> {
  const { error } = await supabase.from('sn_posts').delete().eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/**
 * 게시글 ID로 조회
 */
export async function getPostById(postId: number): Promise<Post | null> {
  const { data, error } = await supabase
    .from('sn_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching post:', error);
    throw error;
  }

  return data;
}

/**
 * 게시글 slug로 조회
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('sn_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching post by slug:', error);
    throw error;
  }

  return data;
}

/**
 * 게시글 전체 정보 조회 (작성자, 카테고리 포함)
 */
export async function getPostFullById(postId: number): Promise<PostFull | null> {
  const { data, error } = await supabase
    .from('sn_posts_full')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching post full:', error);
    throw error;
  }

  return data;
}

/**
 * 게시글 목록 조회 (RPC 함수 사용)
 */
export async function getPosts(
  filters: PostFilterParams = {}
): Promise<PaginatedResponse<PostFull>> {
  return withRetryAndTimeout(
    async (signal) => {
      const {
        page = 1,
        limit = 10,
        category_id,
        subcategory_ids,
        status = 'published',
        search,
        author_id,
        sort = 'latest',
      } = filters;

      // ✅ 수정: category_id와 subcategory_ids를 별도로 처리
      // - category_id만 있으면: 해당 카테고리의 모든 게시물 조회
      // - subcategory_ids가 있으면: 해당 서브카테고리만 필터링
      const finalSubcategoryIds = subcategory_ids;
      const finalCategoryId = category_id;

      const { data, error } = await supabase
        .rpc('get_paginated_posts', {
          in_category_id: finalCategoryId,
          in_subcategory_ids: finalSubcategoryIds,
          in_author_id: author_id,
          in_status: status,
          in_search: search,
          in_sort: sort,
          in_page: page,
          in_limit: limit,
        })
        .abortSignal(signal);

      if (error) {
        console.error('Error fetching posts via RPC:', error);
        throw error;
      }

      // RPC 결과가 null일 경우, 또는 데이터가 없을 경우를 대비해 빈 배열로 초기화
      const responseData = data || [];

      // ⚠️ 중요: get_paginated_posts는 total_count를 반환하지 않음
      // 별도로 get_posts_count를 호출해야 함 (TODO: 추후 개선)
      // 임시 방편: 데이터가 limit보다 적으면 마지막 페이지로 간주
      const totalCount = responseData.length < limit ? page * limit - (limit - responseData.length) : page * limit + 1;

      return {
        data: responseData as PostFull[],
        total: totalCount, // 정확하지 않음 - 추후 get_posts_count 호출 필요
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    },
    // maxRetries·delay·timeoutMs 는 lib/utils/retry.ts 의 기본값을 쓴다.
    // (8초 타임아웃 + 1회 재시도 = 최악 17초)
  );
}


/**
 * 카테고리별 최신 게시글 조회 (RPC 사용)
 */
export async function getLatestPostsByCategory(
  categoryId: number,
  limit: number = 5
): Promise<PostFull[]> {
  return withRetryAndTimeout(
    async (signal) => {
      const { data, error } = await supabase
        .rpc('get_latest_posts_by_category', {
          in_category_id: categoryId,
          in_limit: limit,
        })
        .abortSignal(signal);

      if (error) {
        console.error('Error fetching latest posts via RPC:', error);
        throw error;
      }

      return data || [];
    },
    // maxRetries·delay·timeoutMs 는 lib/utils/retry.ts 의 기본값을 쓴다.
    // (8초 타임아웃 + 1회 재시도 = 최악 17초)
  );
}

/**
 * 추천 게시글 조회 (is_featured = true, RPC 사용)
 */
export async function getFeaturedPosts(limit: number = 5): Promise<PostFull[]> {
  return withRetryAndTimeout(
    async (signal) => {
      const { data, error } = await supabase
        .rpc('get_featured_posts', {
          in_limit: limit,
        })
        .abortSignal(signal);

      if (error) {
        console.error('Error fetching featured posts via RPC:', error);
        throw error;
      }

      return data || [];
    },
    // maxRetries·delay·timeoutMs 는 lib/utils/retry.ts 의 기본값을 쓴다.
    // (8초 타임아웃 + 1회 재시도 = 최악 17초)
  );
}

/**
 * 조회수 증가
 */
const VIEW_LOG_KEY = 'post_view_log';
const VIEW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24시간

export async function incrementViewCount(postId: number): Promise<number | null> {
  try {
    // 24시간당 1회만 집계 (회원·게스트 동일).
    // 같은 브라우저에서 새로고침/연속 재방문은 중복 집계하지 않고, 24시간이 지나
    // 다시 오면 1회 더 집계한다('일 방문' 성격). localStorage 에 글별 마지막
    // 집계 시각을 기록한다. 조회수는 보안 대상이 아니라 클라이언트 중복방지로 충분하다.
    //
    // ★ 반환값은 '집계 여부와 무관하게' 언제나 현재 DB 조회수다.
    //   상세 페이지는 5분 ISR 캐시라 서버가 넘기는 view_count 가 얼어붙어, 화면이
    //   실제 DB 값보다 뒤처져 보인다(예: 화면 45 vs DB 52). 그래서 집계하지 않는
    //   방문에서도 현재 값을 읽어와 돌려주고, 클라이언트가 그 값으로 화면을 갱신해
    //   항상 진짜 숫자를 보여주게 한다.
    const hasWindow = typeof window !== 'undefined';
    const now = Date.now();

    let deduped = false;
    if (hasWindow) {
      let last: unknown;
      try {
        const raw = JSON.parse(localStorage.getItem(VIEW_LOG_KEY) || '{}');
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) last = raw[String(postId)];
      } catch {}
      if (typeof last === 'number' && now - last < VIEW_WINDOW_MS) {
        deduped = true; // 24시간 내 재방문 → 집계하지 않음(화면 표시는 아래에서 현재값으로)
      }
    }

    if (!deduped) {
      // 원자적 증가 (SECURITY DEFINER RPC → RLS 우회). 증가된 최신 조회수를 반환.
      //   예전 read-then-write 는 ① 익명 UPDATE 가 RLS 에 막혀 로그인 조회만 집계되고
      //   ② 동시 접속 레이스로 유실됐다. RPC 는 published 글만 원자적 증가.
      const { data, error } = await supabase.rpc('increment_post_view', { p_post_id: postId });
      if (!error && typeof data === 'number') {
        // 증가가 실제로 일어난 뒤에만 집계 시각 기록(실패 시 다음 방문에 재시도되도록).
        if (hasWindow) {
          try {
            const raw = JSON.parse(localStorage.getItem(VIEW_LOG_KEY) || '{}');
            const log = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
            log[String(postId)] = now;
            localStorage.setItem(VIEW_LOG_KEY, JSON.stringify(log));
          } catch {}
        }
        return data; // 증가된 최신값
      }
      if (error) console.error('조회수 증가 실패:', error.message);
      // 에러 시엔 아래 현재값 읽기로 폴백
    }

    // 집계하지 않는 방문(또는 증가 실패) → 현재 DB 조회수를 읽어와 화면이 진짜 값을 보이게 한다.
    const { data: row } = await supabase
      .from('sn_posts_full')
      .select('view_count')
      .eq('id', postId)
      .maybeSingle();
    return row && typeof row.view_count === 'number' ? row.view_count : null;
  } catch (error) {
    console.error('조회수 증가 중 오류:', error);
    return null;
  }
}

/**
 * 게시글 상태 변경
 */
export async function updatePostStatus(
  postId: number,
  status: 'draft' | 'published' | 'archived'
): Promise<Post> {
  const updateData: any = { status };

  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('sn_posts')
    .update(updateData)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post status:', error);
    throw error;
  }

  return data;
}
