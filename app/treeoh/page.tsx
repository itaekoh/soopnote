import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ScreenshotCarousel from './ScreenshotCarousel';

export const metadata: Metadata = {
  title: '트리오 - 나무의사 시험 대비 수목 퀴즈 앱 | Soopnote',
  description:
    '트리오(Tree-Oh!)는 나무의사 시험 대비를 위한 수목 퀴즈 앱입니다. 사진으로 나무 이름 맞추기, 오답 복습, 학습 통계까지!',
  keywords: [
    '트리오',
    '나무의사 시험',
    '수목 퀴즈',
    '나무 이름 맞추기',
    '수목감별',
    '수목도감',
    '나무 식별',
    '조경기사',
    '산림기사',
  ],
  openGraph: {
    title: '트리오 - 나무의사 시험 대비 수목 퀴즈 앱',
    description:
      '사진으로 나무 이름 맞추기! 오답 복습, 학습 통계까지 한번에.',
    url: 'https://www.soopnote.com/treeoh',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.soopnote.com/treeoh',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: '트리오 - 수목 퀴즈',
  operatingSystem: 'Android',
  applicationCategory: 'EducationalApplication',
  description:
    '나무의사 시험 대비를 위한 수목 퀴즈 앱. 사진으로 나무 이름 맞추기, 오답 복습, 학습 통계.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  installUrl:
    'https://play.google.com/store/apps/details?id=com.soopify.tree.quiz',
  provider: {
    '@type': 'Organization',
    name: 'Soopnote',
    url: 'https://www.soopnote.com',
  },
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.soopify.tree.quiz';

const features = [
  {
    emoji: '🎯',
    title: '다양한 퀴즈 옵션',
    desc: '문항 수, 출제 범위를 자유롭게 설정하고 나만의 학습 플랜을 만들어 보세요.',
  },
  {
    emoji: '🔄',
    title: '오답 복습',
    desc: '틀린 문제만 모아서 다시 풀 수 있어요. 반복 학습으로 취약 수종을 정복하세요.',
  },
  {
    emoji: '⭐',
    title: '문제 찜하기',
    desc: '헷갈리거나 다시 보고 싶은 문제는 찜해두고, 언제든 모아서 풀어보세요.',
  },
  {
    emoji: '📊',
    title: '학습 통계',
    desc: '정답률, 학습 이력을 한눈에 확인하고 성장 과정을 기록하세요.',
  },
];

export default function TreeohPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <div className="min-h-screen bg-[#F5F3EE]">
        {/* ── Hero ── */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            트리오 <span className="text-green-700">Tree-Oh!</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
            사진을 보고 나무 이름을 맞춰보세요!
            <br />
            나무의사 시험 대비에 꼭 필요한 수목 퀴즈 앱.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-colors shadow-md"
            >
              Google Play에서 다운로드
            </a>
            <Link
              href="/quiz"
              className="px-8 py-3.5 bg-green-700 text-white font-medium rounded-2xl hover:bg-green-800 transition-colors shadow-md"
            >
              오늘의 퀴즈 풀어보기
            </Link>
          </div>
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
                <div className="text-4xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Screenshots ── */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            앱 미리보기
          </h2>
          <ScreenshotCarousel />
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
