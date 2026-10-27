import type { Metadata } from 'next';

// 홈 canonical — 루트 layout에 두면 모든 페이지가 상속하므로 route group으로 홈에만 적용
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
