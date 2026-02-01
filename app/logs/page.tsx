'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { getCategoryBySlug, getCategoryAttributesGrouped } from '@/lib/api/categories';
import { getPosts } from '@/lib/api/posts';
import type { PostFull, PostSortOption, Category } from '@/lib/types/database.types';

export default function LogsList() {
  const [posts, setPosts] = useState<PostFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<PostSortOption>('latest');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const POSTS_PER_PAGE = 12;

  useEffect(() => {
    console.log('🔄 [STATE] loading:', loading, 'posts.length:', posts.length);
  }, [loading, posts]);

  // 서브카테고리 로드
  useEffect(() => {
    loadSubCategories();
  }, []);

  async function loadSubCategories() {
    try {
      const grouped = await getCategoryAttributesGrouped('logs');
      // 'subcategory' 그룹의 카테고리들 가져오기
      const subcategoryList = grouped['subcategory'] || [];
      setSubCategories(subcategoryList);
      console.log('✓ 서브카테고리 로드 완료:', subcategoryList.length, '개');
    } catch (error) {
      console.error('✗ 서브카테고리 로드 실패:', error);
    }
  }

  // sortBy, searchQuery 또는 selectedSubcategoryIds 변경 시 page를 1로 리셋
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [sortBy, searchQuery, selectedSubcategoryIds]);

  // 데이터 로드
  useEffect(() => {
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

        console.log(`=== 아카이브 로딩 (페이지 ${page}) ===`);

        const category = await getCategoryBySlug('logs');

        if (!category) {
          console.error('✗ 카테고리를 찾을 수 없습니다.');
          if (!cancelled) {
            setLoading(false);
            setLoadingMore(false);
          }
          return;
        }

        const result = await getPosts({
          category_id: category.id,
          status: 'published',
          page: page,
          limit: POSTS_PER_PAGE,
          sort: sortBy,
          search: searchQuery || undefined,
          subcategory_ids: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
        });

        if (!cancelled) {
          if (isInitialLoad) {
            setPosts(result.data);
          } else {
            setPosts(prev => [...prev, ...result.data]);
          }
          setTotalCount(result.total);
          console.log('✓ 로딩 완료:', result.data.length, '개 (총', result.total, '개)');
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
  }, [sortBy, page, searchQuery, selectedSubcategoryIds]);

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
      'from-slate-100 via-gray-100 to-green-100',
      'from-orange-100 via-red-100 to-purple-100',
      'from-green-100 via-lime-100 to-yellow-100',
      'from-teal-100 via-cyan-100 to-sky-100',
      'from-lime-100 via-green-100 to-emerald-100',
      'from-blue-100 via-indigo-100 to-purple-100',
    ];

    return {
      type: 'gradient' as const,
      value: gradients[index % gradients.length],
    };
  };

  // 이모지 배열
  const emojis = ['📝', '🌍', '🌳', '💚', '🌱', '✨', '📚', '🍃', '🌿', '💭'];

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 서브카테고리 토글
  const toggleSubcategory = (categoryId: number) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 전체 선택 (필터 초기화)
  const clearSubcategoryFilter = () => {
    setSelectedSubcategoryIds([]);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 페이지 헤더 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
            <BookOpen className="w-8 h-8 text-purple-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-4">아카이브</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            기술, AI, 실무 팁과 다양한 생각들을 기록합니다.
          </p>
        </div>

        {/* 검색바 */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="아카이브 제목이나 내용으로 검색..."
          />
        </div>

        {/* 서브카테고리 필터 */}
        {subCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={clearSubcategoryFilter}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedSubcategoryIds.length === 0
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {subCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleSubcategory(category.id)}
                  className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                    selectedSubcategoryIds.includes(category.id)
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-purple-700">{totalCount}</span>개의 아카이브
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                sortBy === 'latest'
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                sortBy === 'popular'
                  ? 'bg-purple-700 text-white'
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
            <div className="text-gray-600 mb-4">아직 아카이브가 없습니다.</div>
            <p className="text-sm text-gray-500">첫 번째 아카이브를 작성해보세요!</p>
          </div>
        )}

        {/* 게시물 목록 */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => {
              const background = getPostBackground(post, index);
              const emoji = emojis[index % emojis.length];

              return (
                <Link key={post.id} href={`/logs/${post.id}`}>
                  <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                    {/* 썸네일 */}
                    {background.type === 'image' ? (
                      <div
                        className="h-48 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${background.value})` }}
                      >
                        {post.read_time && (
                          <div className="absolute top-3 right-3 px-3 py-1 text-xs rounded-full font-medium bg-white/80 backdrop-blur-sm text-gray-700">
                            {post.read_time} 읽기
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`h-48 bg-gradient-to-br ${background.value} flex items-center justify-center relative`}>
                        <div className="text-center">
                          <div className="text-6xl mb-2">{emoji}</div>
                        </div>
                        {post.read_time && (
                          <div className="absolute top-3 right-3 px-3 py-1 text-xs rounded-full font-medium bg-white/80 backdrop-blur-sm text-gray-700">
                            {post.read_time} 읽기
                          </div>
                        )}
                      </div>
                    )}

                    {/* 콘텐츠 */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-[#26422E] mb-2 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{post.published_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.view_count}</span>
                        </div>
                      </div>
                    </div>

                    {/* 하단 태그 */}
                    <div className="px-5 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {post.subcategory_names && post.subcategory_names.length > 0 ? (
                          post.subcategory_names.map((name, idx) => (
                            <div
                              key={idx}
                              className="inline-block px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 font-medium"
                            >
                              {name}
                            </div>
                          ))
                        ) : (
                          <div className="inline-block px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 font-medium">
                            아카이브
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* 더보기 버튼 */}
        {!loading && posts.length > 0 && totalCount > posts.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loadingMore}
              className="px-8 py-3 rounded-lg bg-white border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
                  로딩 중...
                </>
              ) : (
                <>더 많은 아카이브 보기 ({posts.length} / {totalCount})</>
              )}
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
