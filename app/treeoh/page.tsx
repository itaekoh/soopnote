import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ScreenshotCarousel from './ScreenshotCarousel';

export const metadata: Metadata = {
  title: '트리오 Tree-Oh! — 나무의사 시험 대비 수목 퀴즈 앱 | Soopnote',
  description:
    '나무의사·산림기사·조경기사 수험생을 위한 무료 수목 퀴즈 앱. 약 700 문제, 약 300 수종을 사진으로 학습하고 오답 복습, 찜하기, 학습 통계로 약점을 정복하세요. Android 무료 다운로드.',
  keywords: [
    '트리오',
    'Tree-Oh',
    '트리오 앱',
    '나무의사 시험',
    '나무의사 실기시험',
    '수종 공부법',
    '나무의사 수목감별',
    '수목 퀴즈',
    '수목 사진 퀴즈',
    '나무 이름 맞추기',
    '나무 이름 퀴즈',
    '수목감별',
    '수목도감',
    '수목 식별',
    '조경기사',
    '산림기사',
    '식물 학습',
    '나무 공부',
    '나무 사진',
  ],
  authors: [{ name: 'Soopnote', url: 'https://www.soopnote.com' }],
  creator: 'Soopnote',
  publisher: 'Soopnote',
  openGraph: {
    title: '트리오 Tree-Oh! — 나무의사 시험 대비 수목 퀴즈 앱',
    description:
      '약 700 수목 사진 퀴즈로 나무 이름 학습. 오답 복습 · 찜하기 · 학습 통계까지. Android 무료.',
    url: 'https://www.soopnote.com/treeoh',
    siteName: 'Soopnote',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: 'https://www.soopnote.com/screen/screen1.jpg',
        width: 1080,
        height: 2340,
        alt: '트리오 — 수목 퀴즈 앱 홈 화면',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '트리오 Tree-Oh! — 나무의사 시험 대비 수목 퀴즈 앱',
    description:
      '약 700 수목 사진 퀴즈, 오답 복습, 찜하기, 학습 통계. Android 무료.',
    images: ['https://www.soopnote.com/screen/screen1.jpg'],
  },
  alternates: {
    canonical: 'https://www.soopnote.com/treeoh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.soopify.tree.quiz';

// ─────────────────────────────────────────────
// Schema.org 구조화 데이터 (SEO + AI 검색 노출)
// ─────────────────────────────────────────────
const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: '트리오 Tree-Oh!',
  alternateName: ['트리오 앱', 'TreeOh!', '나무의사 트리오'],
  operatingSystem: 'Android',
  applicationCategory: 'EducationalApplication',
  description:
    '나무의사·산림기사·조경기사 시험 대비를 위한 수목 퀴즈 앱. 약 700 문제와 약 300 수종을 사진으로 학습하고 오답 복습·찜하기·학습 통계 기능을 제공합니다.',
  offers: [
    {
      '@type': 'Offer',
      name: '무료',
      price: '0',
      priceCurrency: 'KRW',
      description: '일 10문항 무료, 광고 시청 시 추가 가능',
    },
    {
      '@type': 'Offer',
      name: '프리미엄 월간',
      price: '3000',
      priceCurrency: 'KRW',
      description: '무제한 문항, 광고 제거, 오답 즉시 복습',
    },
    {
      '@type': 'Offer',
      name: '프리미엄 연간',
      price: '25000',
      priceCurrency: 'KRW',
      description: '연간 결제로 약 30% 할인',
    },
  ],
  installUrl: PLAY_STORE_URL,
  downloadUrl: PLAY_STORE_URL,
  inLanguage: 'ko',
  provider: {
    '@type': 'Organization',
    name: 'Soopnote',
    url: 'https://www.soopnote.com',
    logo: 'https://www.soopnote.com/logo.png',
  },
  featureList: [
    '사진으로 나무 이름 맞추기',
    '4지선다 객관식 / 주관식 / 혼합 모드',
    '오답 자동 복습',
    '문제 찜하기 (즐겨찾기)',
    '잘 아는 문제 출제 빈도 낮추기',
    '학습 통계 (정답률, 학습 이력)',
    '카테고리별 필터 (전경·수피·잎·꽃·열매·동아)',
    '나무의사 시험 출제 기준 반영',
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '트리오는 어떤 앱인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '트리오(Tree-Oh!)는 사진으로 나무 이름을 맞추는 수목 학습 퀴즈 앱입니다. 나무의사·산림기사·조경기사 등 자격증 시험의 수목감별 영역 대비에 특화되어 있으며, 일반 자연 학습자도 사용할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '나무의사 시험 대비에 도움이 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네. 나무의사 시험 수목감별 출제 기준을 참고하여 수종을 선별·등록하였고, 전경·수피·나뭇잎·꽃·열매·동아 등 카테고리별로 학습할 수 있습니다. 오답 복습과 학습 통계로 약점을 빠르게 보완할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '몇 종류의 나무와 문제가 등록되어 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '약 300종의 수목과 약 700개의 문제가 등록되어 있으며 계속 추가되고 있습니다. 같은 수종이라도 전경·수피·잎·꽃·열매 등 다양한 부위 사진으로 학습 가능합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '무료로 사용 가능한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네. 무료로 일 10문항을 풀 수 있고, 광고 시청으로 추가 문항을 얻을 수 있습니다. 광고 없이 무제한으로 사용하려면 월 ₩3,000 또는 연 ₩25,000의 프리미엄 구독이 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'iOS(아이폰)에서도 사용 가능한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '현재는 Android 전용으로 출시되어 있습니다. iOS 버전은 향후 검토 예정이며, 그 전에는 웹 페이지의 "오늘의 퀴즈"를 통해 일부 기능을 사용하실 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '찜하기 기능은 어떻게 활용하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '퀴즈 풀이 화면에서 별 표시를 누르면 문제가 찜 목록에 저장됩니다. 복습 탭의 "찜한 문제" 섹션에서 언제든 다시 풀 수 있어 헷갈리는 수종을 집중 학습하기 좋습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '구독은 어떻게 해지하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Play 스토어 → 우상단 프로필 → "결제 및 정기결제" → "정기결제" → 트리오 → "정기결제 취소"로 언제든 해지할 수 있습니다. 해지 후에도 결제하신 기간(만료일) 까지는 정상 사용 가능합니다.',
      },
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '트리오 앱 시작하기',
  description: '트리오 수목 퀴즈 앱을 설치하고 학습을 시작하는 방법.',
  totalTime: 'PT2M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Play 스토어에서 설치',
      text: 'Android Play 스토어에서 "나무의사 트리오"를 검색하거나, soopnote.com/treeoh의 다운로드 버튼을 통해 설치합니다.',
      url: PLAY_STORE_URL,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '로그인 또는 게스트 시작',
      text: '구글·카카오·이메일 중 하나로 로그인하거나, 회원가입 없이 게스트로 바로 시작할 수 있습니다.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '퀴즈 옵션 선택',
      text: '문항 수(5/10/20), 출제 모드(객관식·주관식·혼합), 사진 유형(전경·수피·잎·꽃·열매 등)을 자유롭게 설정합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '문제 풀고 복습',
      text: '사진을 보고 정답을 고르거나 입력합니다. 틀린 문제는 자동으로 오답 노트에 저장되어 복습 탭에서 다시 풀 수 있습니다.',
    },
  ],
};

