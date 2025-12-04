'use client';

import { useState } from 'react';
import { Calendar, MapPin, Heart, Share2, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function WildflowerDetail() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 뒤로가기 버튼 */}
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">뒤로가기</span>
        </Link>

        {/* 제목과 메타정보 */}
        <article>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] leading-tight mb-6">
            산책로에서 만난 작은 봄, 현호색의 연분홍 이야기
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>2025년 10월 12일</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>강원도 강릉</span>
            </div>
            <div className="text-xs bg-green-50 px-3 py-1 rounded-full text-green-700 font-medium">
              야생화 일지
            </div>
          </div>

          {/* 대표 이미지 */}
          <div className="my-10 rounded-2xl overflow-hidden shadow-lg h-96 bg-gradient-to-br from-pink-100 via-purple-100 to-green-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-gray-500 text-sm">현호색 이미지</p>
            </div>
          </div>

          {/* 본문 콘텐츠 영역 */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                늦가을 산책로를 걷다가 우연히 발견한 작은 꽃들. 흙 위에 자리잡은 연분홍 빛깔의 현호색은 이 계절에 피어나는 수줍은 봄의 선물이었다.
              </p>

              <div className="bg-green-50 border-l-4 border-green-700 pl-6 py-4 rounded-r-lg my-6">
                <p className="italic text-green-900">
                  &quot;자연 속에서 발견하는 작은 것들이 우리에게 말해주는 것들이 있다. 그것은 계절의 변화이자, 생명의 신비로움이다.&quot;
                </p>
              </div>

              <p>
                현호색은 미나리아재비과의 봄꽃인데, 겨울을 지나고 초봄에 피는 것으로 알려져 있다. 그런데 여름을 지나 가을이 깊어가는 이맘때 이렇게 아름다운 꽃을 만나다니. 온난화의 영향일까, 아니면 이곳의 미세한 환경 덕분일까.
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 my-6">
                <h3 className="font-semibold text-[#26422E] mb-3">현호색 (Corydalis incisa)</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium">과명:</span> 미나리아재비과</li>
                  <li><span className="font-medium">개화기:</span> 3월~5월 (이상 개화 사례 증가)</li>
                  <li><span className="font-medium">서식지:</span> 산림 가장자리, 숲 속 습기 있는 곳</li>
                  <li><span className="font-medium">특징:</span> 연분홍 꽃, 섬세한 엽맥, 작은 씨주머니</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 상호작용 영역 */}
          <div className="border-y border-gray-200 py-6 my-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isLiked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{isLiked ? '324' : '323'}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">12</span>
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">공유</span>
            </button>
          </div>

          {/* 댓글 섹션 */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#26422E] mb-6">댓글 12개</h2>

            {/* 댓글 작성 폼 */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
              <textarea
                placeholder="댓글을 입력하세요..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-3"
              />
              <div className="flex justify-end">
                <button className="px-6 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors">
                  댓글 작성
                </button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {/* 샘플 댓글 1 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">홍</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">홍길동</span>
                      <span className="text-xs text-gray-500">2025-10-13</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      정말 아름다운 꽃이네요. 저도 이번 주말에 그곳에 가볼까 합니다. 혹시 찾아가기 어렵지 않나요?
                    </p>
                  </div>
                </div>
              </div>

              {/* 샘플 댓글 2 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">김</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">김철수</span>
                      <span className="text-xs text-gray-500">2025-10-13</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      현호색에 대한 자세한 설명 감사합니다. 계절에 맞지 않게 피어난 이유가 궁금했는데 도움이 되었어요!
                    </p>
                  </div>
                </div>
              </div>

              {/* 샘플 댓글 3 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold">이</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">이영희</span>
                      <span className="text-xs text-gray-500">2025-10-12</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      사진으로 보는 것보다 실제로 보면 더 예쁘겠어요. 좋은 기록 남겨주셔서 감사합니다 :)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="border-t border-gray-200 pt-8 mt-12">
            <Link
              href="/wildflower"
              className="block w-full py-4 rounded-xl bg-white border-2 border-green-700 text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-colors text-center"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
