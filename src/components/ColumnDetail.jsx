import React from "react";
import { Leaf, MapPin, Calendar, Heart, Share2, ArrowLeft, MessageCircle, Quote } from "lucide-react";

export default function ColumnDetail() {
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
            도시의 회색 숲을 초록으로 물드는 방법
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>2025년 10월 18일</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>에디토리얼</span>
            </div>
            <div className="text-xs bg-purple-50 px-3 py-1 rounded-full text-purple-700 font-medium">
              칼럼
            </div>
          </div>

          {/* 대표 이미지 */}
          <div className="my-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.pexels.com/photos/3571563/pexels-photo-3571563.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
              alt="도시 숲"
              className="w-full h-96 object-cover"
            />
          </div>

          {/* 본문 콘텐츠 영역 */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                아침 지하철을 타고 도심으로 향하는 길. 창밖으로 흘러가는 것은 무채색의 건물들과 콘크리트로 채워진 거리뿐이다. 가끔 그 속에서 초록색이 보일 때마다 얼마나 소중해 보이는지 모른다.
              </p>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-green-200 my-8">
                <div className="flex items-start gap-4">
                  <Quote className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <p className="italic text-green-900 text-lg leading-relaxed">
                    "도시는 회색이어야 한다고 생각하는 건 착각이다. 도시도 생명으로 호흡해야 하고, 그 숨은 초록이어야 한다. 우리는 그 초록을 만들 능력이 있다."
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#26422E] mt-10 mb-4">도시에서 녹지가 사라지는 이유</h3>

              <p>
                1990년대 이후 도시 재개발의 물결 속에서 많은 것들이 사라졌다. 오래된 건물도, 좁은 골목도, 그리고 그 속에 존재하던 나무들도. 효율성이라는 명분 아래, 무엇인가를 심는 것보다 무엇인가를 없애는 것이 더 빠르고 쉬웠던 시대였다.
              </p>

              <p>
                하지만 지난 수십 년간의 연구들이 명확히 보여주는 사실이 있다. 도시의 녹지는 단순한 미용이 아니다. 그것은 도시민의 정신 건강이고, 공기의 질이고, 기후 조절의 수단이다. 한 그루의 나무가 주는 실질적인 가치는 계산하기 어려울 정도다.
              </p>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 my-8">
                <h4 className="font-semibold text-blue-900 mb-4">도시 나무 한 그루의 연간 가치</h4>
                <ul className="space-y-3 text-blue-900 text-sm">
                  <li className="flex gap-3">
                    <span className="font-medium min-w-fit">이산화탄소 제거:</span>
                    <span>연평균 21kg (자동차 1대가 1주일에 배출하는 양)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-medium min-w-fit">대기 오염 감소:</span>
                    <span>미세먼지, 이산화질소 등 유해물질 제거</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-medium min-w-fit">기온 조절:</span>
                    <span>반경 5~10m 내 기온을 최대 5도 낮춤</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-medium min-w-fit">심리 효과:</span>
                    <span>스트레스 감소, 우울증 완화, 집중력 향상</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-[#26422E] mt-10 mb-4">우리가 할 수 있는 것들</h3>

              <p>
                변화는 거대한 프로젝트에서만 시작되지 않는다. 때로는 한 개인의 작은 결정이 모여 도시를 바꾼다. 서울의 한 아파트 주민이 베란다에 화분을 놓고, 동네 카페 주인이 입구에 작은 나무를 심고, 학교 담장을 따라 담쟁이덩굴을 심는 것. 이 모든 것들이 모여 도시의 초록을 만든다.
              </p>

              <p>
                개인적으로 할 수 있는 일들:
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 my-6">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-700 font-bold">1.</span>
                    <span><span className="font-medium">집에서 식물 키우기:</span> 실내 공기 정화와 정서적 안정감</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-700 font-bold">2.</span>
                    <span><span className="font-medium">동네 공원과 녹지 방문하기:</span> 이용률이 높을수록 지자체의 투자 유인</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-700 font-bold">3.</span>
                    <span><span className="font-medium">도시숲 조성 프로젝트에 참여하기:</span> 자원봉사로 함께하는 녹화</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-700 font-bold">4.</span>
                    <span><span className="font-medium">친환경 소비 선택하기:</span> 녹지 보전의 정책적 근거 마련</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-700 font-bold">5.</span>
                    <span><span className="font-medium">나무 보호에 목소리 내기:</span> 개발 계획에 의견 제출</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-[#26422E] mt-10 mb-4">도시숲의 미래</h3>

              <p>
                2024년 현재, 전 세계 주요 도시들은 '바이오필릭 시티(Biophilic City)' 개념으로 도시 설계를 다시 하고 있다. 서울에서도 한강공원의 생태계 복원, 다세대주택 밀집지역 녹지 조성, 옥상 텃밭 지원 등 다양한 프로젝트가 진행 중이다.
              </p>

              <p>
                가장 중요한 것은 이 변화의 주인공이 정부나 기업이 아니라 우리 시민이라는 사실이다. 내가 가는 길에 나무가 몇 그루 더 있으면 좋겠다고 생각할 때, 그것이 변화의 시작이다. 도시의 회색을 초록으로 물드는 것, 그것은 거창한 이야기가 아니라 우리 일상 속 선택의 누적이다.
              </p>

              <p>
                내일도 지하철을 탈 것이다. 그리고 그 창밖으로 보이는 초록이 조금 더 많아지기를, 조금 더 건강하기를 바랄 것이다. 하지만 바람만으로는 부족하다. 오늘부터 나도 시작할 수 있는 것들이 있다. 작지만 확실한 초록의 손길로.
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
                <span className="text-sm font-medium">{isLiked ? "512" : "511"}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">34</span>
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-8 h-8 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#26422E]">이준호 에디터</h3>
                <p className="text-sm text-gray-600 mt-1">
                  도시의 숨겨진 초록을 찾아다니는 환경 에디터. 정책부터 일상까지, 우리 모두가 함께할 수 있는 지속가능한 도시에 대해 이야기합니다.
                </p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:scale-[1.02] transition-transform">
                  프로필 보기
                </button>
              </div>
            </div>
          </div>

          {/* 관련 글 */}
          <div>
            <h2 className="text-2xl font-bold text-[#26422E] mb-6">관련된 칼럼</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-40 bg-cover bg-center" style={{
                    backgroundImage: `url('https://images.pexels.com/photos/${3571563 + i}/pexels-photo-${3571563 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop')`
                  }} />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#26422E] line-clamp-2">칼럼 제목 {i + 1}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>2025-10-{15 + i} · 에디토리얼</span>
                      <span>읽음 289</span>
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
