import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_KR({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'soopnote | 숲의 숨을 기록하다',
  description:
    '숲의 숨결을 기록하는 soopnote. 야생화 일기와 나무의사 노트, 숲과 사람의 이야기를 담은 감성 식물 저널.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSans.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-[#F5F3EE] to-[#F8FAF8] text-soop-ink antialiased">
        {children}
      </body>
    </html>
  );
}
