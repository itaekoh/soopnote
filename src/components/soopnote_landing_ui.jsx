import React from "react";
import { Leaf } from "lucide-react";

export default function SoopnoteLanding() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      {/* 상단 헤더 */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Leaf className="w-7 h-7 text-green-700" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-lg font-semibold">soopnote</div>
            <div className="text-xs text-gray-500 -mt-0.5">plant journal & tree doctor</div>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <a className="text-sm hover:text-green-700" href="#">야생화 일지</a>
          <a className="text-sm hover:text-green-700" href="#">나무진단</a>
          <a className="text-sm hover:text-green-700" href="#">칼럼</a>
          <button className="ml-2 py-2 px-4 rounded-lg bg-green-700 text-white text-sm shadow-sm hover:scale-[1.02] transition-transform">글쓰기</button>
        </nav>
      </header>

      {/* 히어로 섹션 */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-12 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#26422E]">숨의 기록 — 작은 꽃들, 큰 이야기</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다. 글과 사진, 그리고 생각이 어우러진 이야기.</p>
        </div>
      </section>

      {/* 최근 게시물 */}
      <section className="max-w-6xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold text-[#26422E]">최근 게시물</h2>
        <p className="mt-2 text-sm text-gray-600">야생화 일지, 나무진단, 칼럼의 최신 글을 모아보세요.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-md hover:scale-[1.01] transition-transform">
              <div
                className="h-44 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3')",
                }}
              />
              <div className="p-5">
                <h3 className="font-semibold text-lg">포스트 제목 예시 {i + 1}</h3>
                <p className="mt-2 text-sm text-gray-600">짧은 소개 문장: 현장에서 본 것들을 요약한 한두 문장으로 호기심 유발.</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">2025-10-12 · 강원</div>
                  <div className="text-xs text-gray-500">읽음 324</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-16 border-t pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="font-semibold">soopnote</div>
            <div className="text-xs text-gray-500 mt-2">Plant journal · Tree doctor notes</div>
          </div>

          <div className="flex gap-6">
            <div>
              <div className="text-sm font-medium">Contact</div>
              <div className="text-xs text-gray-500 mt-2">email@example.com</div>
            </div>
            <div>
              <div className="text-sm font-medium">License</div>
              <div className="text-xs text-gray-500 mt-2">CC BY-NC 4.0</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
