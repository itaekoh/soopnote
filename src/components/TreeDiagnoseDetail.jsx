import React from "react";
import { Leaf, MapPin, Calendar, Heart, Share2, ArrowLeft, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";

export default function TreeDiagnoseDetail() {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      {/* 헤더 */}
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
          <a className="text-sm hover:text-green-700 transition-colors" href="#">야생화 일지</a>
          <a className="text-sm hover:text-green-700 transition-colors" href="#">나무진단</a>
          <a className="text-sm hover:text-green-700 transition-colors" href="#">칼럼</a>
          <button className="ml-2 py-2 px-4 rounded-lg bg-green-700 text-white text-sm shadow-sm hover:scale-[1.02] transition-transform">글쓰기</button>
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 뒤로가기 버튼 */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">뒤로가기</span>
        </button>

        {/* 제목과 메타정보 */}
        <article>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] leading-tight mb-6">
            오래된 느티나무의 새 생명, 가지 톱질 후 빠른 회복의 비결
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>2025년 10월 15일</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>서울시 강남구</span>
            </div>
            <div className="text-xs bg-amber-50 px-3 py-1 rounded-full text-amber-700 font-medium">
              나무진단
            </div>
          </div>

          {/* 대표 이미지 */}
          <div className="my-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
              alt="나무 진단"
              className="w-full h-96 object-cover"
            />
          </div>

          {/* 진단 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-green-700 uppercase">상태 평가</div>
                  <div className="text-lg font-semibold text-[#26422E] mt-2">양호</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-700 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-blue-700 uppercase">진단 종류</div>
                  <div className="text-lg font-semibold text-[#26422E] mt-2">가지 톱질</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-amber-700 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-amber-700 uppercase">나무 종류</div>
                  <div className="text-lg font-semibold text-[#26422E] mt-2">느티나무</div>
                </div>
              </div>
            </div>
          </div>

          {/* 본문 콘텐츠 영역 */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                마을 입구에 서 있는 수령 80년의 느티나무. 오래 살아온 이 나무는 몇 년 전부터 쇠퇴의 징조를 보이기 시작했다. 병해충에 의해 손상된 가지들이 증가했고, 수관의 밀도도 점점 낮아져가고 있었다.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-700 pl-6 py-4 rounded-r-lg my-6">
                <p className="italic text-amber-900">
                  "오래된 나무도 올바른 진단과 치료로 새로운 생명을 얻을 수 있다. 그것이 나무의사의 역할이다."
                </p>
              </div>

              <h3 className="text-xl font-bold text-[#26422E] mt-8 mb-4">진단 내용</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 my-6">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium">수관 쇠퇴:</span> 전체 수관의 약 35% 손상, 엽량 감소</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium">병해충 피해:</span> 벚나무응애, 흰불나방 유충 발견</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium">교사목 증식:</span> 주간부에서 이상 가지 3-4개 발생</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <span><span className="font-medium">수피 손상:</span> 동물 박피에 의한 상처 2곳 발견</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-[#26422E] mt-8 mb-4">처방 및 시술</h3>
              <p>
                본 진단을 바탕으로 다음과 같은 처방을 시행했습니다. 첫째, 병든 가지와 이상 가지를 선정적으로 톱질했습니다. 나무의 내부 생장력을 고려하여 약 25%의 가지를 제거했으며, 절단면은 절단 도료로 보호했습니다.
              </p>

              <p>
                둘째, 병해충 방제를 위해 환경친화적인 천연 소재의 살충제를 살포했습니다. 특히 먹이 활동이 활발한 초기 유충 단계에서의 처리가 중요했습니다.
              </p>

              <p>
                셋째, 나무의 회복을 돕기 위해 맞춤형 영양분 주입 요법을 시행했습니다. 마그네슘, 철분, 칼슘 등 필수 미량원소를 뿌리 주변에 공급했습니다.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-700 pl-6 py-4 rounded-r-lg my-6">
                <h4 className="font-semibold text-blue-900 mb-3">회복 경과 (시술 후 8주)</h4>
                <ul className="space-y-2 text-blue-900 text-sm">
                  <li>• 신엽 발아: 절단부 주변에서 평균 15-20cm의 신엽 발생</li>
                  <li>• 엽량 증가: 수관의 전체 엽량 약 40% 증가</li>
                  <li>• 색상 개선: 짙은 녹색으로의 회복</li>
                  <li>• 병해충 소실: 추가 피해 발생 없음</li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-[#26422E] mt-8 mb-4">앞으로의 관리</h3>
              <p>
                이 느티나무가 완전히 회복되기 위해서는 지속적인 관리가 필요합니다. 향후 2-3년간 매년 봄에 양분 공급을 계속할 필요가 있으며, 겨울철 주기적인 점검으로 새로운 병해충 발생을 조기에 대응해야 합니다.
              </p>

              <p>
                또한 주변 환경 개선도 중요합니다. 나무 주변의 포장을 부분적으로 개방하여 토양 통기성을 높이고, 과도한 사람의 발걸음으로부터 보호하는 것이 좋습니다. 이러한 세심한 관리가 함께할 때, 이 오래된 나무도 앞으로 또 다른 100년을 살아갈 수 있을 것입니다.
              </p>
            </div>
          </div>

          {/* 상호작용 영역 */}
          <div className="border-y border-gray-200 py-6 my-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isLiked
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">{isLiked ? "287" : "286"}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">18</span>
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">공유</span>
            </button>
          </div>

          {/* 저자 정보 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-8 h-8 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#26422E]">나무의사 박진수</h3>
                <p className="text-sm text-gray-600 mt-1">
                  20년 경력의 공인 나무의사. 도시의 오래된 나무들을 건강하게 유지하기 위해 현장에서 활동 중입니다. 전문적인 진단과 치료로 소중한 나무들을 보존합니다.
                </p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:scale-[1.02] transition-transform">
                  프로필 보기
                </button>
              </div>
            </div>
          </div>

          {/* 관련 글 */}
          <div>
            <h2 className="text-2xl font-bold text-[#26422E] mb-6">관련된 나무진단</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-40 bg-cover bg-center" style={{
                    backgroundImage: `url('https://images.pexels.com/photos/${3808517 + i}/pexels-photo-${3808517 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop')`
                  }} />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#26422E] line-clamp-2">나무진단 사례 {i + 1}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>2025-10-{12 + i} · 서울</span>
                      <span>읽음 203</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </main>

      {/* 푸터 */}
      <footer className="mt-20 border-t bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
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
