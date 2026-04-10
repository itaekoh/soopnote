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

type Phase = 'intro' | 'loading' | 'playing' | 'mid-ad' | 'finished';

/** 모든 이미지를 프리로드하고 완료 시 resolve */
function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // 실패해도 진행
          img.src = url;
        })
    )
  ).then(() => {});
}

export default function WebQuiz({ initialQuestions }: WebQuizProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);

  const total = initialQuestions.length;

  // loading 단계: 모든 이미지 프리로드 후 playing으로 전환
  useEffect(() => {
    if (phase !== 'loading') return;

    let loaded = 0;
    const urls = initialQuestions.map((q) => q.imageUrl);

    const promises = urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            setLoadProgress(Math.round((loaded / urls.length) * 100));
            resolve();
          };
          img.onerror = () => {
            loaded++;
            setLoadProgress(Math.round((loaded / urls.length) * 100));
            resolve();
          };
          img.src = url;
        })
    );

    Promise.all(promises).then(() => {
      setPhase('playing');
    });
  }, [phase, initialQuestions]);

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
      if (currentIndex + 1 >= total && currentIndex !== 2) {
        setPhase('finished');
      } else {
        advanceToNext();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [showFeedback, advanceToNext, currentIndex, total]);

  const handleStart = () => {
    setLoadProgress(0);
    setPhase('loading');
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
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            오늘의 수목 퀴즈
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            매일 새로운 <strong>{total}문제</strong>가 출제됩니다.
            <br />
            사진을 보고 나무 이름을 맞춰보세요!
          </p>

          {total > 0 ? (
            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-green-700 text-white text-lg font-bold rounded-2xl hover:bg-green-800 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              퀴즈 풀어보기
            </button>
          ) : (
            <div className="mt-4 text-gray-400 text-sm">
              현재 출제 가능한 문제가 없습니다.
            </div>
          )}

          <p className="text-sm text-gray-500 pt-2">
            더 많은 문제는{' '}
            <a href="/treeoh" className="text-green-700 font-medium underline hover:text-green-800">
              트리오 앱
            </a>
            에서!
          </p>
        </div>

        {/* AdSense */}
        <AdSlot adSlot="quiz-intro" />
      </div>
    );
  }

  // ──────────────── LOADING ────────────────
  if (phase === 'loading') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center space-y-6">
        <div className="text-5xl animate-bounce">🌳</div>
        <h2 className="text-lg font-bold text-gray-900">문제를 준비하고 있어요...</h2>
        {/* 프로그레스 바 */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{loadProgress}%</p>
        </div>
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
