import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Soopnote는 나무의사가 현장에서 보고 판단한 것을 기록하는 블로그입니다. 수목 진료, 식물 관찰, 자격 취득 과정을 직접 찍은 사진과 함께 남깁니다.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-4">About</h1>
        <p className="text-lg text-gray-600 mb-12">
          숲의 기록 — 나무의 시간을 읽다
        </p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">Soopnote는 어떤 곳인가</h2>
            <p>
              Soopnote(숲노트)는 나무의사가 현장에서 보고 판단한 것을 기록하는 블로그입니다.
              진단서와 보고서에는 결론만 남습니다. 그 결론에 이르기까지 무엇을 보았고 무엇을
              망설였는지는 서류에 담기지 않습니다. 그 사이의 과정을 적어 두는 곳입니다.
            </p>
            <p>
              글은 대체로 현장에서 시작합니다. 가로수 한 그루 앞에서 멈춰 선 이유, 학교 숲을
              돌며 느낀 위화감, 잎 뒷면에서 발견한 작은 흔적 같은 것들입니다. 전문 용어가
              필요한 자리에서는 쓰되, 나무를 처음 들여다보는 분도 읽을 수 있게 쓰려고 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">운영자</h2>
            <p>
              나무의사 오이택입니다. IT 업계에서 27년간 프로젝트를 관리하다
              나무의사가 되었습니다. 두 가지 일이 멀어 보이지만, 겉으로 드러난 증상에서
              원인을 거슬러 올라가는 과정은 닮아 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>나무의사 · 프로젝트관리전문가(PMP)</li>
              <li>2024.05 – 2025.05 나무병원 소속 나무의사 — 청와대 수목관리, 천연기념물 및 보호수(강원·경남)</li>
              <li>2025.10 – 현재 나무의사협회 대위원 — 학교숲·가로수 컨설팅</li>
            </ul>
            <p>
              나무의사가 되기까지의 과정은{' '}
              <Link href="/logs" className="text-green-700 underline">
                아카이브
              </Link>
              의 «나무의사에 도전하다» 연재에 여섯 편으로 정리해 두었습니다. 학점인정부터
              식물보호기사, 양성교육, 최종 합격까지 실제로 거친 순서 그대로입니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">무엇을 쓰나</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link href="/tree-diagnose" className="text-green-700 underline font-semibold">
                  수목 진료
                </Link>{' '}
                — 예찰·진단·처방·처치의 현장 기록. 병해충 피해 양상, 진단 장비로 본 것,
                판단이 갈렸던 지점을 남깁니다.
              </li>
              <li>
                <Link href="/wildflower" className="text-green-700 underline font-semibold">
                  식물 관찰
                </Link>{' '}
                — 계절마다 만난 들꽃과 나무의 기록. 이름을 확인하는 과정과 그 자리의 환경을
                함께 적습니다.
              </li>
              <li>
                <Link href="/logs" className="text-green-700 underline font-semibold">
                  아카이브
                </Link>{' '}
                — 자격 취득 과정, 실무에 쓰는 방법과 도구, 그 밖의 기록.
              </li>
              <li>
                <Link href="/quiz" className="text-green-700 underline font-semibold">
                  수목 퀴즈
                </Link>{' '}
                — 사진으로 나무 이름을 맞혀 보는 연습 문제. 매일 바뀝니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">글과 사진에 대하여</h2>
            <p>
              글은 직접 씁니다. 사진은 대부분 현장에서 직접 찍은 것입니다. 직접 찍기 어려운
              개념 설명용 이미지에는 생성형 AI로 만든 그림을 쓰기도 하며, 그런 이미지에는
              AI로 만들었다는 표시를 남깁니다.
            </p>
            <p>
              이곳의 글은 기록이자 의견이며, 개별 나무에 대한 진단이나 처방이 아닙니다.
              수목의 진단·처방·치료는 「산림보호법」에 따라 나무병원이 수행해야 하는 일이라,
              실제 조치가 필요하시면 가까운 나무병원에 의뢰하시기를 권합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">연락</h2>
            <p>
              문의·제안·오류 신고는{' '}
              <Link href="/contact" className="text-green-700 underline">
                문의하기
              </Link>{' '}
              를 보시거나{' '}
              <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">
                treedoctor@kakao.com
              </a>
              으로 보내주세요.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
