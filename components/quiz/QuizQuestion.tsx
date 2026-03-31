'use client';

import { useState, useEffect } from 'react';
import { WebQuizQuestion } from '@/lib/api/quiz-web';

interface QuizQuestionProps {
  question: WebQuizQuestion;
  onAnswer: (speciesId: string) => void;
  showFeedback: boolean;
  selectedAnswer: string | null;
}

export default function QuizQuestion({
  question,
  onAnswer,
  showFeedback,
  selectedAnswer,
}: QuizQuestionProps) {
  const [showZoom, setShowZoom] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [question.itemId]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Image + CSS 워터마크 오버레이 */}
        <div
          className="relative w-full select-none cursor-zoom-in"
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => imageLoaded && setShowZoom(true)}
          style={{ WebkitTouchCallout: 'none' }}
        >
          {/* 로딩 스켈레톤 */}
          {!imageLoaded && !imageError && (
            <div className="w-full aspect-[4/3] bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="text-gray-300 text-4xl">🌳</div>
            </div>
          )}
          {/* 이미지 로드 실패 */}
          {imageError && (
            <div className="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center">
              <div className="text-gray-400 text-sm">이미지를 불러올 수 없습니다</div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt="퀴즈 이미지"
            draggable={false}
            className={`w-full h-auto select-none ${imageLoaded ? '' : 'hidden'}`}
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {/* CSS 워터마크 오버레이 */}
          {imageLoaded && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -30deg,
                  transparent,
                  transparent 60px,
                  rgba(255,255,255,0.06) 60px,
                  rgba(255,255,255,0.06) 61px
                )`,
              }}
            >
              <div
                className="absolute inset-0 flex flex-wrap items-center justify-center gap-x-16 gap-y-12"
                style={{ transform: 'rotate(-30deg) scale(1.5)' }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-white/25 text-sm font-bold whitespace-nowrap select-none"
                    style={{
                      textShadow: '0 0 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    soopnote.com
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Zoom hint */}
          {imageLoaded && (
            <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-lg pointer-events-none">
              🔍 클릭하여 확대
            </div>
          )}
        </div>

        {/* Choices */}
        <div className="p-4 grid grid-cols-1 gap-3">
          {question.choices.map((choice) => {
            const isCorrect = choice.speciesId === question.correctSpeciesId;
            const isSelected = choice.speciesId === selectedAnswer;

            let buttonClass =
              'w-full min-h-12 px-4 py-3 rounded-xl text-base font-medium transition-colors border ';

            if (showFeedback) {
              if (isCorrect) {
                buttonClass += 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected) {
                buttonClass += 'bg-red-100 border-red-500 text-red-800';
              } else {
                buttonClass += 'bg-gray-50 border-gray-200 text-gray-400';
              }
            } else {
              buttonClass +=
                'bg-white border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100';
            }

            return (
              <button
                key={choice.speciesId}
                onClick={() => !showFeedback && onAnswer(choice.speciesId)}
                disabled={showFeedback || (!imageLoaded && !imageError)}
                className={buttonClass}
              >
                {choice.nameKo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowZoom(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.imageUrl}
              alt="퀴즈 이미지 확대"
              draggable={false}
              className="max-w-full max-h-[90vh] object-contain select-none"
              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            />
            {/* 확대 모달에서도 워터마크 */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 flex flex-wrap items-center justify-center gap-x-16 gap-y-12"
                style={{ transform: 'rotate(-30deg) scale(1.5)' }}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-white/25 text-sm font-bold whitespace-nowrap select-none"
                    style={{
                      textShadow: '0 0 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    soopnote.com
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
