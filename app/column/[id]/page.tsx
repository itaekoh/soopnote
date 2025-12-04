'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calendar, Eye, Clock, ChevronLeft, BookOpen, Heart, Share2, MessageCircle } from 'lucide-react';

export default function ColumnDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isLiked, setIsLiked] = useState(false);

  // 임시 데이터 (나중에 Supabase에서 가져올 데이터)
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
      content: `
        <h2>회색 도시의 아침</h2>
        <p>아침 지하철을 타고 도심으로 향하는 길. 창밖으로 흘러가는 것은 무채색의 건물들과 콘크리트로 채워진 거리뿐입니다. 우리가 살아가는 도시는 언제부터 이렇게 회색빛으로 물들었을까요?</p>

        <p>도시화가 진행되면서 자연은 점점 우리 곁에서 멀어졌습니다. 나무는 공원이나 가로수로만 존재하고, 풀은 정해진 화단 안에서만 자랄 수 있습니다. 그러나 최근 몇 년간 도시에 초록을 되돌리려는 움직임이 전 세계적으로 확산되고 있습니다.</p>

        <h2>도시 숲의 중요성</h2>
        <p>도시 숲은 단순한 경관 요소가 아닙니다. 과학적으로 증명된 도시 숲의 효과는 놀랍습니다:</p>
        <ul>
          <li><strong>대기질 개선:</strong> 나무 한 그루는 연간 약 35.7kg의 이산화탄소를 흡수합니다</li>
          <li><strong>도시열섬 완화:</strong> 수목이 우거진 지역은 그렇지 않은 곳보다 2-8도 낮습니다</li>
          <li><strong>빗물 관리:</strong> 수목과 토양이 빗물을 흡수해 홍수 위험을 줄입니다</li>
          <li><strong>정신건강 증진:</strong> 녹지 접근성이 높을수록 우울증과 불안이 감소합니다</li>
        </ul>

        <h2>세계 도시들의 초록 혁명</h2>
        <p><strong>싱가포르</strong>는 '정원 속의 도시'에서 '도시 속의 정원'으로 발전했습니다. 건물 옥상과 벽면을 녹화하고, 고속도로 위에 공원을 조성했습니다. 현재 싱가포르의 녹지율은 47%에 달합니다.</p>

        <p><strong>밀라노</strong>의 보스코 베르티칼레(Bosco Verticale)는 아파트 외벽에 900그루의 나무를 심어 '수직 숲'을 만들었습니다. 이 건물은 연간 30톤의 이산화탄소를 흡수하고 19톤의 산소를 생산합니다.</p>

        <p><strong>서울</strong>도 변화하고 있습니다. 고가도로를 공원으로 바꾼 서울로7017, 하천을 복원한 청계천, 시민들이 만드는 자투리 공원 등 도심 곳곳에서 초록이 되살아나고 있습니다.</p>

        <h2>우리가 할 수 있는 일</h2>
        <p>거창한 프로젝트가 아니더라도, 우리 각자가 도시를 초록으로 물들일 수 있습니다:</p>
        <ol>
          <li><strong>베란다 정원:</strong> 작은 공간이라도 허브나 채소를 키워보세요</li>
          <li><strong>공동체 정원:</strong> 이웃과 함께 자투리땅을 가꾸는 공동체에 참여해보세요</li>
          <li><strong>가로수 입양:</strong> 집 앞 가로수를 관리하는 프로그램에 참여할 수 있습니다</li>
          <li><strong>옥상 녹화:</strong> 건물주라면 옥상을 정원으로 만들어보는 것은 어떨까요</li>
        </ol>

        <h2>초록의 미래를 향하여</h2>
        <p>도시의 초록화는 선택이 아닌 필수입니다. 기후위기 시대, 도시 숲은 우리의 생존과 직결된 인프라입니다. 회색 도시를 초록으로 바꾸는 일은 거대한 프로젝트처럼 보이지만, 작은 실천들이 모여 큰 변화를 만듭니다.</p>

        <p>오늘부터 시작해보는 건 어떨까요? 베란다에 화분 하나를 놓는 것, 출근길 가로수에 물을 주는 것, 동네 공원을 산책하는 것. 이 작은 행동들이 모여 우리 도시는 조금씩 초록으로 물들어갈 것입니다.</p>
      `,
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
      content: `
        <h2>나무가 보내는 신호</h2>
        <p>봄이 점점 빨리 오고 있습니다. 벚꽃 개화 시기는 100년 전보다 약 일주일 빨라졌습니다. 반대로 가을 단풍은 점점 늦게 찾아옵니다. 나무들은 기후변화를 온몸으로 감지하고, 우리에게 신호를 보내고 있습니다.</p>

        <h2>계절의 혼란</h2>
        <p>기후변화로 인한 계절의 변화는 나무의 생장 주기를 교란시킵니다. 이른 봄에 꽃을 피웠다가 뒤늦은 한파로 동해를 입거나, 따뜻한 겨울 날씨에 속아 너무 일찍 눈을 뜬 나무들이 고통받고 있습니다.</p>

        <ul>
          <li><strong>개화 시기 변화:</strong> 지난 50년간 평균 5.4일 앞당겨짐</li>
          <li><strong>낙엽 시기 지연:</strong> 단풍 시기가 평균 10일 늦어짐</li>
          <li><strong>생장 기간 연장:</strong> 식물의 생장 기간이 약 2주 길어짐</li>
        </ul>

        <h2>나무의 이동</h2>
        <p>기온이 상승하면서 나무들의 서식지도 변하고 있습니다. 온대 수종들이 점점 북쪽으로, 또는 높은 산으로 이동하고 있습니다. 한라산의 구상나무가 위기에 처한 것도 같은 이유입니다.</p>

        <p>제주도 한라산 정상부에만 자라던 구상나무는 기온 상승으로 서식지가 점점 좁아지고 있습니다. 더 높은 곳으로 올라갈 수 없는 나무들은 결국 사라질 위기에 놓였습니다.</p>

        <h2>새로운 병해충의 등장</h2>
        <p>따뜻해진 기후는 새로운 병해충의 확산을 가져왔습니다. 과거에는 추운 겨울이 자연적인 방제 역할을 했지만, 이제는 겨울에도 해충이 살아남아 봄에 대량 번식합니다.</p>

        <ul>
          <li><strong>소나무재선충:</strong> 남부 지방에서 중부 지방으로 확산</li>
          <li><strong>미국선녀벌레:</strong> 새롭게 유입되어 급속 확산</li>
          <li><strong>갈색날개매미충:</strong> 과수와 가로수 피해 증가</li>
        </ul>

        <h2>물 스트레스</h2>
        <p>기후변화는 강수 패턴도 바꾸고 있습니다. 봄 가뭄이 심해지고, 여름 장마는 집중호우로 바뀌었습니다. 나무들은 가뭄으로 수분 스트레스를 받다가, 갑작스런 폭우로 침수 피해를 입습니다.</p>

        <h2>나무가 전하는 메시지</h2>
        <p>나무들이 보내는 신호는 명확합니다. 지금 우리가 행동하지 않으면 돌이킬 수 없는 변화가 올 것이라는 경고입니다. 나무는 수십 년, 수백 년을 살아가는 생명체입니다. 그들이 겪는 변화는 우리가 앞으로 직면할 미래의 예고편입니다.</p>

        <h2>우리가 할 수 있는 일</h2>
        <p>기후변화 대응은 거대한 과제처럼 보이지만, 나무를 심고 가꾸는 것부터 시작할 수 있습니다. 나무는 이산화탄소를 흡수하는 가장 효과적인 자연 솔루션입니다.</p>

        <ol>
          <li>우리 동네에 나무를 심고 가꾸기</li>
          <li>기존 나무들의 건강을 지키기</li>
          <li>기후변화에 강한 수종 선택하기</li>
          <li>도시 숲과 녹지 확대 정책 지지하기</li>
        </ol>

        <p>나무들은 이미 우리에게 말하고 있습니다. 이제 우리가 들을 차례입니다.</p>
      `,
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
      content: `
        <h2>눈에 보이지 않는 고마움</h2>
        <p>출근길, 퇴근길 매일 지나치는 가로수. 우리는 그저 풍경의 일부로만 생각하지만, 가로수는 묵묵히 우리를 위해 일하고 있습니다.</p>

        <h2>가로수의 숨은 공헌</h2>
        <p><strong>1. 공기 정화</strong><br/>
        가로수는 천연 공기청정기입니다. 나무 잎은 미세먼지를 흡착하고, 광합성을 통해 산소를 만들어냅니다. 도심의 가로수가 없다면 대기질은 훨씬 더 나빠질 것입니다.</p>

        <p><strong>2. 도시열섬 완화</strong><br/>
        여름날 가로수 그늘 아래는 햇볕이 내리쬐는 곳보다 3-5도 시원합니다. 가로수가 많은 거리는 적은 거리보다 체감온도가 현저히 낮습니다.</p>

        <p><strong>3. 소음 감소</strong><br/>
        나무는 소음을 흡수합니다. 차량 통행이 많은 도로변의 가로수는 소음을 25-30% 줄여줍니다.</p>

        <p><strong>4. 빗물 관리</strong><br/>
        가로수와 그 주변 토양은 빗물을 흡수해 도시 홍수를 예방합니다. 또한 빗물이 도로로 직접 흘러가는 것을 막아 수질 오염도 줄입니다.</p>

        <h2>경제적 가치</h2>
        <p>미국 산림청의 연구에 따르면, 도시의 나무는 심는 비용의 2-5배에 달하는 경제적 가치를 창출합니다. 가로수가 많은 거리의 부동산 가격이 더 높고, 상업 지역의 매출도 더 높다는 연구 결과도 있습니다.</p>

        <h2>우리가 할 수 있는 일</h2>
        <p>가로수는 공공재산이지만, 우리 모두가 돌볼 수 있습니다:</p>
        <ul>
          <li>여름 가뭄 때 집 앞 가로수에 물 주기</li>
          <li>가로수 보호덮개나 지주대 파손 시 신고하기</li>
          <li>가로수 주변에 쓰레기 버리지 않기</li>
          <li>가로수 입양 프로그램 참여하기</li>
        </ul>

        <h2>작은 관심이 만드는 변화</h2>
        <p>다음에 가로수 아래를 지나갈 때, 잠시 멈춰 서서 나무를 바라보세요. 그 나무가 우리를 위해 하고 있는 일들을 생각해보세요. 그리고 가능하다면 작은 관심을 보여주세요. 물 한 바가지, 쓰레기 하나 줍기, 그것만으로도 충분합니다.</p>

        <p>우리 동네 가로수는 우리가 생각하는 것보다 훨씬 더 중요한 존재입니다.</p>
      `,
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
      content: `
        <h2>숲에서의 치유</h2>
        <p>숲에 들어가면 마음이 편안해지고 몸이 가벼워지는 느낌, 여러분도 경험해보셨나요? 이는 단순한 기분 탓이 아닙니다. 과학적으로 입증된 숲의 치유 효과입니다.</p>

        <h2>피톤치드의 마법</h2>
        <p>나무가 방출하는 피톤치드(Phytoncide)는 나무가 해충과 병균으로부터 자신을 보호하기 위해 만드는 물질입니다. 이 물질은 사람에게도 놀라운 효과를 발휘합니다.</p>

        <ul>
          <li><strong>면역력 증진:</strong> NK세포(자연살해세포) 활성도 50% 증가</li>
          <li><strong>스트레스 감소:</strong> 코르티솔 수치 12.4% 감소</li>
          <li><strong>혈압 안정:</strong> 수축기 혈압 평균 1.9% 감소</li>
          <li><strong>심박수 조절:</strong> 안정시 심박수 평균 5.8% 감소</li>
        </ul>

        <h2>오감을 통한 치유</h2>
        <p><strong>시각:</strong> 녹색은 눈의 피로를 풀어주고 정서적 안정을 가져옵니다. 자연의 불규칙한 패턴(프랙탈 구조)은 뇌에 휴식을 줍니다.</p>

        <p><strong>청각:</strong> 새소리, 바람 소리, 물소리 등 자연의 소리는 뇌파를 알파파 상태로 만들어 명상 효과를 가져옵니다.</p>

        <p><strong>후각:</strong> 피톤치드의 향기는 세로토닌 분비를 촉진해 우울감을 줄이고 행복감을 높입니다.</p>

        <p><strong>촉각:</strong> 나무를 만지거나 맨발로 흙을 밟는 것은 어싱(earthing) 효과를 통해 전자기적 균형을 회복시킵니다.</p>

        <h2>과학적 연구 결과</h2>
        <p>일본에서는 1980년대부터 산림욕(森林浴, Shinrin-yoku)을 공식 건강 프로그램으로 채택했습니다. 30년 이상의 연구 결과:</p>

        <ul>
          <li>주 2회, 회당 2시간 산림욕으로 면역력 30% 향상</li>
          <li>효과는 한 달간 지속됨</li>
          <li>우울증 환자의 증상 개선률 60%</li>
          <li>불면증 환자의 수면 질 향상 70%</li>
        </ul>

        <h2>도시에서 즐기는 산림욕</h2>
        <p>멀리 산에 가지 않아도 됩니다. 도시 공원도 충분한 효과를 줍니다:</p>

        <ol>
          <li><strong>주 2회 이상</strong> 가까운 공원 방문하기</li>
          <li><strong>최소 30분</strong> 천천히 걷기</li>
          <li><strong>스마트폰은 가방에</strong> 넣고 자연에 집중하기</li>
          <li><strong>오감으로 느끼기:</strong> 보고, 듣고, 냄새 맡고, 만지기</li>
          <li><strong>나무 아래서 쉬기:</strong> 벤치에 앉아 10분 명상</li>
        </ol>

        <h2>치유의 숲으로</h2>
        <p>숲은 약입니다. 의사의 처방전 없이도 누구나 이용할 수 있는 천연 치유제입니다. 스트레스에 지친 현대인에게 숲은 가장 효과적이고 부작용 없는 치료법일 수 있습니다.</p>

        <p>이번 주말, 가까운 숲이나 공원으로 산책을 떠나보는 것은 어떨까요? 숲이 당신을 치유할 것입니다.</p>
      `,
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
      content: `
        <h2>흙을 만지는 행위의 힘</h2>
        <p>정원을 가꾸는 것은 단순한 취미가 아닙니다. 흙을 만지고, 씨앗을 심고, 식물이 자라는 것을 지켜보는 이 모든 과정이 우리의 정신건강에 깊은 영향을 미칩니다.</p>

        <h2>원예치료의 과학</h2>
        <p>원예치료(Horticultural Therapy)는 전 세계 의료기관에서 공식적으로 인정하는 치료법입니다. 영국에서는 NHS(국민건강서비스)가 우울증 환자에게 정원 가꾸기를 처방하기도 합니다.</p>

        <ul>
          <li><strong>세로토�in 증가:</strong> 흙 속 미생물이 세로토닌 생성 촉진</li>
          <li><strong>코르티솔 감소:</strong> 30분 정원 활동으로 스트레스 호르몬 감소</li>
          <li><strong>도파민 분비:</strong> 수확의 기쁨이 보상 시스템 활성화</li>
          <li><strong>옥시토신 증가:</strong> 식물과의 교감이 애착 호르몬 분비</li>
        </ul>

        <h2>정원이 주는 심리적 효과</h2>
        <p><strong>1. 마음챙김(Mindfulness)</strong><br/>
        정원 가꾸기는 자연스럽게 현재에 집중하게 만듭니다. 잡초를 뽑고, 물을 주고, 흙을 만지는 동안 우리는 과거의 후회나 미래의 걱정에서 벗어나 지금 이 순간에 머물게 됩니다.</p>

        <p><strong>2. 성취감과 자존감</strong><br/>
        씨앗에서 싹이 트고, 꽃이 피고, 열매를 맺는 과정을 지켜보며 우리는 성취감을 느낍니다. 무언가를 키워낸다는 것은 자존감을 높여줍니다.</p>

        <p><strong>3. 통제감 회복</strong><br/>
        불확실한 세상에서 정원은 우리가 통제할 수 있는 작은 세계입니다. 물을 주고, 거름을 주고, 관리하는 것으로 결과를 만들어낼 수 있다는 경험은 무력감을 극복하게 합니다.</p>

        <h2>연구로 입증된 효과</h2>
        <p>네덜란드 바게닝겐대학 연구팀의 실험:</p>
        <ul>
          <li>스트레스 상황 후 30분 정원 활동 vs 30분 독서</li>
          <li>정원 활동 그룹의 코르티솔 수치가 유의미하게 낮음</li>
          <li>정원 활동 그룹이 더 긍정적인 기분 보고</li>
        </ul>

        <p>영국 엑서터대학 연구:</p>
        <ul>
          <li>주 1회 이상 정원 활동 시 우울증 위험 50% 감소</li>
          <li>정신건강 점수가 평균 12% 향상</li>
          <li>삶의 만족도 증가</li>
        </ul>

        <h2>작은 공간에서 시작하기</h2>
        <p>넓은 정원이 없어도 괜찮습니다. 베란다, 창가, 심지어 책상 위에서도 시작할 수 있습니다:</p>

        <ol>
          <li><strong>허브 키우기:</strong> 바질, 민트 등은 키우기 쉽고 향기로 힐링</li>
          <li><strong>다육이:</strong> 손이 많이 가지 않아 초보자에게 적합</li>
          <li><strong>방울토마토:</strong> 작은 화분에서도 키울 수 있고 수확의 기쁨</li>
          <li><strong>콩나물 키우기:</strong> 5일이면 수확, 빠른 성취감</li>
        </ol>

        <h2>정원은 치유의 공간</h2>
        <p>정원은 우리에게 인내를 가르칩니다. 급하게 자라게 할 수 없고, 매일 조금씩 돌봐야 합니다. 그 과정에서 우리는 자연의 리듬에 맞춰 느려지고, 여유를 찾고, 마음의 평화를 얻습니다.</p>

        <p>오늘부터 작은 화분 하나 들여놓는 것은 어떨까요? 그것이 당신의 정신건강을 돌보는 첫걸음이 될 수 있습니다.</p>
      `,
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
      content: `
        <h2>나무도 병원에 간다</h2>
        <p>사람이 아프면 병원에 가듯이, 나무가 아프면 누구를 불러야 할까요? 바로 나무의사입니다. 2018년부터 공식 국가자격증으로 인정받은 나무의사는 나무를 전문적으로 진단하고 치료하는 전문가입니다.</p>

        <h2>나무의사의 탄생</h2>
        <p>과거에는 조경업자나 산림기사가 나무 관리를 담당했습니다. 하지만 도시화가 진행되면서 나무가 겪는 문제도 복잡해졌습니다. 대기오염, 토양 오염, 병해충, 기후변화 등 다양한 스트레스 요인들이 나무를 위협했고, 전문적인 진단과 치료가 필요해졌습니다.</p>

        <p>2018년, '수목진료 등에 관한 법률'이 제정되며 나무의사가 공식 직업으로 탄생했습니다.</p>

        <h2>나무의사가 하는 일</h2>
        <p><strong>1. 수목 진단</strong></p>
        <ul>
          <li>외부 증상 관찰 (잎, 가지, 줄기, 뿌리)</li>
          <li>정밀 장비를 이용한 내부 진단 (저항측정기, 초음파 진단기)</li>
          <li>토양 분석 (pH, 영양분, 수분, 통기성)</li>
          <li>병원균 및 해충 동정</li>
        </ul>

        <p><strong>2. 치료 및 처방</strong></p>
        <ul>
          <li>병든 부위 제거 및 살균 처리</li>
          <li>영양제 및 약제 처방</li>
          <li>토양 개선 작업</li>
          <li>구조적 보강 (지주, 케이블링)</li>
        </ul>

        <p><strong>3. 예방 관리</strong></p>
        <ul>
          <li>정기 건강검진</li>
          <li>전정 작업 (가지치기)</li>
          <li>비료 시비</li>
          <li>병해충 예방</li>
        </ul>

        <p><strong>4. 위험수목 판정</strong></p>
        <ul>
          <li>쓰러질 위험이 있는 나무 진단</li>
          <li>안전성 평가</li>
          <li>제거 또는 보강 여부 결정</li>
        </ul>

        <h2>나무의사가 되려면</h2>
        <p>나무의사는 까다로운 자격요건을 갖춰야 합니다:</p>

        <ol>
          <li><strong>학력:</strong> 산림, 조경, 원예 관련 전공</li>
          <li><strong>경력:</strong> 수목진료 관련 실무경력 (학위에 따라 1~10년)</li>
          <li><strong>교육:</strong> 나무의사 양성기관에서 180시간 교육 이수</li>
          <li><strong>시험:</strong> 필기시험 (수목병리, 해충, 생리, 관리 등) 및 실기시험</li>
        </ol>

        <p>합격률은 약 30%로, 결코 쉽지 않은 자격증입니다.</p>

        <h2>나무의사의 일상</h2>
        <p>어느 나무의사의 하루:</p>

        <blockquote>
        "아침 9시, 노거수 정기점검 현장에 도착했습니다. 500년 된 느티나무의 건강상태를 확인하는 날입니다. 저항측정기로 내부 부패 정도를 측정하고, 토양 샘플을 채취합니다.

        오후에는 아파트 단지의 가로수 진단 의뢰가 왔습니다. 소나무 여러 그루가 시들어간다는 신고입니다. 현장에 가보니 재선충병이 의심됩니다. 즉시 샘플을 채취해 실험실로 보냅니다.

        저녁에는 내일 진행할 수술 준비를 합니다. 큰 동공이 발견된 은행나무의 부패재를 제거하고 구조 보강을 할 예정입니다."
        </blockquote>

        <h2>나무의사의 보람</h2>
        <p>나무의사들이 말하는 가장 큰 보람은 '생명을 살리는 것'입니다. 죽어가던 나무가 치료 후 다시 푸른 잎을 틀 때, 위험했던 나무가 안전하게 보강되어 계속 사람들에게 그늘을 제공할 때, 그들은 깊은 만족감을 느낍니다.</p>

        <h2>나무의사의 미래</h2>
        <p>기후변화와 도시화로 나무의사의 역할은 점점 중요해지고 있습니다. 현재 전국에 약 1,500명의 나무의사가 활동 중이며, 수요는 계속 증가하고 있습니다.</p>

        <p>나무를 사랑하고, 생명을 돌보는 일에 관심이 있다면, 나무의사는 의미 있는 직업 선택이 될 수 있습니다. 사람의 생명도 중요하지만, 수백 년을 살아온 나무의 생명도 그만큼 귀중하니까요.</p>
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
            className="text-purple-700 hover:underline"
          >
            목록으로 돌아가기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>목록으로</span>
        </button>

        {/* 헤더 이미지 */}
        <div className={`w-full h-80 rounded-3xl bg-gradient-to-br ${post.gradient} flex items-center justify-center mb-8 shadow-lg`}>
          <div className="text-center">
            <div className="text-9xl mb-4">{post.emoji}</div>
            <div className="inline-block px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 font-medium">
              {post.readTime} 읽기
            </div>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              칼럼
            </div>
            <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              {post.category}
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
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
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
              <span className="text-sm font-medium">{isLiked ? '513' : '512'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">15</span>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#26422E] mb-6">댓글 15개</h2>

          {/* 댓글 작성 폼 */}
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
            <textarea
              placeholder="댓글을 입력하세요..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-3"
            />
            <div className="flex justify-end">
              <button className="px-6 py-2 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors">
                댓글 작성
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {/* 샘플 댓글 1 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 font-semibold">강</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">강도시</span>
                    <span className="text-xs text-gray-500">2025-10-19</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    회색 도시를 초록으로 바꾸는 작은 실천들이 모여 큰 변화를 만든다는 말에 공감합니다. 저도 베란다 정원부터 시작해볼게요!
                  </p>
                </div>
              </div>
            </div>

            {/* 샘플 댓글 2 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 font-semibold">윤</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">윤숲길</span>
                    <span className="text-xs text-gray-500">2025-10-18</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    싱가포르와 밀라노 사례가 정말 인상적이네요. 우리나라 도시들도 더 많은 녹지를 확보했으면 좋겠어요.
                  </p>
                </div>
              </div>
            </div>

            {/* 샘플 댓글 3 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 font-semibold">서</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">서환경</span>
                    <span className="text-xs text-gray-500">2025-10-18</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    좋은 글 감사합니다. 도시 숲의 중요성을 다시 한번 깨닫게 되네요. 우리 아파트 공동체 정원 프로젝트에 참여해봐야겠어요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <button
            onClick={() => router.push('/column')}
            className="w-full py-4 rounded-xl bg-white border-2 border-purple-700 text-purple-700 font-semibold hover:bg-purple-700 hover:text-white transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
