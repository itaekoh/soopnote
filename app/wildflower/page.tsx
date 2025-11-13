'use client';

import { Leaf, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function WildflowerList() {
  const posts = [
    {
      id: 1,
      title: '산책로에서 만난 작은 봄, 현호색의 연분홍 이야기',
      excerpt: '늦가을 산책로를 걷다가 우연히 발견한 작은 꽃들. 흙 위에 자리잡은 연분홍 빛깔의 현호색은 이 계절에 피어나는 수줍은 봄의 선물이었다.',
      date: '2025-10-12',
      location: '강원도 강릉',
      views: 324,
      emoji: '🌸',
      gradient: 'from-pink-100 via-purple-100 to-green-100',
    },
    {
      id: 2,
      title: '숲 속에 피어난 하얀 별, 노루귀를 만나다',
      excerpt: '이른 봄, 아직 눈이 녹지 않은 숲길에서 노루귀를 발견했다. 하얀 꽃잎이 마치 별처럼 빛나고 있었다.',
      date: '2025-09-28',
      location: '경기도 남양주',
      views: 287,
      emoji: '⭐',
      gradient: 'from-blue-100 via-white to-green-100',
    },
    {
      id: 3,
      title: '계곡을 따라 피어난 노란 붓꽃의 향연',
      excerpt: '계곡물 소리를 따라 걷다 보니 노란 붓꽃이 군락을 이루고 있었다. 햇살에 반짝이는 꽃잎이 아름다웠다.',
      date: '2025-09-15',
      location: '충청북도 단양',
      views: 412,
      emoji: '🌼',
      gradient: 'from-yellow-100 via-amber-100 to-green-100',
    },
    {
      id: 4,
      title: '돌담길 옆 작은 제비꽃의 보랏빛 속삭임',
      excerpt: '마을 어귀 돌담길을 걷다 발견한 제비꽃. 작지만 진한 보랏빛이 인상적이었다.',
      date: '2025-08-30',
      location: '전라남도 담양',
      views: 198,
      emoji: '💜',
      gradient: 'from-purple-100 via-violet-100 to-green-100',
    },
    {
      id: 5,
      title: '이슬 머금은 하늘색 물망초의 아침',
      excerpt: '새벽 산책에서 만난 물망초. 이슬을 머금은 하늘색 꽃잎이 아침 햇살에 반짝였다.',
      date: '2025-08-18',
      location: '강원도 평창',
      views: 356,
      emoji: '💙',
      gradient: 'from-sky-100 via-blue-100 to-green-100',
    },
    {
      id: 6,
      title: '바람에 흔들리는 하얀 매발톱꽃',
      excerpt: '고산지대에서 만난 매발톱꽃. 바람에 흔들리는 모습이 마치 춤을 추는 듯했다.',
      date: '2025-08-05',
      location: '강원도 설악산',
      views: 445,
      emoji: '🤍',
      gradient: 'from-gray-100 via-slate-100 to-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 페이지 헤더 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
            <Leaf className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-4">야생화 일지</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자연 속에서 발견한 작은 꽃들의 이야기. 계절의 변화와 함께하는 야생화 관찰 기록입니다.
          </p>
        </div>

        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-green-700">{posts.length}</span>개의 기록
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white">최신순</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">인기순</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">지역별</button>
          </div>
        </div>

        {/* 게시물 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/wildflower/${post.id}`}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                {/* 썸네일 */}
                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{post.emoji}</div>
                  </div>
                </div>

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
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{post.location.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div>읽음 {post.views}</div>
                  </div>
                </div>

                {/* 하단 태그 */}
                <div className="px-5 pb-4">
                  <div className="inline-block px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 font-medium">
                    야생화 일지
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-lg bg-white border-2 border-green-700 text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-colors">
            더 많은 기록 보기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
