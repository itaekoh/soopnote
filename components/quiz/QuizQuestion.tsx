'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [question.itemId]);

  // 캐시된 이미지는 onLoad가 React 마운트 전에 발생 → complete 체크
  const handleImgRef = useCallback((el: HTMLImageElement | null) => {
    (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = el;
    if (el?.complete && el.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Image with copy protection + click to zoom */}
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
            ref={handleImgRef}
            src={question.imageUrl}
            alt="퀴즈 이미지"
            draggable={false}
            className={`w-full h-auto select-none ${imageLoaded ? '' : 'hidden'}`}
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt="퀴즈 이미지 확대"
            draggable={false}
            className="max-w-full max-h-[90vh] object-contain select-none"
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
          />
        </div>
      )}
    </>
  );
}
