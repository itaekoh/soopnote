import React from "react";
import { Leaf, MapPin, Calendar, Heart, Share2, ArrowLeft, MessageCircle } from "lucide-react";

export default function WildflowerDetail() {
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
          <div className="my-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.pexels.com/photos/3683770/pexels-photo-3683770.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
              alt="현호색"
              className="w-full h-96 object-cover"
            />
          </div>

          {/* 본문 콘텐츠 영역 */}
          <div className="prose prose-lg max-w-none mb-12">
            {/* 위지웍 에디터로 생성될 콘텐츠 영역 */}
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                늦가을 산책로를 걷다가 우연히 발견한 작은 꽃들. 흙 위에 자리잡은 연분홍 빛깔의 현호색은 이 계절에 피어나는 수줍은 봄의 선물이었다.
              </p>

              <div className="bg-green-50 border-l-4 border-green-700 pl-6 py-4 rounded-r-lg my-6">
                <p className="italic text-green-900">
                  "자연 속에서 발견하는 작은 것들이 우리에게 말해주는 것들이 있다. 그것은 계절의 변화이자, 생명의 신비로움이다."
                </p>
              </div>

              <p>
                현호색은 미나리아재비과의 봄꽃인데, 겨울을 지나고 초봄에 피는 것으로 알려져 있다. 그런데 여름을 지나 가을이 깊어가는 이맘때 이렇게 아름다운 꽃을 만나다니. 온난화의 영향일까, 아니면 이곳의 미세한 환경 덕분일까.
              </p>

              <p>
                꽃의 색깔은 연분홍을 띠고 있고, 잎은 미세하게 톱니 모양으로 잘려있다. 꽃의 크기는 작지만 그 정교함은 마치 자연이 빚은 예술품 같다. 한 송이 한 송이가 정성스럽게 배열된 모습에서 생명의 신비로움이 느껴진다.
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

              <p>
                이 작은 현호색을 만나면서 든 생각은 이것이다. 우리가 놓치는 것들이 얼마나 많은가 하는 것이다. 사람들로 붐비는 길을 걸으면서도 발 아래 피어난 이 작은 생명을 보지 못하고 지나가는 경우가 대부분이다.
              </p>

              <p>
                하지만 조금 느리게, 조금 더 자세히 보면 세상은 이렇게 아름답다는 것을 알게 된다. 자연 속의 작은 것들이 말해주는 이야기들이 우리의 마음에 어떤 위안을 주는지 말이다.
              </p>

              <p>
                내일도 같은 산책로를 걸을 것이다. 그리고 또 다른 작은 생명의 이야기를 찾아 기록할 것이다. 왜냐하면 그것이 바로 이 일지가 존재하는 이유이기 때문이다.
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
                <span className="text-sm font-medium">{isLiked ? "324" : "323"}</span>
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

          {/* 저자 정보 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-8 h-8 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#26422E]">자연 관찰가</h3>
                <p className="text-sm text-gray-600 mt-1">
                  15년간 야생화와 생태계를 기록해온 나무의사이자 자연 저술가입니다. 계절의 변화 속에서 발견하는 작은 생명들의 이야기를 담습니다.
                </p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:scale-[1.02] transition-transform">
                  프로필 보기
                </button>
              </div>
            </div>
          </div>

          {/* 관련 글 */}
          <div>
            <h2 className="text-2xl font-bold text-[#26422E] mb-6">관련된 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-40 bg-cover bg-center" style={{
                    backgroundImage: `url('https://images.pexels.com/photos/${3683770 + i}/pexels-photo-${3683770 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop')`
                  }} />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#26422E] line-clamp-2">관련 글 제목 {i + 1}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>2025-10-{10 + i} · 강원</span>
                      <span>읽음 156</span>
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
