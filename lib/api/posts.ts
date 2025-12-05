// ============================================
// Posts API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import type {
  Post,
  PostFull,
  CreatePostRequest,
  UpdatePostRequest,
  PostFilterParams,
  PaginatedResponse,
} from '@/lib/types/database.types';

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
 * 게시글 목록 조회 (필터링 및 페이지네이션)
 */
export async function getPosts(
  filters: PostFilterParams = {}
): Promise<PaginatedResponse<PostFull>> {
  const {
    page = 1,
    limit = 10,
    category_id,
    subcategory_ids,
    status = 'published',
    search,
    author_id,
  } = filters;

  let query = supabase
    .from('sn_posts_full')
    .select('*', { count: 'exact' })
    .eq('status', status);

  // 필터 적용
  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  if (author_id) {
    query = query.eq('author_id', author_id);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  // 서브카테고리 필터 (배열 포함 여부 체크)
  if (subcategory_ids && subcategory_ids.length > 0) {
    query = query.contains('subcategory_ids', subcategory_ids);
  }

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('published_date', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * 카테고리별 최신 게시글 조회
 */
export async function getLatestPostsByCategory(
  categoryId: number,
  limit: number = 5
): Promise<PostFull[]> {
  const { data, error } = await supabase
    .from('sn_posts_full')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest posts:', error);
    throw error;
  }

  return data || [];
}

/**
 * 추천 게시글 조회 (is_featured = true)
 */
export async function getFeaturedPosts(limit: number = 5): Promise<PostFull[]> {
  const { data, error } = await supabase
    .from('sn_posts_full')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured posts:', error);
    throw error;
  }

  return data || [];
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(postId: number): Promise<void> {
  const { error } = await supabase.rpc('increment', {
    table_name: 'sn_posts',
    row_id: postId,
    column_name: 'view_count',
  });

  if (error) {
    // rpc 함수가 없을 수 있으므로 직접 업데이트
    const post = await getPostById(postId);
    if (post) {
      await supabase
        .from('sn_posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', postId);
    }
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
