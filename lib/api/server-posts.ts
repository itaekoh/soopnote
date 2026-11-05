import { cache } from 'react';
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

/**
 * 글 한 편 (상세 페이지용)
 *
 * 상세 페이지는 제목·설명 같은 메타데이터만 서버에서 만들고, 본문은
 * 브라우저가 열린 뒤에 따로 받아 왔다. 그래서 크롤러가 처음 받는 HTML 에는
 * 본문이 없었다 — 2026-11-05 확인 당시 보이는 텍스트가 273자뿐이었고,
 * 그나마도 헤더와 푸터였다. 검색 노출과 애드센스 심사 모두에 불리하다.
 *
 * cache() 로 감싸서 generateMetadata 와 페이지 본문이 같은 요청 안에서
 * 조회를 한 번만 하게 한다.
 */
export const getPostForPage = cache(async (postId: number): Promise<PostFull | null> => {
  if (!Number.isFinite(postId)) return null;

  try {
    return await withServerTimeout(async (signal) => {
      const { data, error } = await supabase
        .from('sn_posts_full')
        .select('*')
        .eq('id', postId)
        .abortSignal(signal)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 결과 없음
        throw error;
      }
      return data as PostFull;
    });
  } catch (error) {
    console.error(`[post ${postId}] 서버 조회 실패 — 클라이언트에서 다시 시도합니다:`, error);
    return null;
  }
});

/** 메뉴 아래 달린 속성(아카이브의 서브카테고리 등) */
export async function getSubcategoriesServer(categoryId: number): Promise<Category[]> {
  return withServerTimeout(async (signal) => {
    const { data, error } = await supabase
      .from('sn_categories')
      .select('*')
      .eq('parent_id', categoryId)
      .eq('type', 'attribute')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .abortSignal(signal);

    if (error) throw error;
    return (data || []) as Category[];
  });
}

/** 목록 페이지가 서버에서 미리 받아 클라이언트로 넘기는 묶음 */
export type InitialListData = {
  categoryId: number | null;
  posts: PostFull[];
  total: number;
  /** 서브카테고리를 쓰는 페이지(아카이브)만 채워진다 */
  subcategories: Category[];
};

/**
 * 카테고리 + 첫 페이지를 한 번에. 실패해도 페이지는 그린다 —
 * 그 경우 클라이언트가 평소대로 직접 불러오고, 실패하면 오류 UI 가 뜬다.
 */
export async function getInitialListData(
  slug: string,
  limit = 12,
  options: { withSubcategories?: boolean } = {}
): Promise<InitialListData> {
  const empty: InitialListData = { categoryId: null, posts: [], total: 0, subcategories: [] };

  try {
    const category = await getCategoryBySlugServer(slug);
    if (!category) return empty;

    // 카테고리를 알고 나면 글 목록과 서브카테고리는 서로를 기다릴 이유가 없다.
    const [result, subcategories] = await Promise.all([
      getPostsServer({ categoryId: category.id, page: 1, limit }),
      options.withSubcategories ? getSubcategoriesServer(category.id) : Promise.resolve([]),
    ]);

    return {
      categoryId: category.id,
      posts: result.data,
      total: result.total,
      subcategories,
    };
  } catch (error) {
    console.error(`[${slug}] 서버 목록 조회 실패 — 클라이언트에서 다시 시도합니다:`, error);
    return empty;
  }
}

// ── 홈 ──────────────────────────────────────────────────────────────────
export type HomeData = {
  featured: PostFull[];
  wildflower: PostFull[];
  tree: PostFull[];
  logs: PostFull[];
  /** 전부 실패했을 때만 true. 화면에 오류와 다시 시도를 띄운다. */
  allFailed: boolean;
};

const HOME_SLUGS = ['wildflower', 'tree-diagnose', 'logs'] as const;

async function getFeaturedPostsServer(limit: number): Promise<PostFull[]> {
  return withServerTimeout(async (signal) => {
    const { data, error } = await supabase
      .rpc('get_featured_posts', { in_limit: limit })
      .abortSignal(signal);
    if (error) throw error;
    return (data || []) as PostFull[];
  });
}

async function getLatestPostsServer(categoryId: number, limit: number): Promise<PostFull[]> {
  return withServerTimeout(async (signal) => {
    const { data, error } = await supabase
      .rpc('get_latest_posts_by_category', { in_category_id: categoryId, in_limit: limit })
      .abortSignal(signal);
    if (error) throw error;
    return (data || []) as PostFull[];
  });
}

/**
 * 홈에 필요한 네 묶음.
 *
 * 예전에는 브라우저가 요청 7개를 보냈다 — 추천 1개, 그리고 카테고리 세 개를
 * 각각 찾은 뒤(3개) 그 결과로 최신 글을 부르는(3개) 식이었다. 카테고리와
 * 글이 쌍으로 이어져 있어서 한쪽이 늦으면 그 섹션이 통째로 비었다.
 * 11월 5일 로그의 08:49:11 묶음이 정확히 이 7건이다.
 *
 * 세 카테고리를 한 번에 찾고, 나머지는 모두 동시에 부른다.
 */
export async function getHomeData(): Promise<HomeData> {
  const empty: HomeData = {
    featured: [],
    wildflower: [],
    tree: [],
    logs: [],
    allFailed: false,
  };

  let categories: Category[];
  try {
    categories = await withServerTimeout(async (signal) => {
      const { data, error } = await supabase
        .from('sn_categories')
        .select('*')
        .in('slug', HOME_SLUGS as unknown as string[])
        .abortSignal(signal);
      if (error) throw error;
      return (data || []) as Category[];
    });
  } catch (error) {
    console.error('[home] 카테고리 조회 실패:', error);
    return { ...empty, allFailed: true };
  }

  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const latest = (slug: string, limit: number) => {
    const id = idBySlug.get(slug);
    return id === undefined ? Promise.resolve([]) : getLatestPostsServer(id, limit);
  };

  const results = await Promise.allSettled([
    getFeaturedPostsServer(2),
    latest('wildflower', 4),
    latest('tree-diagnose', 4),
    latest('logs', 4),
  ]);

  const take = (i: number, label: string): PostFull[] => {
    const r = results[i];
    if (r.status === 'fulfilled') return r.value;
    console.error(`[home] ${label} 조회 실패:`, r.reason);
    return [];
  };

  return {
    featured: take(0, '추천'),
    wildflower: take(1, '식물 관찰'),
    tree: take(2, '수목 진료'),
    logs: take(3, '아카이브'),
    allFailed: results.every((r) => r.status === 'rejected'),
  };
}
