import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '이용약관',
  description: '숲노트(Soopnote) 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-8">이용약관</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">1. 서비스 소개</h2>
            <p>
              숲노트(Soopnote)는 나무의사 실기 시험 대비 학습 서비스를 제공합니다.
              본 약관은 숲노트 퀴즈 모바일 앱 및 soopnote.com 웹사이트(이하 &quot;서비스&quot;)
              이용에 관한 사항을 규정합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">2. 약관 동의</h2>
            <p>
              서비스를 이용하시면 본 약관에 동의한 것으로 간주됩니다.
              본 약관에 동의하지 않으시면 서비스 이용을 중단해 주세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">3. 회원가입 및 계정</h2>
            <p>
              서비스 이용을 위해 다음과 같은 방식으로 회원가입 및 로그인할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google 소셜 로그인</li>
              <li>Kakao 소셜 로그인</li>
              <li>이메일 회원가입/로그인</li>
              <li>게스트(비회원) 이용</li>
            </ul>
            <p>
              1인 1계정을 원칙으로 하며, 타인의 계정을 도용하거나 부정하게 사용해서는 안 됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">4. 서비스 이용</h2>
            <p>
              이용자는 퀴즈 풀기, 학습 기록 확인, 통계 조회 등의 기능을 이용할 수 있습니다.
              서비스의 비정상적 이용(자동화 도구 사용, 과도한 트래픽 발생 등)이 확인될 경우
              서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">5. 구독 및 결제</h2>
            <p>
              모바일 앱에서는 Google Play를 통한 정기 구독 결제를 지원합니다.
              현재 제공되는 구독 상품은 다음과 같습니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>프리미엄 월간: 월 단위 자동 갱신 구독</li>
              <li>프리미엄 연간: 연 단위 자동 갱신 구독</li>
            </ul>
            <p>
              구독 시 광고 제거, 무제한 퀴즈 풀이, 오답 복습 퀴즈 등 프리미엄 기능을 이용할 수 있습니다.
              무료 사용자는 하루 3세트까지 퀴즈를 이용할 수 있습니다.
            </p>
            <h3 className="text-lg font-semibold text-[#26422E] mt-4">자동 갱신</h3>
            <p>
              구독은 이용자가 직접 취소하지 않는 한 결제 주기(월간/연간)에 따라 자동으로 갱신됩니다.
              자동 갱신을 원하지 않으시면 현재 구독 기간이 만료되기 최소 24시간 전에
              Google Play 구독 관리에서 취소해 주세요.
            </p>
            <h3 className="text-lg font-semibold text-[#26422E] mt-4">구독 취소</h3>
            <p>
              구독을 취소하더라도 현재 결제된 구독 기간이 끝날 때까지 프리미엄 기능을 계속 이용할 수 있습니다.
              구독 기간 만료 후에는 무료 사용자로 전환되며, 퀴즈 기록과 통계 데이터는 유지됩니다.
            </p>
            <p>
              결제 및 환불에 관한 자세한 사항은{' '}
              <a href="/refund" className="text-green-700 underline">환불 정책</a>을 참고해 주세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">6. 지식재산권</h2>
            <p>
              서비스에 포함된 사진, 퀴즈 문제, 해설 등 모든 콘텐츠의 저작권은 운영자에게 귀속됩니다.
              이용자는 서비스 내 콘텐츠를 개인 학습 목적으로만 이용할 수 있으며,
              무단 복제, 배포, 상업적 이용은 금지됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">7. 면책 조항</h2>
            <p>
              본 서비스는 나무의사 시험 대비를 위한 학습 보조 도구이며,
              시험 합격을 보장하지 않습니다.
              콘텐츠의 정확성을 위해 최선을 다하고 있으나, 오류가 포함될 수 있으며
              이로 인한 손해에 대해 운영자는 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">8. 서비스 변경 및 중단</h2>
            <p>
              운영자는 서비스 개선, 운영상의 이유 등으로 서비스의 전부 또는 일부를
              변경하거나 중단할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>사전 공지</strong>: 서비스 종료 시 최소 30일 전에 앱 내 공지 또는
                가입 이메일을 통해 안내합니다. 단, 천재지변, 법적 의무, 기술적 긴급 상황 등
                불가항력적인 경우에는 사전 공지 없이 서비스가 중단될 수 있습니다.
              </li>
              <li>
                <strong>구독 결제 처리</strong>: 서비스 종료 공지 시 활성 구독은 다음 갱신일에
                자동으로 중단됩니다. 이미 결제된 구독 기간에 대해서는{' '}
                <a href="/refund" className="text-green-700 underline">환불 정책</a>에
                따라 환불을 요청할 수 있습니다.
              </li>
              <li>
                <strong>책임 제한</strong>: 서비스 중단으로 인한 이용자의 손해에 대해 운영자는
                고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">9. 약관 변경</h2>
            <p>
              본 약관은 필요에 따라 변경될 수 있으며, 변경 시 앱 및 웹사이트를 통해 공지합니다.
              변경된 약관 공지 후 서비스를 계속 이용하시면 변경된 약관에 동의한 것으로 간주됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">10. 문의</h2>
            <p>
              서비스 이용에 관한 문의사항은 아래 연락처로 문의해 주세요.
            </p>
            <p>
              이메일: <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">treedoctor@kakao.com</a>
            </p>
          </section>

          <p className="text-sm text-gray-500">시행일: 2026년 3월 28일</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
