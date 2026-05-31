import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '조경기능사 수목감별 완벽 가이드 — 합격 전략 & 학습 앱 추천 | Soopnote',
  description:
    '조경기능사 실기 수목감별 영역 합격 가이드. 출제 수종, 효율적인 학습법, 사진 퀴즈로 빠르게 외우는 방법. 무료 학습 앱 트리오(Tree-Oh!) 활용법까지 한 번에 정리.',
  keywords: [
    '조경기능사 수목감별',
    '조경기능사 실기',
    '조경기능사',
    '조경기능사 합격',
    '조경기능사 공부법',
    '수목감별',
    '수목감별 공부법',
    '수목감별 시험',
    '나무 이름 외우기',
    '조경 수목 사진',
    '조경기능사 수목 100선',
    '조경 자격증',
    '나무의사',
    '산림기사',
    '조경 수험생',
    '트리오 앱',
  ],
  authors: [{ name: 'Soopnote', url: 'https://www.soopnote.com' }],
  openGraph: {
    title: '조경기능사 수목감별 완벽 가이드 — 합격 전략 & 학습 앱',
    description:
      '출제 수종부터 효율 학습법까지. 사진 퀴즈 앱 트리오로 단기간 합격하기.',
    url: 'https://www.soopnote.com/landscape-craftsman',
    siteName: 'Soopnote',
    type: 'article',
    locale: 'ko_KR',
    images: [
      {
        url: 'https://www.soopnote.com/screen/screen1.jpg',
        width: 1080,
        height: 2340,
        alt: '트리오 — 수목감별 학습 앱',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '조경기능사 수목감별 완벽 가이드',
    description: '출제 수종 + 학습법 + 사진 퀴즈 앱 활용 전략',
    images: ['https://www.soopnote.com/screen/screen1.jpg'],
  },
  alternates: {
    canonical: 'https://www.soopnote.com/landscape-craftsman',
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
const TREEOH_URL = 'https://www.soopnote.com/treeoh';

// ─────────────────────────────────────────────
// 구조화 데이터 — SEO + 생성형 AI 인식 강화
// ─────────────────────────────────────────────

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '조경기능사 수목감별 완벽 가이드 — 합격 전략 & 학습 앱 추천',
  description:
    '조경기능사 실기 시험 수목감별 영역의 출제 수종, 효율적인 학습 방법, 사진 퀴즈 앱을 활용한 단기 합격 전략을 정리합니다.',
  author: {
    '@type': 'Organization',
    name: 'Soopnote',
    url: 'https://www.soopnote.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Soopnote',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.soopnote.com/logo.png',
    },
  },
  datePublished: '2026-05-31',
  dateModified: '2026-05-31',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.soopnote.com/landscape-craftsman',
  },
  image: 'https://www.soopnote.com/screen/screen1.jpg',
  inLanguage: 'ko',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '조경기능사 수목감별은 몇 종을 외워야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '조경기능사 실기 수목감별 영역은 약 100여 종의 조경 수목을 식별할 수 있어야 합니다. 시험 회차별로 출제 수종이 일부 달라지지만, 자주 출제되는 핵심 50종을 중심으로 학습하면서 점차 범위를 넓혀 가는 전략이 효율적입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '조경기능사 수목감별 시험은 어떻게 출제되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '수목감별은 실기 시험의 한 영역으로, 출제되는 수목의 사진(전경, 수피, 잎, 꽃, 열매 등)을 보고 정확한 수종명을 적는 방식입니다. 부분 부위 사진만으로 식별해야 하는 경우가 많아 사진을 통한 반복 학습이 매우 중요합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수목감별을 가장 효율적으로 공부하는 방법은?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '책으로만 외우기보다 사진을 보고 즉시 이름을 맞추는 반복 학습이 가장 효과적입니다. 사진 퀴즈 앱(예: 트리오 Tree-Oh!)을 활용해 출퇴근·이동 시간에 짧게 반복하고, 틀린 수종을 오답 노트로 모아 집중 복습하는 방식이 합격률을 크게 높입니다.',
      },
    },
    {
      '@type': 'Question',
      name: '수피와 잎 중 어떤 사진이 더 자주 출제되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '시험에서는 부위를 가리지 않고 다양하게 출제되지만, 전경(나무 전체)과 잎 사진이 비교적 많이 출제되는 편입니다. 다만 수피, 꽃, 열매, 동아(겨울눈) 사진으로 식별해야 하는 경우도 있으므로 모든 부위를 골고루 학습해 두는 것이 안전합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '조경기능사와 조경산업기사·기사 수목감별 차이는?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '조경기능사는 기초 수목 100여 종 식별에 중점이 있고, 조경산업기사·기사는 출제 범위가 더 넓고 식별이 더 까다로운 수종이 포함됩니다. 조경기능사 합격을 목표로 한 학습은 상위 자격증 준비에도 그대로 활용 가능한 단단한 기초가 됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: '트리오(Tree-Oh!) 앱이 조경기능사 수목감별에 효과적인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네. 트리오 앱은 사진으로 나무 이름을 맞추는 학습에 특화되어 있어 조경기능사 수목감별 영역에 매우 효과적입니다. 500개 이상의 수목 사진 문제, 카테고리별(전경·수피·잎·꽃·열매·동아) 학습, 오답 자동 복습, 찜하기, 학습 통계 기능으로 합격까지 필요한 핵심 학습 흐름을 한 앱에서 해결할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '트리오 앱은 유료인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '무료로 일 10문항까지 풀 수 있고, 광고 시청으로 추가 문항을 얻을 수 있습니다. 무제한 학습과 광고 제거가 필요하면 월 ₩3,000 또는 연 ₩25,000의 프리미엄 구독이 있습니다.',
      },
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '조경기능사 수목감별 학습 4단계',
  description: '사진 퀴즈를 활용한 조경기능사 수목감별 효율 학습 방법.',
  totalTime: 'P30D',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '핵심 수종 50종 먼저 익히기',
      text: '출제 빈도가 높은 핵심 수종 50종을 먼저 사진으로 익힙니다. 한꺼번에 100종을 외우려 하지 말고, 검증된 핵심 수종부터 익히면 빠르게 정답률이 오릅니다.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '카테고리별 반복 학습 (전경·잎·수피·꽃·열매)',
      text: '같은 수종이라도 부위마다 다르게 보이므로, 전경 → 잎 → 수피 → 꽃 → 열매 순으로 부위를 바꿔가며 반복 학습합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '오답 노트 + 찜한 수종 집중 복습',
      text: '틀린 수종과 헷갈리는 수종을 따로 모아 집중 복습합니다. 트리오 앱은 오답 자동 저장과 찜하기 기능으로 이 과정을 자동화합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '시험 2주 전 모의 시험 + 약점 보완',
      text: '시험 2주 전부터는 모의 시험 형태로 시간 안에 답하기, 학습 통계로 약점 분야 확인 후 집중 학습합니다.',
    },
  ],
};

