'use client';

import { useState, useEffect, useCallback } from 'react';
import { WebQuizQuestion } from '@/lib/api/quiz-web';
import QuizProgress from './QuizProgress';
import QuizQuestion from './QuizQuestion';
import QuizSummary from './QuizSummary';
import AdSlot from '@/components/AdSlot';

interface WebQuizProps {
  initialQuestions: WebQuizQuestion[];
}

interface AnswerRecord {
  speciesId: string;
  correct: boolean;
}

type Phase = 'intro' | 'playing' | 'mid-ad' | 'finished';

export default function WebQuiz({ initialQuestions }: WebQuizProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const total = initialQuestions.length;

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;

    // Show mid-quiz ad after question 3 (index 2)
    if (currentIndex === 2 && nextIndex < total) {
      setPhase('mid-ad');
      return;
    }

    if (nextIndex >= total) {
      setPhase('finished');
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [currentIndex, total]);

  const handleAnswer = useCallback(
    (speciesId: string) => {
      if (showFeedback) return;

      const question = initialQuestions[currentIndex];
      const correct = speciesId === question.correctSpeciesId;

      setSelectedAnswer(speciesId);
      setShowFeedback(true);
      setAnswers((prev) => [...prev, { speciesId, correct }]);
    },
    [showFeedback, currentIndex, initialQuestions]
  );

  // Auto-advance after feedback
  useEffect(() => {
    if (!showFeedback) return;

    const timer = setTimeout(() => {
      // Check if this was the last question
      if (currentIndex + 1 >= total && currentIndex !== 2) {
        setPhase('finished');
      } else {
        advanceToNext();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [showFeedback, advanceToNext, currentIndex, total]);

  const handleStart = () => {
    setPhase('playing');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleQuit = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
  };

  const handleAdContinue = () => {
    setPhase('playing');
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  // ──────────────── INTRO ────────────────
  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        {/* 앱 소개 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="text-5xl">🌳</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            나무 이름, 얼마나 알고 있나요?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            사진을 보고 나무 이름을 맞춰보세요.<br />
            총 <strong>{total}문제</strong>가 랜덤으로 출제됩니다.
          </p>

          {total > 0 ? (
            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-green-700 text-white text-lg font-bold rounded-2xl hover:bg-green-800 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              🌿 퀴즈 풀어보기
            </button>
          ) : (
            <div className="mt-4 text-gray-400 text-sm">
              현재 출제 가능한 문제가 없습니다.
            </div>
          )}
        </div>

        {/* 앱 다운로드 유도 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-6 sm:p-8 border border-green-100">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📱</div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900">트리오 앱으로 더 깊이 공부하세요!</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ 무제한 문제 풀이 (10문제/세트)</li>
                <li>✅ 오답 복습 & 학습 통계</li>
                <li>✅ 퀴즈 옵션 (문항 수, 범위 선택)</li>
                <li>✅ 나무의사 시험 완벽 대비</li>
              </ul>
              <a
                href="https://play.google.com/store/apps/details?id=com.soopify.tree.quiz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                ▶ Google Play에서 다운로드
              </a>
            </div>
          </div>
        </div>

        {/* AdSense */}
        <AdSlot adSlot="quiz-intro" />
      </div>
    );
  }

  // ──────────────── MID-AD ────────────────
  if (phase === 'mid-ad') {
    return (
      <div className="space-y-4">
        <AdSlot adSlot="quiz-between" />
        <div className="text-center">
          <button
            onClick={handleAdContinue}
            className="px-6 py-3 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800 transition-colors"
          >
            계속 풀기
          </button>
        </div>
      </div>
    );
  }

  // ──────────────── FINISHED ────────────────
  if (phase === 'finished') {
    const score = answers.filter((a) => a.correct).length;
    return <QuizSummary score={score} total={total} onRetry={handleRetry} />;
  }

  // ──────────────── PLAYING ────────────────
  return (
    <div className="space-y-4">
      {/* 상단: 진행률 + 나가기 버튼 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <QuizProgress current={currentIndex} total={total} />
        </div>
        <button
          onClick={handleQuit}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors text-lg"
          title="그만 풀기"
        >
          ✕
        </button>
      </div>

      <QuizQuestion
        question={initialQuestions[currentIndex]}
        onAnswer={handleAnswer}
        showFeedback={showFeedback}
        selectedAnswer={selectedAnswer}
      />
    </div>
  );
}