const features = [
  {
    emoji: '🎯',
    title: '다양한 퀴즈 옵션',
    desc: '문항 수, 출제 범위, 사진 유형(전경·수피·잎·꽃·열매·동아)을 자유롭게 설정해 나만의 학습 플랜을 만드세요.',
  },
  {
    emoji: '🔄',
    title: '오답 자동 복습',
    desc: '틀린 문제만 모아 다시 풀 수 있어 반복 학습으로 취약 수종을 빠르게 정복합니다.',
  },
  {
    emoji: '⭐',
    title: '문제 찜하기',
    desc: '헷갈리거나 다시 보고 싶은 문제는 찜해두고, 복습 탭에서 모아서 풀어보세요.',
  },
  {
    emoji: '🙈',
    title: '잘 아는 문제 덜 보기',
    desc: '이미 익숙한 문제는 표시해두면 출제 빈도가 크게 낮아집니다. 아직 헷갈리는 수종 위주로 효율적으로 학습하세요.',
  },
  {
    emoji: '📊',
    title: '학습 통계',
    desc: '정답률, 학습 이력, 풀이 횟수를 한눈에 확인하고 성장 과정을 기록합니다.',
  },
];

const stats = [
  { value: '약 300', label: '등록 수종' },
  { value: '약 700', label: '학습 문제' },
  { value: '7', label: '사진 카테고리' },
  { value: '무료', label: '기본 사용' },
];

