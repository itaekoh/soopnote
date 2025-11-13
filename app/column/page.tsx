'use client';

import { BookOpen, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ColumnList() {
  const posts = [
    {
      id: 1,
      title: '도시의 회색 숲을 초록으로 물들이는 방법',
      excerpt: '아침 지하철을 타고 도심으로 향하는 길. 창밖으로 흘러가는 것은 무채색의 건물들과 콘크리트로 채워진 거리뿐이다.',
      date: '2025-10-18',
      readTime: '5분',
      views: 512,
      category: '도시숲',
      emoji: '🌆',
      gradient: 'from-slate-100 via-gray-100 to-green-100',
    },
    {
      id: 2,
      title: '기후변화 시대, 나무가 우리에게 말하는 것들',
      excerpt: '봄이 점점 빨리 오고, 가을은 점점 늦게 찾아온다. 나무들이 들려주는 기후변화의 신호를 읽어본다.',
      date: '2025-10-10',
      readTime: '7분',
      views: 687,
      category: '환경',
      emoji: '🌡️',
      gradient: 'from-orange-100 via-red-100 to-purple-100',
    },
    {
      id: 3,
      title: '우리 동네 가로수가 중요한 진짜 이유',
      excerpt: '매일 지나치는 가로수. 그저 풍경의 일부로만 생각했던 나무들이 실은 우리 삶에 얼마나 중요한 역할을 하는지.',
      date: '2025-10-01',
      readTime: '4분',
      views: 423,
      category: '일상',
      emoji: '🌳',
      gradient: 'from-green-100 via-lime-100 to-yellow-100',
    },
    {
      id: 4,
      title: '산림욕의 과학: 숲이 주는 치유의 힘',
      excerpt: '숲에 들어가면 마음이 편안해지는 이유는 단순히 기분 탓이 아니다. 과학적으로 증명된 산림욕의 효과.',
      date: '2025-09-24',
      readTime: '6분',
      views: 789,
      category: '건강',
      emoji: '🧘',
      gradient: 'from-teal-100 via-cyan-100 to-sky-100',
    },
    {
      id: 5,
      title: '정원 가꾸기가 정신건강에 미치는 영향',
      excerpt: '흙을 만지고 식물을 가꾸는 단순한 행위가 우울증과 불안을 줄이고 행복감을 높인다는 연구 결과들.',
      date: '2025-09-15',
      readTime: '5분',
      views: 534,
      category: '정원',
      emoji: '🌱',
      gradient: 'from-lime-100 via-green-100 to-emerald-100',
    },
    {
      id: 6,
      title: '나무의사라는 직업: 나무를 치료하는 사람들',
      excerpt: '사람을 치료하는 의사가 있듯이, 나무를 전문적으로 진단하고 치료하는 나무의사라는 직업이 있다.',
      date: '2025-09-08',
      readTime: '8분',
      views: 612,
      category: '직업',
      emoji: '👨‍⚕️',
      gradient: 'from-blue-100 via-indigo-100 to-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 페이지 헤더 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
            <BookOpen className="w-8 h-8 text-purple-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-4">칼럼</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자연과 환경, 그리고 우리의 삶에 대한 이야기. 나무와 숲이 전하는 메시지를 담았습니다.
          </p>
        </div>

        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-purple-700">{posts.length}</span>개의 칼럼
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm rounded-lg bg-purple-700 text-white">최신순</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">인기순</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">카테고리별</button>
          </div>
        </div>

        {/* 게시물 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/column/${post.id}`}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                {/* 썸네일 */}
                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{post.emoji}</div>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 text-xs rounded-full font-medium bg-white/80 backdrop-blur-sm text-gray-700">
                    {post.readTime} 읽기
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700 font-medium">
                      {post.category}
                    </div>
                  </div>
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
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>

                {/* 하단 태그 */}
                <div className="px-5 pb-4">
                  <div className="inline-block px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 font-medium">
                    칼럼
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-lg bg-white border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-700 hover:text-white transition-colors">
            더 많은 칼럼 보기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
