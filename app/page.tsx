'use client';

import { useState, useEffect } from 'react';
import { Leaf, Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getFeaturedPosts, getLatestPostsByCategory } from '@/lib/api/posts';
import { getCategoryBySlug } from '@/lib/api/categories';
import type { PostFull } from '@/lib/types/database.types';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<PostFull[]>([]);
  const [wildflowerPosts, setWildflowerPosts] = useState<PostFull[]>([]);
  const [treePosts, setTreePosts] = useState<PostFull[]>([]);
  const [logsPosts, setLogsPosts] = useState<PostFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎬 [MAIN] 컴포넌트 마운트됨 - useEffect 실행');

    // 타임아웃 추가: 30초 후에도 로딩 중이면 강제로 로딩 해제
    const loadTimeout = setTimeout(() => {
      console.warn('⚠️ 콘텐츠 로딩 타임아웃 - 기본 상태로 전환');
      setLoading(false);
    }, 30000); // 30초 타임아웃

    loadAllPosts()
      .then(() => {
        console.log('✅ [MAIN] loadAllPosts 완료');
      })
      .catch((error) => {
        console.error('❌ [MAIN] loadAllPosts 에러:', error);
      })
      .finally(() => {
        clearTimeout(loadTimeout);
        console.log('🏁 [MAIN] finally 블록 실행');
      });

    return () => {
      console.log('🔚 [MAIN] 컴포넌트 언마운트 - cleanup');
      clearTimeout(loadTimeout);
    };
  }, []);

  async function loadAllPosts() {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [MAIN] 메인 페이지 로딩 시작');

      // 모든 데이터를 완전 병렬로 로드 (카테고리 ID + 게시글)
      const results = await Promise.allSettled([
        // Featured 게시글
        getFeaturedPosts(2),
        // 카테고리별 슬러그로 직접 조회 + 게시글
        getCategoryBySlug('wildflower').then(cat =>
          cat ? getLatestPostsByCategory(cat.id, 4) : []
        ),
        getCategoryBySlug('tree-diagnose').then(cat =>
          cat ? getLatestPostsByCategory(cat.id, 4) : []
        ),
        getCategoryBySlug('logs').then(cat =>
          cat ? getLatestPostsByCategory(cat.id, 4) : []
        ),
      ]);

      // 결과 처리
      if (results[0].status === 'fulfilled') {
        setFeaturedPosts(results[0].value);
        console.log('✓ [MAIN] Featured 게시글:', results[0].value.length, '개');
      } else {
        console.error('✗ [MAIN] Featured 로딩 실패:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        setWildflowerPosts(results[1].value);
        console.log('✓ [MAIN] 야생화 일지:', results[1].value.length, '개');
      } else {
        console.error('✗ [MAIN] 야생화 일지 로딩 실패:', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        setTreePosts(results[2].value);
        console.log('✓ [MAIN] 나무진단:', results[2].value.length, '개');
      } else {
        console.error('✗ [MAIN] 나무진단 로딩 실패:', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        setLogsPosts(results[3].value);
        console.log('✓ [MAIN] 아카이브:', results[3].value.length, '개');
      } else {
        console.error('✗ [MAIN] 아카이브 로딩 실패:', results[3].reason);
      }

      console.log('✓ [MAIN] 모든 게시글 로딩 완료');

      // 모든 데이터가 비어있는지 체크 (results에서 직접 확인)
      const featuredCount = results[0].status === 'fulfilled' ? results[0].value.length : 0;
      const wildflowerCount = results[1].status === 'fulfilled' ? results[1].value.length : 0;
      const treeCount = results[2].status === 'fulfilled' ? results[2].value.length : 0;
      const logsCount = results[3].status === 'fulfilled' ? results[3].value.length : 0;

      if (featuredCount === 0 && wildflowerCount === 0 && treeCount === 0 && logsCount === 0) {
        console.warn('⚠️ [MAIN] 모든 게시글이 비어있음 - 네트워크나 API 문제 가능성');
        console.warn('⚠️ [MAIN] 결과 상태:', {
          featured: results[0].status,
          wildflower: results[1].status,
          tree: results[2].status,
          logs: results[3].status
        });

        // 모든 요청이 실패했다면 에러 표시
        const allFailed = results.every(r => r.status === 'rejected');
        if (allFailed) {
          console.error('❌ [MAIN] 모든 API 요청 실패!');
          setError('서버와 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
        }
      }

    } catch (error) {
      console.error('✗ [MAIN] 메인 페이지 로딩 실패:', error);
      setError('게시글을 불러오는 중 문제가 발생했습니다. 페이지를 새로고침하거나 캐시를 삭제해주세요.');
    } finally {
      setLoading(false);
      console.log('✓ [MAIN] 로딩 상태 해제');
    }
  }

  // 카테고리별 색상
  const categoryColors = {
    wildflower: {
      bg: 'from-green-50 to-emerald-100',
      badge: 'bg-green-100 text-green-700',
      icon: 'text-green-700',
      link: '/wildflower',
      name: '야생화 일지',
    },
    tree: {
      bg: 'from-amber-50 to-yellow-100',
      badge: 'bg-amber-100 text-amber-700',
      icon: 'text-amber-700',
      link: '/tree-diagnose',
      name: '나무진단',
    },
    logs: {
      bg: 'from-purple-50 to-violet-100',
      badge: 'bg-purple-100 text-purple-700',
      icon: 'text-purple-700',
      link: '/logs',
      name: '아카이브',
    },
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 히어로 섹션 */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6">
            <Leaf className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#26422E] mb-4">
            숲의 기록 — 작은 꽃들, 큰 이야기
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다. 글과 사진, 그리고 생각이 어우러진 이야기.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 py-20 min-h-[400px] text-center text-gray-600">
          콘텐츠를 불러오는 중...
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-red-600 text-lg font-semibold mb-2">
              ⚠️ 오류 발생
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => loadAllPosts()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Featured 게시글 */}
          {featuredPosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <h2 className="text-2xl font-bold text-[#26422E] mb-6">추천 게시글</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredPosts.map((post) => (
                  <Link key={post.id} href={`/${post.category_slug}/${post.id}`}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                      {/* 썸네일 */}
                      {post.featured_image_url ? (
                        <div
                          className="h-64 aspect-[16/9] bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.featured_image_url})` }}
                        />
                      ) : (
                        <div className={`h-64 aspect-[16/9] bg-gradient-to-br ${categoryColors[post.category_slug as keyof typeof categoryColors]?.bg || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
                          <Leaf className="w-20 h-20 text-green-700 opacity-20" />
                        </div>
                      )}

                      {/* 콘텐츠 */}
                      <div className="p-6">
                        <div className={`inline-block px-3 py-1 text-xs rounded-full ${categoryColors[post.category_slug as keyof typeof categoryColors]?.badge || 'bg-gray-100 text-gray-700'} font-medium mb-3`}>
                          {post.category_name}
                        </div>
                        <h3 className="font-bold text-xl text-[#26422E] mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>

                        {/* 메타 정보 */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
                          <div>읽음 {post.view_count}</div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 야생화 일지 */}
          {wildflowerPosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#26422E]">🌸 야생화 일지</h2>
                <Link href="/wildflower" className="flex items-center gap-1 text-sm text-green-700 hover:underline">
                  더보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wildflowerPosts.map((post) => (
                  <PostCard key={post.id} post={post} colors={categoryColors.wildflower} />
                ))}
              </div>
            </section>
          )}

          {/* 나무진단 */}
          {treePosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#26422E]">🌳 나무진단</h2>
                <Link href="/tree-diagnose" className="flex items-center gap-1 text-sm text-amber-700 hover:underline">
                  더보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {treePosts.map((post) => (
                  <PostCard key={post.id} post={post} colors={categoryColors.tree} />
                ))}
              </div>
            </section>
          )}

          {/* 아카이브 */}
          {logsPosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#26422E]">✍️ 아카이브</h2>
                <Link href="/logs" className="flex items-center gap-1 text-sm text-purple-700 hover:underline">
                  더보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {logsPosts.map((post) => (
                  <PostCard key={post.id} post={post} colors={categoryColors.logs} />
                ))}
              </div>
            </section>
          )}

          {/* 게시글이 없을 때 */}
          {featuredPosts.length === 0 && wildflowerPosts.length === 0 && treePosts.length === 0 && logsPosts.length === 0 && (
            <section className="max-w-6xl mx-auto px-6 py-20 text-center">
              <div className="text-gray-600 mb-4">아직 게시글이 없습니다.</div>
              <p className="text-sm text-gray-500">첫 번째 기록을 작성해보세요!</p>
            </section>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}

// 게시글 카드 컴포넌트
function PostCard({ post, colors }: { post: PostFull; colors: { bg: string; badge: string; icon: string; link: string; name: string } }) {
  return (
    <Link href={`${colors.link}/${post.id}`}>
      <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer h-full">
        {/* 썸네일 */}
        {post.featured_image_url ? (
          <div
            className="h-40 aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: `url(${post.featured_image_url})` }}
          />
        ) : (
          <div className={`h-40 aspect-[4/3] bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
            <Leaf className={`w-12 h-12 ${colors.icon} opacity-30`} />
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-4">
          <h3 className="font-semibold text-base text-[#26422E] mb-2 line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {post.excerpt}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{post.published_date}</span>
            </div>
            <div>읽음 {post.view_count}</div>
          </div>
        </div>
      </article>
    </Link>
  );
}
