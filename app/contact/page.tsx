import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Soopnote 문의하기 — 글 내용 문의, 수목 관련 질문, 강의·기고·협업 제안, 오류 신고. treedoctor@kakao.com',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-4">문의하기</h1>
        <p className="text-lg text-gray-600 mb-10">
          읽으시다 궁금한 점이 생기면 편히 보내주세요.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
            <Mail className="w-4 h-4" />
            이메일
          </div>
          <a
            href="mailto:treedoctor@kakao.com"
            className="text-xl text-green-700 font-semibold hover:underline break-all"
          >
            treedoctor@kakao.com
          </a>
          <p className="text-sm text-gray-500 mt-4 mb-0">
            평일 기준 2~3일 안에 답장 드리려고 합니다. 현장에 나가 있는 기간에는 조금
            늦어질 수 있습니다.
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">이런 문의를 받습니다</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>글 내용에 대한 질문</strong> — 어떤 글의 어느 대목인지 알려주시면
                답하기가 수월합니다.
              </li>
              <li>
                <strong>나무 상태가 궁금할 때</strong> — 사진과 함께 보내주시면 무엇을 더
                살펴보면 좋을지 말씀드릴 수 있습니다. 다만 아래 안내를 먼저 읽어주세요.
              </li>
              <li>
                <strong>나무의사 준비 과정</strong> — 자격 취득 순서와 준비 방법에 대한 질문.
                «나무의사에 도전하다» 연재에 적어 둔 것보다 더 궁금한 점이 있으시면요.
              </li>
              <li>
                <strong>강의·기고·협업 제안</strong> — 학교숲이나 가로수 관련 컨설팅,
                원고 요청 등.
              </li>
              <li>
                <strong>오류 신고</strong> — 사실이 틀렸거나 화면이 깨지는 곳을 발견하셨다면
                알려주세요. 확인하고 고치겠습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">나무 상태를 문의하실 때</h2>
            <p>
              사진이 있으면 훨씬 정확하게 말씀드릴 수 있습니다. 가능하시면 이렇게 보내주세요.
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>나무 전체가 보이는 사진 한 장 (주변 환경이 함께 나오면 좋습니다)</li>
              <li>증상이 보이는 부위를 가까이 찍은 사진</li>
              <li>잎 앞면과 뒷면</li>
              <li>지역, 언제부터 그랬는지, 최근에 주변에서 한 공사나 작업이 있었는지</li>
            </ul>
            <p className="text-base bg-amber-50 border border-amber-200 rounded-xl p-5">
              <strong>먼저 알려드립니다.</strong> 사진만으로 드리는 말씀은 참고 의견이며,
              진단이나 처방이 아닙니다. 수목의 진단·처방·치료는 「산림보호법」에 따라
              나무병원이 수행해야 하는 일입니다. 실제 조치가 필요한 상태라면 가까운
              나무병원에 의뢰하시기를 권해 드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">그 밖에</h2>
            <p>
              운영자와 이 블로그에 대해서는{' '}
              <Link href="/about" className="text-green-700 underline">
                About
              </Link>
              을, 개인정보 처리에 관해서는{' '}
              <Link href="/privacy" className="text-green-700 underline">
                개인정보처리방침
              </Link>
              을 참고해 주세요.
            </p>
            <p>
              나무 이름을 익히고 싶으시면{' '}
              <Link href="/quiz" className="text-green-700 underline">
                오늘의 수목 퀴즈
              </Link>
              와 퀴즈 앱{' '}
              <Link href="/treeoh" className="text-green-700 underline">
                트리오(Tree-Oh!)
              </Link>
              도 있습니다.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