// ─────────────────────────────────────────────
// 컨텐츠 데이터
// ─────────────────────────────────────────────

const examOverview = [
  { label: '시험 유형', value: '실기 시험 내 수목감별 영역' },
  { label: '출제 범위', value: '조경 수목 약 100여 종' },
  { label: '출제 형태', value: '사진을 보고 수종명 작성' },
  { label: '핵심 부위', value: '전경, 수피, 잎, 꽃, 열매, 동아' },
];

const studySteps = [
  {
    n: 1,
    title: '핵심 수종 50종 먼저 익히기',
    desc: '한꺼번에 100종을 외우려 하지 마세요. 빈출 핵심 50종부터 익히면 정답률이 빠르게 오릅니다.',
  },
  {
    n: 2,
    title: '카테고리별 부위 학습',
    desc: '같은 수종도 부위마다 다르게 보입니다. 전경 → 잎 → 수피 → 꽃 → 열매 순으로 반복합니다.',
  },
  {
    n: 3,
    title: '오답·찜 집중 복습',
    desc: '틀리거나 헷갈리는 수종은 따로 모아 반복. 사진 퀴즈 앱이 이 과정을 자동화해 줍니다.',
  },
  {
    n: 4,
    title: '시험 2주 전 모의 + 약점 보완',
    desc: '학습 통계로 약점을 확인하고, 부족한 카테고리·수종을 집중 학습합니다.',
  },
];

