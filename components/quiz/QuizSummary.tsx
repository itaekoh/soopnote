import AdSlot from '@/components/AdSlot';

interface QuizSummaryProps {
  score: number;
  total: number;
  onRetry: () => void;
}

function getEmoji(score: number, total: number): string {
  if (score === total) return '\uD83C\uDF89';
  if (score === total - 1) return '\uD83D\uDC4F';
  if (score === total - 2) return '\uD83D\uDC4D';
  if (score === total - 3) return '\uD83D\uDCAA';
  return '\uD83D\uDCDA';
}

export default function QuizSummary({ score, total, onRetry }: QuizSummaryProps) {
  const emoji = getEmoji(score, total);

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <p className="text-xl font-bold text-gray-800 mb-2">
          {total}문제 중 {score}개 정답!
        </p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-3 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800 transition-colors"
        >
          다시 풀기
        </button>
      </div>

      {/* App download CTA */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-lg font-bold text-gray-800 mb-2">
          {'\uD83D\uDCF1'} 더 많은 퀴즈를 풀어보세요!
        </p>
        <p className="text-sm text-gray-600 mb-4">
          트리오 앱에서 오답 복습, 학습 통계 등 다양한 기능을 이용할 수 있어요.
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.soopify.tree.quiz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Google Play에서 다운로드
        </a>
      </div>

      {/* Ad */}
      <AdSlot adSlot="quiz-summary" />
    </div>
  );
}
