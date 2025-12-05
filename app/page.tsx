import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      {/* 상단 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#26422E]">숲의 기록 — 작은 꽃들, 큰 이야기</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다. 글과 사진, 그리고 생각이 어우러진 이야기.</p>
        </div>
      </section>

      {/* 최근 게시물 */}
      <section className="max-w-6xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold text-[#26422E]">최근 게시물</h2>
        <p className="mt-2 text-sm text-gray-600">야생화 일지, 나무진단, 칼럼의 최신 글을 모아보세요.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link key={i} href="/wildflower">
              <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:scale-[1.01] transition-transform cursor-pointer">
                <div className="h-44 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <Leaf className="w-16 h-16 text-green-700 opacity-30" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">포스트 제목 예시 {i + 1}</h3>
                  <p className="mt-2 text-sm text-gray-600">짧은 소개 문장: 현장에서 본 것들을 요약한 한두 문장으로 호기심 유발.</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">2025-10-12 · 강원</div>
                    <div className="text-xs text-gray-500">읽음 324</div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