const whyTreeoh = [
  {
    emoji: '🎯',
    title: '카테고리별 학습',
    desc: '전경·수피·잎·꽃·열매·동아 카테고리로 시험 출제 부위와 동일하게 학습',
  },
  {
    emoji: '🔄',
    title: '오답 자동 복습',
    desc: '틀린 수종이 자동으로 오답 노트에 저장되어 약점만 집중 학습',
  },
  {
    emoji: '⭐',
    title: '문제 찜하기',
    desc: '헷갈리는 수종은 찜해두고 시험 직전 집중 복습',
  },
  {
    emoji: '📊',
    title: '학습 통계',
    desc: '정답률·학습 이력으로 약점 분야를 한눈에 파악',
  },
];

const faqs = [
  {
    q: '조경기능사 수목감별은 몇 종을 외워야 하나요?',
    a: '약 100여 종의 조경 수목을 식별할 수 있어야 합니다. 회차마다 일부 차이가 있으니 핵심 50종 → 100종으로 확장 학습이 효율적입니다.',
  },
  {
    q: '수목감별 시험 출제 형태는?',
    a: '수목의 사진(전경·수피·잎·꽃·열매 등)을 보고 정확한 수종명을 적는 방식입니다. 부분 부위 사진만으로 식별해야 하는 경우가 많아 사진 반복 학습이 필수입니다.',
  },
  {
    q: '효율적인 공부 방법이 있나요?',
    a: '책으로만 외우기보다 사진을 보고 즉시 답하는 반복 학습이 가장 효과적입니다. 사진 퀴즈 앱으로 이동 시간에 짧게 반복하고, 오답 노트로 약점을 집중 학습하세요.',
  },
  {
    q: '어떤 부위 사진이 자주 출제되나요?',
    a: '전경과 잎이 비교적 많지만, 수피·꽃·열매·동아도 출제됩니다. 모든 부위를 골고루 학습해 두는 것이 안전합니다.',
  },
  {
    q: '조경기능사와 산업기사·기사의 수목감별 차이는?',
    a: '조경기능사는 기초 100여 종 중심, 상위 자격증은 범위가 넓고 까다롭습니다. 조경기능사 학습은 상위 자격증 준비의 단단한 기초가 됩니다.',
  },
  {
    q: '트리오 앱이 조경기능사 수목감별에 효과적인가요?',
    a: '네. 사진 퀴즈 중심 설계로 시험 출제 형태와 동일한 학습이 가능합니다. 500+ 사진 문제, 카테고리별 학습, 오답 복습, 찜하기, 통계까지 합격에 필요한 흐름을 한 앱에서 해결합니다.',
  },
  {
    q: '트리오 앱은 유료인가요?',
    a: '무료로 일 10문항까지 가능, 광고 시청 시 추가 문항을 얻을 수 있습니다. 무제한·광고 제거는 월 ₩3,000 또는 연 ₩25,000의 프리미엄 구독이 있습니다.',
  },
];

