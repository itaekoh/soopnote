'use client';

import { useEffect, useState } from 'react';
import AdSlot from '@/components/AdSlot';
import type { WebQuizQuestion } from '@/lib/api/quiz-web';
import type { AnswerRecord } from './WebQuiz';

interface QuizSummaryProps {
  questions: WebQuizQuestion[];
  answers: AnswerRecord[];
}

// 웹 퀴즈 → 앱 설치 유입 추적 (Play Console 획득 보고서에서 구분)
const PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.soopify.tree.quiz&referrer=utm_source%3Dsoopnote%26utm_medium%3Dweb_quiz';
const QUIZ_URL = 'https://www.soopnote.com/quiz';

function getEmoji(score: number, total: number): string {
  if (score === total) return '🎉';
  if (score === total - 1) return '👏';
  if (score === total - 2) return '👍';
  if (score === total - 3) return '💪';
  return '📚';
}

/** 다음 퀴즈(KST 자정)까지 남은 시간 "H시간 M분" — 1분마다 갱신 */
function useTimeUntilNextQuiz(): string {
  const calc = () => {
    const nowKst = Date.now() + 9 * 60 * 60 * 1000;
    const msLeft = 24 * 60 * 60 * 1000 - (nowKst % (24 * 60 * 60 * 1000));
    const totalMin = Math.ceil(msLeft / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 60000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function QuizSummary({ questions, answers }: QuizSummaryProps) {
  const total = questions.length;
  const score = answers.filter((a) => a.correct).length;
  const emoji = getEmoji(score, total);
  const timeLeft = useTimeUntilNextQuiz();
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const marks = answers.map((a) => (a.correct ? '✅' : '❌')).join('');
  const shareText = `🌳 트리오 오늘의 수목 퀴즈 ${score}/${total}\n${marks}\n${QUIZ_URL}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareMsg('결과를 복사했어요. 원하는 곳에 붙여넣어 공유하세요.');
    } catch {
      // 사용자가 공유 창을 닫은 경우 등 — 무시
    }
  };

  return (
    <div className="space-y-6">
      {/* 점수 */}
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <p className="text-sm font-medium text-green-700 mb-1">오늘의 수목 퀴즈</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {total}문제 중 {score}개 정답
        </p>
        <p className="text-lg tracking-wider mb-4" aria-label={`${score}개 정답, ${total - score}개 오답`}>
          {marks}
        </p>
        <button
          onClick={handleShare}
          className="px-5 py-2.5 border border-gray-300 text-gray-800 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          결과 공유하기
        </button>
        {shareMsg && <p className="text-xs text-gray-500 mt-2">{shareMsg}</p>}
        <p className="text-sm text-gray-500 mt-5">
          다음 퀴즈까지 <strong className="text-gray-800">{timeLeft}</strong> · 매일 자정 새 문제
        </p>
      </div>

      {/* 앱 유도 */}
      <div className="bg-green-800 rounded-2xl shadow-sm p-6 text-center text-white">
        <p className="text-lg font-bold mb-1">더 풀어보고 싶다면</p>
        <p className="text-sm text-green-100 mb-5 leading-relaxed">
          트리오 앱에는 230여 종, 800여 문제가 있어요.
          <br />
          오답 복습과 학습 통계로 감별 실력을 키워보세요.
        </p>
        <a
          href={PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full sm:w-auto px-8 py-3.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-colors"
        >
          트리오 앱 무료로 받기
        </a>
        <div className="mt-3">
          <a href="/treeoh" className="text-sm text-green-100 underline hover:text-white">
            트리오 앱 알아보기
          </a>
        </div>
      </div>

      {/* 정답 확인 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">오늘의 정답</h3>
        <ul className="divide-y divide-gray-100">
          {questions.map((q, i) => {
            const answer = answers[i];
            const correct = answer?.correct ?? false;
            const myChoice = q.choices.find((c) => c.speciesId === answer?.speciesId)?.nameKo;
            return (
              <li key={q.itemId} className="flex items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{q.correctNameKo}</p>
                  {!correct && myChoice && (
                    <p className="text-sm text-gray-500">내 답: {myChoice}</p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 text-sm font-bold ${correct ? 'text-green-700' : 'text-red-600'}`}
                >
                  {correct ? '정답' : '오답'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 광고 (AdSense 승인 후에만 표시) */}
      <AdSlot adSlot="quiz-summary" />
    </div>
  );
}
