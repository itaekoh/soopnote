import { createClient } from '@supabase/supabase-js';
import type {
  Category,
  PaginatedResponse,
  PostFull,
  PostSortOption,
} from '@/lib/types/database.types';

/**
 * 목록 화면을 서버에서 그리기 위한 조회 함수들
 *
 * 왜 따로 두는가
 * ─────────────────────────────────────────────────────────────
 * 목록 페이지는 브라우저가 열린 뒤에야 카테고리를 찾고, 그 결과로 다시
 * 게시글을 불러왔다. 네트워크 왕복 두 번이 순서대로 이어지니 둘 중 하나만
 * 흔들려도 화면은 "게시글을 불러오는 중..." 에 머물렀다.
 *
 * 서버에서 미리 받아 HTML 에 실어 보내면 첫 화면에 네트워크가 끼지 않는다.
 * 느린 회선에서도 글 목록은 이미 그려져 있고, 정렬·검색·더 보기만 그때그때
 * 브라우저가 가져온다.
 *
 * 쿠키를 읽지 않는 익명 클라이언트를 쓰는 이유: lib/supabase/server.ts 는
 * cookies() 를 쓰기 때문에 그걸 쓰면 페이지가 매 요청 동적 렌더링이 된다.
 * 공개 목록은 로그인 여부와 무관하므로 익명으로 읽고 ISR 로 캐시한다.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/** 빌드·ISR 중 Supabase 가 응답하지 않을 때 페이지 전체가 막히지 않도록 */
const SERVER_TIMEOUT_MS = 5_000;

async function withServerTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function getCategoryBySlugServer(slug: string): Promise<Category | null> {
  return withServerTimeout(async (signal) => {
    const { data, error } = await supabase
      .from('sn_categories')
      .select('*')
      .eq('slug', slug)
      .abortSignal(signal)
      .single();

    // PGRST116 = 결과 없음. 오류가 아니라 "그런 카테고리가 없다" 는 뜻이다.
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Category;
  });
}

export async function getPostsServer(params: {
  categoryId: number;
  page?: number;
  limit?: number;
  sort?: PostSortOption;
  search?: string;
  subcategoryIds?: number[];
}): Promise<PaginatedResponse<PostFull>> {
  const { categoryId, page = 1, limit = 12, sort = 'latest', search, subcategoryIds } = params;

  return withServerTimeout(async (signal) => {
    const { data, error } = await supabase
      .rpc('get_paginated_posts', {
        in_category_id: categoryId,
        in_subcategory_ids: subcategoryIds ?? null,
        in_author_id: null,
        in_status: 'published',
        in_search: search ?? null,
        in_sort: sort,
        in_page: page,
        in_limit: limit,
      })
      .abortSignal(signal);

    if (error) throw error;

    const rows = (data || []) as PostFull[];
    // get_paginated_posts 는 총 건수를 돌려주지 않는다. 클라이언트 쪽
    // getPosts 와 같은 방식으로 어림한다 (마지막 페이지 판별용).
    const total =
      rows.length < limit ? page * limit - (limit - rows.length) : page * limit + 1;

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  });
}

/** 목록 페이지가 서버에서 미리 받아 클라이언트로 넘기는 묶음 */
export type InitialListData = {
  categoryId: number | null;
  posts: PostFull[];
  total: number;
};

/**
 * 카테고리 + 첫 페이지를 한 번에. 실패해도 페이지는 그린다 —
 * 그 경우 클라이언트가 평소대로 직접 불러오고, 실패하면 오류 UI 가 뜬다.
 */
export async function getInitialListData(
  slug: string,
  limit = 12
): Promise<InitialListData> {
  try {
    const category = await getCategoryBySlugServer(slug);
    if (!category) return { categoryId: null, posts: [], total: 0 };

    const result = await getPostsServer({ categoryId: category.id, page: 1, limit });
    return { categoryId: category.id, posts: result.data, total: result.total };
  } catch (error) {
    console.error(`[${slug}] 서버 목록 조회 실패 — 클라이언트에서 다시 시도합니다:`, error);
    return { categoryId: null, posts: [], total: 0 };
  }
}
