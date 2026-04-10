import { Metadata } from 'next';
import { fetchWebQuizSet } from '@/lib/api/quiz-web';
import WebQuiz from '@/components/quiz/WebQuiz';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// SSR: 매 요청마다 새 랜덤 퀴즈 세트
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '오늘의 수목 퀴즈 - 매일 새로운 5문제! | Soopnote',
  description:
    '매일 새로운 수목 퀴즈 5문제! 사진을 보고 나무 이름을 맞춰보세요. 나무의사 시험 대비, 수목감별 연습에 도움이 됩니다.',
  keywords: [
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
    title: '오늘의 수목 퀴즈 - 매일 새로운 5문제! | Soopnote',
    description: '매일 새로운 수목 퀴즈 5문제! 사진을 보고 나무 이름을 맞춰보세요.',
    url: 'https://www.soopnote.com/quiz',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.soopnote.com/quiz',
  },
};

// JSON-LD 구조화 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: '오늘의 수목 퀴즈',
  description: '매일 새로운 수목 퀴즈 5문제. 사진을 보고 나무 이름을 맞춰보세요.',
  educationalAlignment: {
    '@type': 'AlignmentObject',
    educationalFramework: '나무의사 자격시험',
  },
  provider: {
    '@type': 'Organization',
    name: 'Soopnote',
    url: 'https://www.soopnote.com',
  },
};

export default async function QuizPage() {
  const questions = await fetchWebQuizSet(5);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <div className="min-h-screen bg-[#F5F3EE]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* SEO용 헤딩 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              오늘의 수목 퀴즈
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              매일 새로운 5문제!
            </p>
          </div>

          <WebQuiz initialQuestions={questions} />
        </div>
      </div>
      <Footer />
    </>
  );
}