const audiences = [
  {
    title: '나무의사 수험생',
    desc: '수목감별 영역의 효율적인 반복 학습',
  },
  {
    title: '산림·조경기사 준비자',
    desc: '실기 시험 대비 수종 식별 훈련',
  },
  {
    title: '자연/식물 학습자',
    desc: '취미·교양 차원의 나무 식별 학습',
  },
  {
    title: '교사·강사',
    desc: '식물 수업 보조 자료로 활용',
  },
];

// 실기시험 수종 공부법 (블로그 홍보글 흡수)
const studyTips = [
  {
    no: '①',
    title: '다양한 사진 반복',
    desc: '같은 사진이 아니라 여러 각도·부위를 봐야 실전에서 헷갈리지 않습니다.',
  },
  {
    no: '②',
    title: '틀린 것 집중',
    desc: '아는 것 말고, 혼동되는 수종만 골라 반복하세요.',
  },
  {
    no: '③',
    title: '빠른 판단',
    desc: '사진을 보고 즉시 이름을 떠올리는 연습이 실기 합격을 좌우합니다.',
  },
];

const faqs = [
  {
    q: '트리오는 어떤 앱인가요?',
    a: '사진으로 나무 이름을 맞추는 수목 학습 퀴즈 앱입니다. 나무의사·산림기사·조경기사 자격증의 수목감별 영역 대비에 특화되어 있으며, 일반 자연 학습자도 사용할 수 있습니다.',
  },
  {
    q: '나무의사 시험 대비에 도움이 되나요?',
    a: '네. 나무의사 시험 수목감별 출제 기준을 참고해 수종을 선별·등록했고, 전경·수피·나뭇잎·꽃·열매·동아 등 카테고리별 학습이 가능합니다.',
  },
  {
    q: '몇 종류의 나무와 문제가 등록되어 있나요?',
    a: '약 300종의 수목과 약 700개의 문제가 등록되어 있으며 계속 추가되고 있습니다.',
  },
  {
    q: '무료로 사용 가능한가요?',
    a: '네. 무료로 일 10문항, 광고 시청 시 추가 문항이 가능합니다. 무제한·광고 제거가 필요하면 월 ₩3,000 또는 연 ₩25,000 프리미엄 구독이 있습니다.',
  },
  {
    q: 'iOS(아이폰)에서도 사용 가능한가요?',
    a: '현재 Android 전용입니다. iOS는 향후 검토 중이며, 그 전에는 웹의 "오늘의 퀴즈"로 일부 기능을 사용할 수 있습니다.',
  },
  {
    q: '찜하기 기능은 어떻게 활용하나요?',
    a: '퀴즈 풀이 중 별 표시를 누르면 문제가 찜 목록에 저장됩니다. 복습 탭의 "찜한 문제"에서 언제든 다시 풀 수 있어 헷갈리는 수종을 집중 학습할 수 있습니다.',
  },
  {
    q: '구독은 어떻게 해지하나요?',
    a: 'Play 스토어 → 프로필 → "결제 및 정기결제" → 트리오 → "정기결제 취소"로 언제든 해지 가능하며, 결제하신 기간 만료일까지는 정상 사용됩니다.',
  },
];

