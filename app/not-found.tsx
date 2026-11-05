import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * 없는 주소에 대한 404 화면.
 *
 * 전에는 이 파일이 없어서 Next 기본 화면이 나왔고, 더 큰 문제는 루트의
 * loading.tsx 가 모든 경로에 스트리밍을 걸어서 notFound() 를 불러도 응답
 * 코드가 200 으로 나갔다는 점이다. 검색엔진은 그걸 '내용 없는 정상 페이지'
 * 로 보고 품질이 낮은 사이트로 판단한다.
 */
export const metadata = {
  // 루트 레이아웃의 title 템플릿이 '| Soopnote' 를 붙이므로 여기선 뺀다.
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지가 없거나 주소가 바뀌었습니다.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6">
          <Leaf className="w-8 h-8 text-green-700" />
        </div>
        <h1 className="text-3xl font-bold text-[#26422E] mb-3">
          찾으시는 글이 없습니다
        </h1>
        <p className="text-gray-600 mb-10">
          주소가 바뀌었거나 글이 내려갔을 수 있습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#26422E] text-white font-semibold hover:bg-[#1d3324] transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/tree-diagnose"
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-semibold hover:bg-white transition-colors"
          >
            수목 진료
          </Link>
          <Link
            href="/wildflower"
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-semibold hover:bg-white transition-colors"
          >
            식물 관찰
          </Link>
          <Link
            href="/logs"
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-semibold hover:bg-white transition-colors"
          >
            아카이브
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
