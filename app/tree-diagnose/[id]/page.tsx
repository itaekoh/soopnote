'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calendar, MapPin, Eye, ChevronLeft, Stethoscope, Heart, Share2, MessageCircle } from 'lucide-react';

export default function TreeDiagnoseDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isLiked, setIsLiked] = useState(false);

  // 임시 데이터 (나중에 Supabase에서 가져올 데이터)
  const posts = [
    {
      id: 1,
      title: '오래된 느티나무의 새 생명, 가지 톱질 후 빠른 회복의 비결',
      excerpt: '마을 입구에 서 있는 수령 80년의 느티나무. 오래 살아온 이 나무는 몇 년 전부터 쇠퇴의 징조를 보이기 시작했다.',
      date: '2025-10-15',
      location: '서울시 강남구',
      views: 286,
      status: '양호',
      treeType: '느티나무',
      emoji: '🌳',
      gradient: 'from-green-100 via-emerald-100 to-teal-100',
      content: `
        <h2>초기 진단</h2>
        <p>마을 입구에 서 있는 수령 80년의 느티나무를 처음 진단했을 때, 나무는 명백한 쇠퇴의 징조를 보이고 있었습니다. 잎의 크기가 작아지고, 가지 끝부분이 말라가는 전형적인 노화 증상이었습니다.</p>

        <h2>진단 내용</h2>
        <ul>
          <li><strong>수형 평가:</strong> 주간 기울기 약 5도, 전체적으로 안정적</li>
          <li><strong>수세 평가:</strong> 중간 수준, 잎의 밀도 감소</li>
          <li><strong>토양 상태:</strong> 배수 불량, 토양 압밀화 진행</li>
          <li><strong>병해충:</strong> 특이사항 없음</li>
        </ul>

        <h2>처방 및 치료</h2>
        <p>나무의 회복을 위해 다음과 같은 처치를 진행했습니다:</p>
        <ol>
          <li><strong>가지치기:</strong> 고사 가지 및 경쟁 가지 제거</li>
          <li><strong>토양 개선:</strong> 뿌리 주변 배수로 설치 및 유기물 투입</li>
          <li><strong>영양 공급:</strong> 완효성 비료 시비</li>
          <li><strong>수간 보호:</strong> 동공 부위 방부 처리</li>
        </ol>

        <h2>경과 및 결과</h2>
        <p>처치 후 3개월이 지난 현재, 느티나무는 눈에 띄는 회복세를 보이고 있습니다. 새순이 건강하게 돋아났고, 잎의 크기도 이전보다 커졌습니다. 토양 개선으로 뿌리 활력이 증가하면서 전체적인 수세가 좋아졌습니다.</p>

        <h2>향후 관리 방향</h2>
        <p>나무의 건강을 지속적으로 유지하기 위해서는 정기적인 모니터링이 필요합니다. 특히 여름철 가뭄과 겨울철 동해에 주의하며, 매년 봄 시비와 가을 병해충 점검을 권장합니다.</p>
      `,
    },
    {
      id: 2,
      title: '소나무 재선충병 조기 발견과 긴급 처치 사례',
      excerpt: '정기 순찰 중 발견한 소나무의 이상 징후. 잎이 갈변하고 수지 분비가 감소하는 전형적인 재선충병 증상이었다.',
      date: '2025-10-08',
      location: '경기도 가평',
      views: 512,
      status: '치료중',
      treeType: '소나무',
      emoji: '🌲',
      gradient: 'from-amber-100 via-orange-100 to-red-100',
      content: `
        <h2>긴급 상황 발생</h2>
        <p>정기 순찰 중 소나무 군락에서 한 그루가 이상 징후를 보이는 것을 발견했습니다. 잎이 갈변하고 수지 분비가 현저히 감소한 상태로, 재선충병이 의심되는 상황이었습니다.</p>

        <h2>정밀 진단</h2>
        <p>즉시 시료를 채취하여 실험실 분석을 의뢰했습니다. 결과는 예상대로 소나무재선충(Bursaphelenchus xylophilus) 양성으로 나타났습니다.</p>
        <ul>
          <li><strong>재선충 밀도:</strong> 고농도 검출</li>
          <li><strong>감염 단계:</strong> 초기~중기</li>
          <li><strong>주변 나무:</strong> 반경 50m 내 모니터링 필요</li>
        </ul>

        <h2>긴급 방제 조치</h2>
        <ol>
          <li><strong>감염목 처리:</strong> 즉시 벌채 및 훈증 처리</li>
          <li><strong>매개충 방제:</strong> 솔수염하늘소 트랩 설치</li>
          <li><strong>주변 예방:</strong> 건강한 소나무에 예방 약제 수간주입</li>
          <li><strong>확산 차단:</strong> 반경 100m 내 집중 모니터링</li>
        </ol>

        <h2>현재 상황</h2>
        <p>감염목은 안전하게 제거되었으며, 주변 소나무들에 대한 예방 조치가 완료되었습니다. 현재까지 추가 감염 징후는 발견되지 않았으나, 향후 2년간 집중 모니터링이 필요한 상황입니다.</p>
      `,
    },
    {
      id: 3,
      title: '벚나무 가지 고사 원인 진단 및 영양 처방',
      excerpt: '공원의 오래된 왕벚나무에서 발견된 가지 고사 증상. 토양 검사 결과 영양 결핍이 주요 원인으로 밝혀졌다.',
      date: '2025-09-29',
      location: '부산시 해운대구',
      views: 198,
      status: '양호',
      treeType: '벚나무',
      emoji: '🌸',
      gradient: 'from-pink-100 via-rose-100 to-red-100',
      content: `
        <h2>증상 관찰</h2>
        <p>공원의 왕벚나무에서 상부 가지들이 점진적으로 고사하는 증상이 관찰되었습니다. 일부 가지는 완전히 말라 있었고, 봄철 개화량도 현저히 감소한 상태였습니다.</p>

        <h2>정밀 진단</h2>
        <p>토양 및 엽 분석을 실시한 결과, 복합적인 영양 결핍이 확인되었습니다.</p>
        <ul>
          <li><strong>질소(N):</strong> 부족 (권장량의 60%)</li>
          <li><strong>인(P):</strong> 부족 (권장량의 55%)</li>
          <li><strong>칼륨(K):</strong> 정상</li>
          <li><strong>pH:</strong> 5.8 (약산성, 정상 범위)</li>
          <li><strong>토양 유기물:</strong> 낮음 (1.2%)</li>
        </ul>

        <h2>처방 및 처치</h2>
        <ol>
          <li><strong>고사지 제거:</strong> 완전 고사한 가지 전정</li>
          <li><strong>영양 공급:</strong> NPK 복합비료 및 유기질 비료 시비</li>
          <li><strong>토양 개선:</strong> 퇴비 투입으로 유기물 함량 증대</li>
          <li><strong>멀칭:</strong> 수목 칩 멀칭으로 수분 보존</li>
        </ol>

        <h2>회복 경과</h2>
        <p>처치 후 2개월이 지난 현재, 새순이 건강하게 자라고 있으며 잎의 색깔도 진한 녹색으로 회복되었습니다. 내년 봄 개화 상태를 지켜보며 추가 관리를 진행할 예정입니다.</p>
      `,
    },
    {
      id: 4,
      title: '은행나무 뿌리 부패 치료 및 토양 개선 작업',
      excerpt: '도심 가로수로 심어진 은행나무의 뿌리 부패 증상. 과도한 포장으로 인한 통기성 부족이 원인이었다.',
      date: '2025-09-20',
      location: '대전시 유성구',
      views: 334,
      status: '치료완료',
      treeType: '은행나무',
      emoji: '🍂',
      gradient: 'from-yellow-100 via-amber-100 to-orange-100',
      content: `
        <h2>문제 발견</h2>
        <p>도심 가로수로 식재된 은행나무의 수세가 급격히 약해지면서 신고가 접수되었습니다. 현장 조사 결과, 나무 주변이 과도하게 포장되어 있었고, 뿌리 부패 징후가 명확했습니다.</p>

        <h2>원인 분석</h2>
        <ul>
          <li><strong>토양 통기성:</strong> 극히 불량 (포장면적 95%)</li>
          <li><strong>배수 상태:</strong> 불량 (침수 흔적 다수)</li>
          <li><strong>뿌리 부패:</strong> 주근 및 측근 일부 부패 진행</li>
          <li><strong>토양 압밀:</strong> 심각 (투수계수 매우 낮음)</li>
        </ul>

        <h2>치료 계획 및 실행</h2>
        <ol>
          <li><strong>포장 제거:</strong> 수관 투영면적 60% 포장 철거</li>
          <li><strong>뿌리 치료:</strong> 부패 뿌리 제거 및 살균제 처리</li>
          <li><strong>토양 치환:</strong> 배수층 조성 및 양질의 토양으로 교체</li>
          <li><strong>통기 시설:</strong> 에어레이션 파이프 설치</li>
          <li><strong>배수 개선:</strong> 배수로 신설</li>
        </ol>

        <h2>치료 결과</h2>
        <p>대대적인 토양 개선 작업 후 3개월이 경과한 현재, 은행나무는 완전히 회복되었습니다. 새로운 세근이 활발하게 발달하고 있으며, 잎의 크기와 색깔도 정상으로 돌아왔습니다.</p>

        <h2>재발 방지 대책</h2>
        <p>향후 유사 사례 방지를 위해 가로수 주변 포장 시 최소 40%의 투수면적을 확보하도록 관리 지침을 제안했습니다.</p>
      `,
    },
    {
      id: 5,
      title: '단풍나무 탄저병 진단과 친환경 방제',
      excerpt: '아파트 단지 내 단풍나무에서 발견된 탄저병. 환경친화적인 방법으로 치료를 진행했다.',
      date: '2025-09-12',
      location: '인천시 연수구',
      views: 267,
      status: '치료중',
      treeType: '단풍나무',
      emoji: '🍁',
      gradient: 'from-red-100 via-orange-100 to-yellow-100',
      content: `
        <h2>병 발생 확인</h2>
        <p>아파트 단지 내 단풍나무 가로수에서 탄저병(Anthracnose) 발생이 확인되었습니다. 잎에 불규칙한 갈색 반점이 나타나고, 일부는 조기 낙엽이 진행 중이었습니다.</p>

        <h2>병원균 동정</h2>
        <ul>
          <li><strong>병원균:</strong> Colletotrichum acutatum</li>
          <li><strong>감염률:</strong> 약 30%의 잎에서 병징 관찰</li>
          <li><strong>발병 시기:</strong> 장마기 이후 고온다습한 환경</li>
          <li><strong>확산 위험:</strong> 중간 (인접 나무로 전파 가능)</li>
        </ul>

        <h2>친환경 방제 전략</h2>
        <p>아파트 단지라는 특성상 화학 약제 사용을 최소화하고 친환경적 방법을 우선 적용했습니다.</p>
        <ol>
          <li><strong>감염엽 제거:</strong> 병든 잎 수거 및 소각</li>
          <li><strong>미생물 제제:</strong> 길항미생물 Bacillus subtilis 살포</li>
          <li><strong>천연 보호제:</strong> 키토산 및 목초액 혼합액 엽면 살포</li>
          <li><strong>수세 강화:</strong> 유기질 비료로 나무 체력 증진</li>
          <li><strong>환경 개선:</strong> 과밀 가지 전정으로 통풍 개선</li>
        </ol>

        <h2>현재 경과</h2>
        <p>친환경 방제 시작 후 1개월이 경과했으며, 신규 감염은 크게 줄어든 상태입니다. 날씨가 건조해지면서 자연적으로 병 진행도 둔화되고 있습니다. 가을철 낙엽 후 월동기 방제를 추가로 실시할 예정입니다.</p>
      `,
    },
    {
      id: 6,
      title: '회화나무 동공 처리 및 구조 안전성 확보',
      excerpt: '오래된 회화나무의 줄기에 발견된 큰 동공. 구조적 안전성을 확보하기 위한 전문 처치가 필요했다.',
      date: '2025-09-05',
      location: '광주시 북구',
      views: 445,
      status: '치료완료',
      treeType: '회화나무',
      emoji: '🌿',
      gradient: 'from-lime-100 via-green-100 to-emerald-100',
      content: `
        <h2>위험 요인 발견</h2>
        <p>마을 정자나무로 보호받고 있는 수령 150년의 회화나무. 정기 점검 중 주간 하부에 지름 40cm의 큰 동공이 발견되었습니다.</p>

        <h2>안전성 평가</h2>
        <ul>
          <li><strong>동공 크기:</strong> 직경 40cm, 깊이 80cm</li>
          <li><strong>잔존 벽:</strong> 평균 두께 8cm (수간 직경의 20%)</li>
          <li><strong>구조 안전도:</strong> 중간 위험 (강풍 시 파손 우려)</li>
          <li><strong>부패 진행:</strong> 내부 목재 갈색부패 진행 중</li>
          <li><strong>목재강도:</strong> 건전부 대비 60% 수준</li>
        </ul>

        <h2>치료 및 보강 작업</h2>
        <ol>
          <li><strong>부패재 제거:</strong> 동공 내부 부패 목재 완전 제거</li>
          <li><strong>살균 처리:</strong> 구리계 목재 방부제 도포</li>
          <li><strong>배수 처리:</strong> 동공 바닥에 배수구 설치</li>
          <li><strong>충전재 적용:</strong> 발포 우레탄으로 공간 충전</li>
          <li><strong>구조 보강:</strong> 강선 케이블링으로 주간 보강</li>
          <li><strong>외부 마감:</strong> 방수 처리 및 보호 도료 시공</li>
        </ol>

        <h2>사후 관리</h2>
        <p>구조 보강 작업이 완료되어 나무의 안전성이 크게 향상되었습니다. 동공 부위는 완전히 밀폐되어 추가 부패가 차단되었으며, 케이블링으로 강풍에도 안전한 구조를 확보했습니다.</p>

        <h2>모니터링 계획</h2>
        <p>노거수의 특성상 지속적인 관찰이 필요합니다. 연 2회 정기점검을 통해 케이블 장력, 동공 부위 상태, 전체적인 수세를 모니터링할 예정입니다.</p>
      `,
    },
  ];

  const post = posts.find((p) => p.id === parseInt(id));

  if (!post) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">게시글을 찾을 수 없습니다</h1>
          <button
            onClick={() => router.back()}
            className="text-amber-700 hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '양호':
        return 'bg-green-50 text-green-700 border-green-200';
      case '치료중':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case '치료완료':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-amber-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>목록으로</span>
        </button>

        {/* 헤더 이미지 */}
        <div className={`w-full h-80 rounded-3xl bg-gradient-to-br ${post.gradient} flex items-center justify-center mb-8 shadow-lg`}>
          <div className="text-center">
            <div className="text-9xl mb-4">{post.emoji}</div>
            <div className={`inline-block px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(post.status)}`}>
              {post.status}
            </div>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              나무진단
            </div>
            <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              {post.treeType}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>읽음 {post.views}</span>
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <article className="prose prose-lg max-w-none mb-12">
          <div
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.875rem',
              color: '#374151',
            }}
          />
        </article>

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
              <span className="text-sm font-medium">{isLiked ? '287' : '286'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">8</span>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#26422E] mb-6">댓글 8개</h2>

          {/* 댓글 작성 폼 */}
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <textarea
              placeholder="댓글을 입력하세요..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none mb-3"
            />
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors">
                댓글 작성
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {/* 샘플 댓글 1 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-semibold">박</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">박수목</span>
                    <span className="text-xs text-gray-500">2025-10-16</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    전문적인 진단과 처방 내용이 정말 인상적입니다. 저희 동네 느티나무도 비슷한 증상이 있는데 도움이 많이 되었어요.
                  </p>
                </div>
              </div>
            </div>

            {/* 샘플 댓글 2 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-semibold">최</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">최나무</span>
                    <span className="text-xs text-gray-500">2025-10-15</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    토양 개선으로 이렇게 빠른 회복이 가능하군요. 나무의사님의 세심한 처치 덕분이겠죠. 감사합니다!
                  </p>
                </div>
              </div>
            </div>

            {/* 샘플 댓글 3 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-semibold">정</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">정산림</span>
                    <span className="text-xs text-gray-500">2025-10-15</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    나무진단 사례를 이렇게 자세히 공유해주셔서 감사합니다. 많은 분들에게 도움이 될 것 같아요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <button
            onClick={() => router.push('/tree-diagnose')}
            className="w-full py-4 rounded-xl bg-white border-2 border-amber-700 text-amber-700 font-semibold hover:bg-amber-700 hover:text-white transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
