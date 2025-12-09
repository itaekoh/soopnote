import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.soopnote.com'),
  title: {
    default: 'Soopnote - 숲의 기록',
    template: '%s | Soopnote',
  },
  description: '자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다. 야생화 일지, 나무진단, 일상의 기록을 공유합니다.',
  keywords: ['숲의 기록', '야생화', '나무의사', '나무진단', '자연관찰', '식물일지', 'soopnote'],
  authors: [{ name: 'Soopnote' }],
  creator: 'Soopnote',
  publisher: 'Soopnote',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.soopnote.com',
    siteName: 'Soopnote - 숲의 기록',
    title: 'Soopnote - 숲의 기록',
    description: '자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다. 야생화 일지, 나무진단, 일상의 기록을 공유합니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Soopnote - 숲의 기록',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soopnote - 숲의 기록',
    description: '자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다.',
    images: ['/og-image.png'],
  },
  verification: {
    google: '', // Google Search Console 인증 코드 (나중에 추가)
    // naver: '', // 네이버 서치어드바이저 인증 코드 (나중에 추가)
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Soopnote - 숲의 기록',
    description: '자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다.',
    url: 'https://www.soopnote.com',
    author: {
      '@type': 'Person',
      name: 'Soopnote',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.soopnote.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
