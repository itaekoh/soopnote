import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'Soopnote는 숲과 나무, 야생화를 관찰하고 기록하는 개인 블로그입니다. 나무의사의 시선으로 자연을 담습니다.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-8">About</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">Soopnote란?</h2>
            <p>
              Soopnote(숲노트)는 숲과 나무, 야생화를 관찰하고 기록하는 개인 블로그입니다.
              계절의 흐름 속에서 만나는 자연의 작은 변화들을 글과 사진으로 담고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">운영자</h2>
            <p>
              나무의사(수목진단) 자격을 보유한 운영자가 전문적인 시선과 개인적인 감상을 함께 기록합니다.
              나무 진단 사례, 야생화 관찰 일지, 그리고 자연과 관련된 다양한 이야기를 공유합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">주요 콘텐츠</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>야생화 일지</strong> — 계절별 야생화 관찰 기록과 사진</li>
              <li><strong>나무진단</strong> — 수목 건강 진단 및 치료 사례</li>
              <li><strong>아카이브</strong> — 기술, AI, 실무 팁 등 다양한 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">연락처</h2>
            <p>
              문의사항이 있으시면 <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">treedoctor@kakao.com</a>으로 이메일을 보내주세요.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
