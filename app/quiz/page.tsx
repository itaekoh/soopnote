import { Metadata } from 'next';
import Link from 'next/link';
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

          {/* 퀴즈 위젯만 있으면 크롤러가 읽을 글이 거의 없다.
              무엇을 위한 퀴즈이고 어떻게 쓰면 되는지를 글로 남긴다. */}
          <div className="prose max-w-none text-gray-700 mt-16 space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-[#26422E]">사진으로 나무를 익히는 연습</h2>
              <p>
                나무 이름은 설명을 읽어서 외워지지 않습니다. 잎차례가 어떻고 거치가 어떻다는
                문장은 머리에 남아도, 막상 현장에서 가지를 들여다보면 다시 막힙니다. 결국
                사진을 많이 보는 수밖에 없습니다.
              </p>
              <p>
                여기 있는 문제는 수목감별에 자주 나오는 수종의 실제 사진으로 만들었습니다.
                잎·수피·열매·전체 수형 등 식별에 쓰이는 부위가 고루 나옵니다. 한 번에 다섯
                문제이고, 새로고침하면 다른 문제가 나옵니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#26422E]">이런 분께 도움이 됩니다</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>나무의사 1차·2차 시험에서 수목 식별을 준비하는 분</li>
                <li>조경기능사 수목감별 실기를 앞둔 분</li>
                <li>산림기사·조경기사 등 수종 식별이 들어가는 시험을 보는 분</li>
                <li>시험과 무관하게, 산책길에 보이는 나무 이름이 궁금한 분</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#26422E]">틀린 문제를 남겨두세요</h2>
              <p>
                식별은 맞힌 문제보다 틀린 문제에서 늡니다. 헷갈린 수종은 대개 한 번 더
                헷갈립니다. 비슷하게 생긴 짝(예: 황매화와 죽단화처럼 이름부터 얽힌 경우)을
                묶어서 보면 구별점이 보이기 시작합니다.
              </p>
              <p>
                틀린 문제만 다시 풀고 수종별 정답률을 보려면 앱{' '}
                <Link href="/treeoh" className="text-green-700 underline">
                  트리오(Tree-Oh!)
                </Link>
                를 보세요. 오답 노트와 북마크가 있어 약한 수종만 반복할 수 있습니다.
                조경기능사 준비라면{' '}
                <Link href="/landscape-craftsman" className="text-green-700 underline">
                  수목감별 가이드
                </Link>
                에 출제 범위와 공부 순서를 정리해 두었습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#26422E]">사진은 어디서 왔나</h2>
              <p>
                문제에 쓰인 사진은 현장에서 직접 찍은 것을 중심으로 모았습니다. 같은 수종도
                계절과 수령에 따라 꽤 다르게 보이기 때문에, 한 수종을 여러 시기의 사진으로
                보여주려고 합니다. 사진이 잘못 분류된 것을 발견하시면{' '}
                <Link href="/contact" className="text-green-700 underline">
                  알려주세요
                </Link>
                . 확인하고 고치겠습니다.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