export default function LandscapeCraftsmanPage() {
  return (
    <>
      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
      <article className="min-h-screen bg-[#F5F3EE]">
        {/* ── Hero ── */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-4">
            조경기능사 합격 가이드
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            조경기능사 수목감별 완벽 가이드
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium mb-3">
            출제 수종 · 학습법 · 합격 전략을 한 번에
          </p>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            조경기능사 실기 시험의 핵심, 수목감별 영역. 100여 종의 수목을
            사진으로 익혀야 하는 이 영역을 효율적으로 정복하는 방법과
            검증된 학습 앱을 소개합니다.
          </p>
        </section>

        {/* ── 시험 개요 ── */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            🌳 수목감별 시험 한눈에 보기
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {examOverview.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl shadow-sm p-5"
              >
                <div className="text-xs font-medium text-green-700 mb-1">
                  {item.label}
                </div>
                <div className="text-gray-900 font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 왜 어려운가 ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            왜 수목감별이 어려울까?
          </h2>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3 text-gray-700 leading-relaxed">
            <p>
              <strong className="text-gray-900">1. 100여 종의 다양한 수목.</strong>{' '}
              비슷하게 생긴 수종이 많아 책 한두 번 읽고 외우기 어렵습니다.
            </p>
            <p>
              <strong className="text-gray-900">2. 부분 부위 사진 출제.</strong>{' '}
              전경뿐 아니라 잎·수피·꽃·열매·동아 등 일부 부위 사진만으로
              식별해야 하는 경우가 많습니다.
            </p>
            <p>
              <strong className="text-gray-900">3. 계절·환경에 따른 변화.</strong>{' '}
              같은 수종도 봄·여름·가을 모습이 달라 시각적 기억만으로는
              한계가 있습니다.
            </p>
            <p>
              <strong className="text-gray-900">4. 반복 학습 도구 부족.</strong>{' '}
              종이 도감만으로는 사진 → 이름 → 즉시 피드백 사이클이
              느려 학습 효율이 떨어집니다.
            </p>
          </div>
        </section>

        {/* ── 학습 단계 ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            📚 효율 학습 4단계
          </h2>
          <ol className="space-y-4 max-w-2xl mx-auto">
            {studySteps.map((s) => (
              <li
                key={s.n}
                className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm"
              >
                <span className="flex-shrink-0 w-9 h-9 bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 트리오 앱 활용 ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 sm:p-10 border border-green-100">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🌲</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                트리오 Tree-Oh! — 수목감별에 특화된 학습 앱
              </h2>
              <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto">
                조경기능사 수목감별 시험 출제 형태와 동일한
                <br />
                <strong>사진 → 이름 맞히기</strong> 학습이 한 앱에서 가능합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {whyTreeoh.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-xl p-5 flex gap-3 items-start"
                >
                  <div className="text-3xl flex-shrink-0">{f.emoji}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-colors text-center"
              >
                Google Play에서 무료 다운로드
              </a>
              <Link
                href={TREEOH_URL}
                className="px-8 py-3.5 bg-white text-green-700 font-medium rounded-2xl border-2 border-green-700 hover:bg-green-50 transition-colors text-center"
              >
                트리오 앱 자세히 보기 →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 다른 자격증에도 ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            ✓ 이런 자격증 준비에도 활용됩니다
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {['조경기능사', '조경산업기사', '조경기사', '나무의사', '산림기사', '산림산업기사', '산림기능사', '식물도감 학습'].map(
              (cert) => (
                <div
                  key={cert}
                  className="bg-white rounded-xl py-3 px-2 text-sm font-medium text-gray-700 border border-gray-100"
                >
                  {cert}
                </div>
              ),
            )}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            기초 수종 식별 능력은 모든 식물 관련 자격증의 공통 기반입니다.
          </p>
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
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 border border-green-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              사진으로 외우면 합격이 빨라집니다
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              조경기능사 수목감별, 책으로만 외우지 마세요.
              <br />
              사진 퀴즈 앱으로 매일 짧게 반복하면 합격이 손에 잡힙니다.
            </p>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-green-700 text-white font-medium rounded-2xl hover:bg-green-800 transition-colors shadow-md"
            >
              무료로 시작하기 — Google Play
            </a>
            <p className="mt-6 text-xs text-gray-400">
              트리오 앱은 무료로 시작 가능합니다 ·{' '}
              <Link
                href={TREEOH_URL}
                className="underline hover:text-gray-600"
              >
                앱 자세히 보기
              </Link>
            </p>
          </div>
        </section>
      </article>
      <Footer />
    </>
  );
}
