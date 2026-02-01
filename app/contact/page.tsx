import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Soopnote에 문의하기 - 이메일: treedoctor@kakao.com',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-8">Contact</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p>
            Soopnote에 대한 문의, 제안, 오류 신고 등은 아래 이메일로 연락해 주세요.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-md">
            <div className="text-sm font-medium text-gray-500 mb-2">이메일</div>
            <a
              href="mailto:treedoctor@kakao.com"
              className="text-xl text-green-700 font-semibold hover:underline"
            >
              treedoctor@kakao.com
            </a>
          </div>

          <p className="text-sm text-gray-500">
            보내주신 메일은 확인 후 순차적으로 답변 드리겠습니다.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
