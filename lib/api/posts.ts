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
    async () => {
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

      const { data, error } = await supabase.rpc('get_paginated_posts', {
        in_category_id: finalCategoryId,
        in_subcategory_ids: finalSubcategoryIds,
        in_author_id: author_id,
        in_status: status,
        in_search: search,
        in_sort: sort,
        in_page: page,
        in_limit: limit,
      });

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
    {
      maxRetries: 3,
      delay: 1000,
      timeoutMs: 5000, // 타임아웃 단축 (기존 무제한 -> 5초)
    }
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
    async () => {
      const { data, error } = await supabase.rpc('get_latest_posts_by_category', {
        in_category_id: categoryId,
        in_limit: limit,
      });

      if (error) {
        console.error('Error fetching latest posts via RPC:', error);
        throw error;
      }

      return data || [];
    },
    {
      maxRetries: 3,
      delay: 1000,
      timeoutMs: 5000, // 타임아웃 단축 (18초 -> 5초)
    }
  );
}

/**
 * 추천 게시글 조회 (is_featured = true, RPC 사용)
 */
export async function getFeaturedPosts(limit: number = 5): Promise<PostFull[]> {
  return withRetryAndTimeout(
    async () => {
      const { data, error } = await supabase.rpc('get_featured_posts', {
        in_limit: limit,
      });

      if (error) {
        console.error('Error fetching featured posts via RPC:', error);
        throw error;
      }

      return data || [];
    },
    {
      maxRetries: 3,
      delay: 1000,
      timeoutMs: 5000, // 타임아웃 단축 (18초 -> 5초)
    }
  );
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(postId: number): Promise<void> {
  try {
    // 현재 게시글 조회
    const post = await getPostById(postId);
    if (post) {
      // 조회수 1 증가
      await supabase
        .from('sn_posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', postId);
    }
  } catch (error) {
    console.error('조회수 증가 중 오류:', error);
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