export default function TreeohPage() {
  return (
    <>
      {/* 구조화 데이터: SEO + 생성형 AI(GEO) 인식 강화 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <Header />
      <div className="min-h-screen bg-[#F5F3EE]">
        {/* ── Hero ── */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <div className="text-6xl mb-4" aria-hidden="true">
            🌳
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            트리오 <span className="text-green-700">Tree-Oh!</span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            나무의사 시험 대비 수목 퀴즈 앱
          </p>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
            700여 개의 수목 사진 문제로 나무 이름을 익히고,
            <br />
            오답 복습·찜하기·학습 통계로 약점을 정복하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Google Play에서 트리오 앱 다운로드"
            >
              Google Play에서 다운로드
            </a>
            <Link
              href="/quiz"
              className="px-8 py-3.5 bg-green-700 text-white font-medium rounded-2xl hover:bg-green-800 transition-colors shadow-md"
            >
              웹에서 오늘의 퀴즈 풀어보기
            </Link>
          </div>
        </section>

        {/* ── Stats ── */}
        <section
          className="max-w-4xl mx-auto px-4 py-8"
          aria-label="트리오 앱 통계"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl shadow-sm p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-green-700 font-medium mt-4">
            🌱 콘텐츠는 꾸준히 추가되고 있습니다
          </p>
        </section>

        {/* ── Features ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl shadow-sm p-6 text-center"
              >
                <div className="text-4xl mb-3" aria-hidden="true">
                  {f.emoji}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For Whom ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            누구에게 도움이 될까요?
          </h2>
          <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
            수목감별이 필요한 모든 분들을 위해 설계됐습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="bg-white rounded-xl p-5 border border-green-100"
              >
                <h3 className="font-bold text-gray-900 mb-1">✓ {a.title}</h3>
                <p className="text-sm text-gray-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 수종 공부법 (실기시험 대비) ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            수종 공부, 왜 어려울까?
          </h2>
          <p className="text-center text-gray-600 mb-8 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            나무의사·산림·조경 실기시험에서는 실제 나무를 보고 이름을 맞춰야 합니다.
            책으로 외우는 데는 한계가 있고, 결국 사진을 보고 바로 떠올릴 수 있어야 합니다.
          </p>

          <div className="max-w-2xl mx-auto mb-10 bg-green-50 border-l-4 border-green-600 rounded-r-xl px-5 py-4 text-green-800 text-sm sm:text-base">
            💬 <strong>&ldquo;아는데 이름이 기억 안 나는 상황&rdquo;</strong> — 이걸 없애는 것이 수종 공부의 핵심입니다.
          </div>

          <h3 className="text-lg font-bold text-gray-900 text-center mb-6">
            효율적인 공부법
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {studyTips.map((t) => (
              <div key={t.title} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="text-2xl font-bold text-green-700 mb-2" aria-hidden="true">
                  {t.no}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{t.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-700 mt-8 text-sm sm:text-base leading-relaxed">
            트리오는 이 세 가지를 그대로 훈련하도록 만들었습니다 —
            <br className="hidden sm:block" />
            다양한 각도의 사진, 오답 집중 복습, 빠른 판단 훈련.
          </p>
        </section>

        {/* ── How to Start ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            시작하는 방법
          </h2>
          <ol className="space-y-4 max-w-2xl mx-auto">
            <li className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Play 스토어에서 설치
                </h3>
                <p className="text-sm text-gray-600">
                  Android 기기에서 "나무의사 트리오"를 검색하거나 위 다운로드
                  버튼을 누르세요.
                </p>
              </div>
            </li>
            <li className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  로그인 또는 게스트 시작
                </h3>
                <p className="text-sm text-gray-600">
                  구글·카카오·이메일 로그인, 또는 회원가입 없이 게스트로
                  바로 시작할 수 있습니다.
                </p>
              </div>
            </li>
            <li className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">옵션 선택</h3>
                <p className="text-sm text-gray-600">
                  문항 수(5/10/20), 출제 모드(객관식·주관식·혼합), 사진
                  유형을 자유롭게 설정하세요.
                </p>
              </div>
            </li>
            <li className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm">
              <span className="flex-shrink-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  풀이 후 자동 복습
                </h3>
                <p className="text-sm text-gray-600">
                  틀린 문제는 자동으로 오답 노트에 저장되고, 찜한 문제는
                  복습 탭에서 언제든 다시 풀 수 있습니다.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── Screenshots ── */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            앱 미리보기
          </h2>
          <ScreenshotCarousel />
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            자주 묻는 질문
          </h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="bg-white rounded-xl p-5 shadow-sm group"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Q. {f.q}</span>
                  <span className="text-green-700 ml-2 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-8 sm:p-10 border border-green-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              지금 바로 시작하세요
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              무료로 다운로드하고 나무의사 시험을 준비하세요.
            </p>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-colors shadow-md"
            >
              Google Play에서 다운로드
            </a>
            <p className="mt-6 text-xs text-gray-400">
              오류 신고는 Play Store 리뷰 또는{' '}
              <Link href="/contact" className="underline hover:text-gray-600">
                문의 페이지
              </Link>
              를 이용해 주세요.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
