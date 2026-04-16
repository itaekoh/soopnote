import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '환불 정책',
  description: '숲노트(Soopnote) 앱 인앱 결제 환불 정책 안내',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-8">환불 정책</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">1. 개요</h2>
            <p>
              본 환불 정책은 숲노트(Soopnote) 모바일 앱의 프리미엄 구독 상품에 대한
              환불 및 취소 절차를 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">2. 구독 취소</h2>
            <p>
              구독은 언제든지 취소할 수 있으며, 취소 후에도 현재 결제된 구독 기간이 끝날 때까지
              프리미엄 기능을 계속 이용할 수 있습니다.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Google Play 앱을 실행합니다.</li>
              <li>오른쪽 상단의 프로필 아이콘을 탭합니다.</li>
              <li><strong>결제 및 정기 결제</strong> &gt; <strong>정기 결제</strong>를 선택합니다.</li>
              <li>숲노트 구독을 선택합니다.</li>
              <li><strong>정기 결제 취소</strong>를 탭하고 안내에 따라 진행합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">3. 환불 원칙</h2>
            <p>
              구독 환불은 Google Play 결제 정책을 준수합니다.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>구독 결제 후 48시간 이내: Google Play를 통해 환불 요청 가능</li>
              <li>구독 결제 후 48시간 초과: Google Play 정책에 따라 환불이 제한될 수 있음</li>
            </ul>
            <p>
              구독을 취소하시면 다음 갱신일에 자동 결제가 중단되므로,
              환불보다는 구독 취소를 권장합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">4. 구독 취소 후 처리</h2>
            <p>
              구독이 취소되거나 만료되면 다음과 같이 처리됩니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>프리미엄 기능(광고 제거, 무제한 퀴즈, 오답 즉시 복습)이 비활성화됩니다.</li>
              <li>무료 사용자로 전환되며 하루 15문항까지 이용 가능합니다. 보상형 광고 시청으로 추가 문항을 획득할 수 있습니다.</li>
              <li>퀴즈 기록, 통계, 오답 데이터는 삭제되지 않고 유지됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">5. 유예 기간</h2>
            <p>
              결제 수단에 문제가 발생하여 자동 갱신이 실패한 경우, 유예 기간(7일) 동안
              프리미엄 기능이 유지됩니다. 유예 기간 내에 결제 수단을 업데이트하시면
              구독이 정상적으로 갱신됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">6. 서비스 종료 시 환불</h2>
            <p>
              서비스가 종료되는 경우 다음과 같이 처리됩니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                서비스 종료 30일 전 공지를 원칙으로 하며, 활성 구독은 다음 갱신일에
                자동으로 중단됩니다.
              </li>
              <li>
                이미 결제된 구독 기간 중 미사용 기간에 대해서는 아래 이메일로
                환불을 요청하실 수 있습니다.
              </li>
              <li>
                운영자는 합리적인 범위 내에서 환불을 검토합니다.
                구독 내역과 함께 이메일로 문의해 주세요.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">7. 직접 문의</h2>
            <p>
              Google Play를 통한 환불이 어려운 경우 아래 이메일로 직접 문의해 주세요.
              구독 내역과 환불 사유를 함께 알려주시면 빠르게 처리해 드리겠습니다.
            </p>
            <p>
              이메일: <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">treedoctor@kakao.com</a>
            </p>
          </section>

          <p className="text-sm text-gray-500">시행일: 2026년 4월 16일</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
