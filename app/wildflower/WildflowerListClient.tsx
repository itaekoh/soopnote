'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Leaf, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { getCategoryBySlug } from '@/lib/api/categories';
import { getPosts } from '@/lib/api/posts';
import type { InitialListData } from '@/lib/api/server-posts';
import type { PostFull, PostSortOption } from '@/lib/types/database.types';

export function WildflowerListClient({ initial }: { initial: InitialListData }) {
  // 서버가 카테고리와 1페이지를 이미 받아 왔다. 그 경우 첫 화면은 네트워크
  // 없이 바로 그려지고, 아래 effect 의 첫 실행은 건너뛴다.
  const hasServerData = initial.categoryId !== null;

  const [posts, setPosts] = useState<PostFull[]>(initial.posts);
  const [loading, setLoading] = useState(!hasServerData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(initial.total);
  const [sortBy, setSortBy] = useState<PostSortOption>('latest');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  // '다시 시도' 전용 카운터. 예전에는 버튼이 setPage(1) 만 불렀는데, 실패는
  // 애초에 1페이지에서 나므로 값이 그대로라 effect 가 다시 돌지 않았다.
  // 오류만 지워지고 재요청은 없어서 "기록이 없습니다" 가 뜨곤 했다.
  const [reloadKey, setReloadKey] = useState(0);
  const POSTS_PER_PAGE = 12;

  const isFirstRender = useRef(true);
  // 서버가 카테고리를 찾아 줬으면 브라우저는 그 왕복을 건너뛴다.
  // 실패했을 때만 한 번 직접 찾고, 그 뒤로는 여기 담아 재사용한다.
  const categoryIdRef = useRef<number | null>(initial.categoryId);

  // sortBy 또는 searchQuery 변경 시 page를 1로 리셋
  useEffect(() => {
    // 첫 렌더에서는 서버가 준 목록을 지우면 안 된다.
    if (isFirstRender.current) return;
    setPage(1);
    setPosts([]);
  }, [sortBy, searchQuery]);

  // 데이터 로드
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // 서버가 이미 1페이지를 그려 줬으므로 같은 걸 또 부르지 않는다.
      if (hasServerData) return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const isInitialLoad = page === 1;
        if (isInitialLoad) {
          setLoading(true);
          setError(null); // 에러 초기화
        } else {
          setLoadingMore(true);
        }

        let categoryId = categoryIdRef.current;
        if (categoryId === null) {
          const category = await getCategoryBySlug('wildflower');
          if (!category) {
            console.error('✗ 카테고리를 찾을 수 없습니다.');
            if (!cancelled) {
              setLoading(false);
              setLoadingMore(false);
            }
            return;
          }
          categoryId = category.id;
          categoryIdRef.current = categoryId;
        }

        const result = await getPosts({
          category_id: categoryId,
          status: 'published',
          page: page,
          limit: POSTS_PER_PAGE,
          sort: sortBy,
          search: searchQuery || undefined,
        });

        if (!cancelled) {
          if (isInitialLoad) {
            setPosts(result.data);
          } else {
            setPosts(prev => [...prev, ...result.data]);
          }
          setTotalCount(result.total);
        }
      } catch (error: any) {
        console.error('✗ 게시글 로딩 실패:', error);
        if (!cancelled && page === 1) {
          setError(`게시글을 불러오는데 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [sortBy, page, searchQuery, reloadKey, hasServerData]);

  // 이미지가 있으면 이미지, 없으면 그라데이션 사용
  const getPostBackground = (post: PostFull, index: number) => {
    if (post.featured_image_url) {
      return {
        type: 'image' as const,
        value: post.featured_image_url,
      };
    }

    // 그라데이션 색상 배열
    const gradients = [
      'from-pink-100 via-purple-100 to-green-100',
      'from-blue-100 via-white to-green-100',
      'from-yellow-100 via-amber-100 to-green-100',
      'from-purple-100 via-violet-100 to-green-100',
      'from-sky-100 via-blue-100 to-green-100',
      'from-gray-100 via-slate-100 to-green-100',
    ];

    return {
      type: 'gradient' as const,
      value: gradients[index % gradients.length],
    };
  };

  // 이모지 배열
  const emojis = ['🌸', '⭐', '🌼', '💜', '💙', '🤍', '🌺', '🌻', '🌷', '🌹'];

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 페이지 헤더 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
            <Leaf className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-4">식물 관찰</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자연 속에서 발견한 식물들의 이야기. 계절의 변화와 함께하는 관찰 기록입니다.
          </p>
        </div>

        {/* 검색바 */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="야생화 이름이나 관찰 내용으로 검색..."
          />
        </div>

        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-green-700">{totalCount}</span>개의 기록
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                sortBy === 'latest'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                sortBy === 'popular'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              인기순
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-gray-600">게시글을 불러오는 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-semibold mb-2">
                ⚠️ 오류 발생
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  setPage(1);
                  setPosts([]);
                  setError(null);
                  setReloadKey((k) => k + 1);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 게시물 없음 */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-600 mb-4">아직 게시글이 없습니다.</div>
            <p className="text-sm text-gray-500">첫 번째 식물 관찰 기록을 작성해보세요!</p>
          </div>
        )}

        {/* 게시물 목록 */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => {
              const background = getPostBackground(post, index);
              const emoji = emojis[index % emojis.length];

              return (
                <Link key={post.id} href={`/wildflower/${post.id}`}>
                  <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                    {/* 썸네일 */}
                    {background.type === 'image' ? (
                      <div className="relative h-48">
                        <Image
                          src={background.value}
                          alt={post.title}
                          fill
                          // 카드는 모바일 1열, 태블릿 2열, 데스크톱 3열이다.
                          // 이 값으로 Next 가 화면에 맞는 크기만 내준다.
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center"
                          // 첫 화면 바로 위 카드만 먼저 받고 나머지는 미룬다.
                          loading={index < 3 ? 'eager' : 'lazy'}
                        />
                      </div>
                    ) : (
                      <div className={`h-48 w-full bg-gradient-to-br ${background.value} flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-6xl mb-2">{emoji}</div>
                        </div>
                      </div>
                    )}

                    {/* 콘텐츠 */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-[#26422E] mb-2 line-clamp-1 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{post.published_date}</span>
                          </div>
                          {post.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{post.location.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>
                        <div>읽음 {post.view_count}</div>
                      </div>
                    </div>

                    {/* 하단 태그 */}
                    <div className="px-5 pb-4">
                      <div className="inline-block px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 font-medium">
                        식물 관찰
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* 더보기 버튼 */}
        {!loading && !error && posts.length > 0 && totalCount > posts.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loadingMore}
              className="px-8 py-3 rounded-lg bg-white border-2 border-green-700 text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                  로딩 중...
                </>
              ) : (
                <>더 많은 기록 보기 ({posts.length} / {totalCount})</>
              )}
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
