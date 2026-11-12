import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowLeft, User, Edit, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { PostFull } from '@/lib/types/database.types';

// 미리보기는 항상 로그인 쿠키 기반으로 draft 를 읽으므로 캐시하지 않는다.
export const dynamic = 'force-dynamic';

// 비공개 초안이므로 검색 노출을 막는다.
export const metadata: Metadata = {
  title: '초안 미리보기',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

// 카테고리별 색상 (상세 페이지와 동일 톤)
const ACCENT: Record<string, { badge: string; border: string; link: string; avatarBg: string; avatarText: string }> = {
  'tree-diagnose': { badge: 'bg-amber-50 text-amber-700', border: 'border-amber-500', link: 'text-amber-700 hover:text-amber-800', avatarBg: 'bg-amber-100', avatarText: 'text-amber-700' },
  wildflower: { badge: 'bg-green-50 text-green-700', border: 'border-green-500', link: 'text-green-700 hover:text-green-800', avatarBg: 'bg-green-100', avatarText: 'text-green-700' },
  logs: { badge: 'bg-purple-50 text-purple-700', border: 'border-purple-500', link: 'text-purple-700 hover:text-purple-800', avatarBg: 'bg-purple-100', avatarText: 'text-purple-700' },
};

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  // 로그인 쿠키를 들고 조회 → RLS 에 의해 관리자(작성자)만 비공개 글을 볼 수 있다.
  // 비로그인·권한 없음·없는 글이면 null 이 되어 404.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sn_posts_full')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (error || !data) notFound();
  const post = data as PostFull;

  const a = ACCENT[post.category_slug] ?? ACCENT['tree-diagnose'];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      {/* 미리보기 배너 */}
      <div className="sticky top-0 z-[60] bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <strong>초안 미리보기</strong>
            <span className="text-gray-300">— 공개되지 않은 글입니다 (상태: {post.status})</span>
          </span>
          <Link
            href={`/write/${postId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            에디터에서 수정
          </Link>
        </div>
      </div>

      <Header />

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link href={`/${post.category_slug}`} className={`inline-flex items-center gap-2 transition-colors ${a.link}`}>
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </Link>
        </div>

        {/* 카테고리 배지 */}
        <div className="mb-4">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${a.badge}`}>
            {post.category_name}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-6 leading-tight">{post.title}</h1>

        {/* 요약 */}
        {post.excerpt && (
          <p className={`text-xl text-gray-600 mb-8 leading-relaxed border-l-4 pl-4 italic ${a.border}`}>
            {post.excerpt}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.avatarBg}`}>
              <User className={`w-4 h-4 ${a.avatarText}`} />
            </div>
            <span className="font-medium text-gray-800">{post.author_name || '작성자'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{post.published_date}</span>
          </div>
          {post.read_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.read_time} 읽기</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div
          className="prose prose-lg max-w-none mb-12 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 서브카테고리 태그 */}
        {post.subcategory_names && post.subcategory_names.length > 0 && (
          <div className="mb-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.subcategory_names.map((name, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-sm ${a.badge}`}>{name}</span>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
