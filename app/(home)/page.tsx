import { Leaf, Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getHomeData } from '@/lib/api/server-posts';
import type { PostFull } from '@/lib/types/database.types';
import { RetryButton } from './RetryButton';

/**
 * 홈을 서버에서 그린다.
 *
 * 예전에는 브라우저가 열린 뒤에 요청 7개를 보냈다 — 추천 1개, 카테고리
 * 세 개(3개), 그 결과로 최신 글(3개). 카테고리와 글이 쌍으로 이어져 있어
 * 한쪽만 늦어도 그 섹션이 통째로 비었다. 그걸 가리려고 "30초 뒤에 강제로
 * 로딩 해제" 하는 타이머까지 붙어 있었다.
 *
 * 이제 HTML 에 네 묶음이 실려 나간다. 첫 화면에 네트워크가 끼지 않으므로
 * 그 타이머도 필요 없다.
 */
export const revalidate = 60;

type CategoryStyle = {
  bg: string;
  badge: string;
  icon: string;
  link: string;
  name: string;
};

const categoryColors: Record<'wildflower' | 'tree' | 'logs', CategoryStyle> = {
  wildflower: {
    bg: 'from-green-50 to-emerald-100',
    badge: 'bg-green-100 text-green-700',
    icon: 'text-green-700',
    link: '/wildflower',
    name: '식물 관찰',
  },
  tree: {
    bg: 'from-amber-50 to-yellow-100',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'text-amber-700',
    link: '/tree-diagnose',
    name: '수목 진료',
  },
  logs: {
    bg: 'from-purple-50 to-violet-100',
    badge: 'bg-purple-100 text-purple-700',
    icon: 'text-purple-700',
    link: '/logs',
    name: '아카이브',
  },
};

// 추천 카드는 글이 속한 카테고리로 색을 고른다. slug 가 위 셋과 다를 수 있다.
function styleForSlug(slug: string | null): CategoryStyle | null {
  if (slug === 'tree-diagnose') return categoryColors.tree;
  if (slug === 'wildflower') return categoryColors.wildflower;
  if (slug === 'logs') return categoryColors.logs;
  return null;
}

export default async function Home() {
  const { featured, wildflower, tree, logs, allFailed } = await getHomeData();
  const isEmpty =
    featured.length === 0 && wildflower.length === 0 && tree.length === 0 && logs.length === 0;

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
            숲의 기록 — 나무의 시간을 읽다
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자연을 관찰하고, 나무를 진단하고, 그 사이의 생각을 적습니다.
          </p>
        </div>
      </section>

      {allFailed ? (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ 오류 발생</div>
            <p className="text-red-700 mb-4">
              서버와 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
            <RetryButton />
          </div>
        </div>
      ) : (
        <>
          {/* 추천 게시글 */}
          {featured.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-16">
              <h2 className="text-2xl font-bold text-[#26422E] mb-6">추천 게시글</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((post) => (
                  <FeaturedCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          <CategorySection
            title="🌸 식물 관찰"
            href="/wildflower"
            linkClass="text-green-700"
            posts={wildflower}
            colors={categoryColors.wildflower}
          />
          <CategorySection
            title="🌳 수목 진료"
            href="/tree-diagnose"
            linkClass="text-amber-700"
            posts={tree}
            colors={categoryColors.tree}
          />
          <CategorySection
            title="✍️ 아카이브"
            href="/logs"
            linkClass="text-purple-700"
            posts={logs}
            colors={categoryColors.logs}
          />

          {/* 게시글이 없을 때 */}
          {isEmpty && (
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

function CategorySection({
  title,
  href,
  linkClass,
  posts,
  colors,
}: {
  title: string;
  href: string;
  linkClass: string;
  posts: PostFull[];
  colors: CategoryStyle;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#26422E]">{title}</h2>
        <Link href={href} className={`flex items-center gap-1 text-sm ${linkClass} hover:underline`}>
          더보기 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} colors={colors} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ post }: { post: PostFull }) {
  const style = styleForSlug(post.category_slug);

  return (
    <Link href={`/${post.category_slug}/${post.id}`}>
      <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
        {/* 썸네일 */}
        {post.featured_image_url ? (
          <div className="h-64">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ) : (
          <div
            className={`h-64 w-full bg-gradient-to-br ${
              style?.bg || 'from-gray-100 to-gray-200'
            } flex items-center justify-center`}
          >
            <Leaf className="w-20 h-20 text-green-700 opacity-20" />
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-6">
          <div
            className={`inline-block px-3 py-1 text-xs rounded-full ${
              style?.badge || 'bg-gray-100 text-gray-700'
            } font-medium mb-3`}
          >
            {post.category_name}
          </div>
          <h3 className="font-bold text-xl text-[#26422E] mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.excerpt}</p>

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
  );
}

// 게시글 카드 컴포넌트
function PostCard({ post, colors }: { post: PostFull; colors: CategoryStyle }) {
  return (
    <Link href={`${colors.link}/${post.id}`}>
      <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer h-full">
        {/* 썸네일 */}
        {post.featured_image_url ? (
          <div className="h-40">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ) : (
          <div
            className={`h-40 w-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}
          >
            <Leaf className={`w-12 h-12 ${colors.icon} opacity-30`} />
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="p-4">
          <h3 className="font-semibold text-base text-[#26422E] mb-2 line-clamp-1 leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>

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
