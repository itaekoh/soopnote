import type { Metadata } from 'next';

// 목록 페이지(클라이언트 컴포넌트)의 canonical 지정용 — 상세 [id] 페이지는 generateMetadata에서 override
export const metadata: Metadata = {
  alternates: { canonical: '/logs' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
