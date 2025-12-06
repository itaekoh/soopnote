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
  const [columnPosts, setColumnPosts] = useState<PostFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPosts();
  }, []);

  async function loadAllPosts() {
    try {
      setLoading(true);
      console.log('🔄 [MAIN] 메인 페이지 로딩 시작');

      // Featured 게시글 (2개) - 실패해도 계속 진행
      try {
        const featured = await getFeaturedPosts(2);
        setFeaturedPosts(featured);
        console.log('✓ [MAIN] Featured 게시글:', featured.length, '개');
      } catch (error) {
        console.error('✗ [MAIN] Featured 로딩 실패:', error);
      }

      // 카테고리 ID 조회
      const wildflowerCat = await getCategoryBySlug('wildflower');
      const treeCat = await getCategoryBySlug('tree-diagnose');
      const columnCat = await getCategoryBySlug('column');
      console.log('✓ [MAIN] 카테고리 조회 완료');

      // 각 카테고리별 최신글 4개 - 병렬 처리 및 개별 에러 처리
      const promises = [];

      if (wildflowerCat) {
        promises.push(
          getLatestPostsByCategory(wildflowerCat.id, 4)
            .then((posts) => {
              setWildflowerPosts(posts);
              console.log('✓ [MAIN] 야생화 일지:', posts.length, '개');
            })
            .catch((error) => console.error('✗ [MAIN] 야생화 일지 로딩 실패:', error))
        );
      }

      if (treeCat) {
        promises.push(
          getLatestPostsByCategory(treeCat.id, 4)
            .then((posts) => {
              setTreePosts(posts);
              console.log('✓ [MAIN] 나무진단:', posts.length, '개');
            })
            .catch((error) => console.error('✗ [MAIN] 나무진단 로딩 실패:', error))
        );
      }

      if (columnCat) {
        promises.push(
          getLatestPostsByCategory(columnCat.id, 4)
            .then((posts) => {
              setColumnPosts(posts);
              console.log('✓ [MAIN] 칼럼:', posts.length, '개');
            })
            .catch((error) => console.error('✗ [MAIN] 칼럼 로딩 실패:', error))
        );
      }

      await Promise.allSettled(promises);
      console.log('✓ [MAIN] 모든 게시글 로딩 완료');

    } catch (error) {
      console.error('✗ [MAIN] 메인 페이지 로딩 실패:', error);
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
    column: {
      bg: 'from-purple-50 to-violet-100',
      badge: 'bg-purple-100 text-purple-700',
      icon: 'text-purple-700',
      link: '/column',
      name: '칼럼',
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
        <div className="max-w-6xl mx-auto px-6 py-20 text-center text-gray-600">
          콘텐츠를 불러오는 중...
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
                          className="h-64 bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.featured_image_url})` }}
                        />
                      ) : (
                        <div className={`h-64 bg-gradient-to-br ${categoryColors[post.category_slug as keyof typeof categoryColors]?.bg || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
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

          {/* 칼럼 */}
          {columnPosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#26422E]">✍️ 칼럼</h2>
                <Link href="/column" className="flex items-center gap-1 text-sm text-purple-700 hover:underline">
                  더보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {columnPosts.map((post) => (
                  <PostCard key={post.id} post={post} colors={categoryColors.column} />
                ))}
              </div>
            </section>
          )}

          {/* 게시글이 없을 때 */}
          {featuredPosts.length === 0 && wildflowerPosts.length === 0 && treePosts.length === 0 && columnPosts.length === 0 && (
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
            className="h-40 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.featured_image_url})` }}
          />
        ) : (
          <div className={`h-40 bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
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
