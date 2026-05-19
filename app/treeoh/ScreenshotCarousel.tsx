'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const screenshots = [
  { src: '/screen/screen1.jpg', alt: '트리오 홈 화면' },
  { src: '/screen/screen2.jpg', alt: '퀴즈 시작 화면' },
  { src: '/screen/screen3.jpg', alt: '퀴즈 옵션 화면' },
  { src: '/screen/screen4.jpg', alt: '퀴즈 풀이 화면' },
  { src: '/screen/screen5.jpg', alt: '오답 복습 화면' },
  { src: '/screen/screen6.jpg', alt: '학습 통계 화면' },
  { src: '/screen/screen7.jpg', alt: '문제 찜하기 화면' },
];

export default function ScreenshotCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll < 10) {
      setPageCount(1);
      setActivePage(0);
      return;
    }
    // 스크롤 가능 영역을 뷰포트 단위로 나눠 페이지 수 산출 (올림)
    const pages = Math.ceil(maxScroll / el.clientWidth) + 1;
    setPageCount(pages);

    const ratio = el.scrollLeft / maxScroll;
    setActivePage(Math.round(ratio * (pages - 1)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const scrollToPage = (page: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = pageCount <= 1 ? 0 : (maxScroll * page) / (pageCount - 1);
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {screenshots.map((s) => (
          <div
            key={s.src}
            className="flex-shrink-0 w-[220px] sm:w-[240px] snap-center"
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={240}
              height={520}
              className="rounded-2xl shadow-md"
            />
          </div>
        ))}
      </div>

      {/* Dot indicator — 스크롤 가능 페이지 수만큼만 표시 */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              aria-label={`페이지 ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === activePage
                  ? 'bg-green-700'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
