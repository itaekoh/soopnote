'use client';

// ============================================
// 콘텐츠 복사 방지 (공개 페이지 한정)
// - 우클릭(컨텍스트 메뉴) / 드래그 / 복사 차단, 이미지 저장·드래그 방지
// - 관리자·에디터·로그인 등은 제외 (작업에 지장 없게)
// - 입력창(input/textarea/contenteditable) 안에서는 정상 동작 허용
// 참고: 클라이언트 방어라 완벽하진 않음(개발자도구·스크린샷 등은 못 막음). 캐주얼 복사 방지용.
// ============================================

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const EXEMPT_PREFIXES = ['/admin', '/write', '/login', '/signup', '/reset-password'];

export function ContentProtection() {
  const pathname = usePathname();

  useEffect(() => {
    // admin 서브도메인 전체 제외 (홈이 /admin으로 rewrite되어 경로가 '/'로 보이는 경우 포함)
    const isAdminHost =
      typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    const isExempt = isAdminHost || EXEMPT_PREFIXES.some((p) => (pathname || '').startsWith(p));
    if (isExempt) return;

    const inEditable = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return !!el?.closest?.('input, textarea, [contenteditable="true"]');
    };

    const onContextMenu = (e: MouseEvent) => {
      if (inEditable(e.target)) return; // 입력창 우클릭은 허용
      e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      // 이미지/콘텐츠 드래그 방지
      e.preventDefault();
    };
    const onCopyCut = (e: ClipboardEvent) => {
      if (inEditable(e.target)) return; // 입력창 복사/잘라내기는 허용
      e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('copy', onCopyCut);
    document.addEventListener('cut', onCopyCut);
    document.body.classList.add('no-select');

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('copy', onCopyCut);
      document.removeEventListener('cut', onCopyCut);
      document.body.classList.remove('no-select');
    };
  }, [pathname]);

  return null;
}
