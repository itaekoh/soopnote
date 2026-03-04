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
              본 환불 정책은 숲노트(Soopnote) 모바일 앱의 인앱 결제(광고 제거 상품)에 대한
              환불 절차를 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">2. 환불 원칙</h2>
            <p>
              숲노트 앱의 인앱 결제는 Google Play 결제 정책을 준수합니다.
              구매 후 48시간 이내에 환불을 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">3. Google Play를 통한 환불</h2>
            <p>
              환불은 Google Play를 통해 요청하실 수 있습니다. 다음 절차를 따라주세요:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Google Play 앱을 실행합니다.</li>
              <li>오른쪽 상단의 프로필 아이콘을 탭합니다.</li>
              <li><strong>결제 및 정기 결제</strong> &gt; <strong>예산 및 기록</strong>을 선택합니다.</li>
              <li>환불을 원하는 주문을 선택합니다.</li>
              <li><strong>환불 요청</strong>을 탭하고 안내에 따라 진행합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">4. 환불 처리 후</h2>
            <p>
              환불이 완료되면 다음과 같이 처리됩니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>광고 제거 기능이 해제됩니다.</li>
              <li>앱 내 광고가 다시 표시됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">5. 환불이 어려운 경우</h2>
            <p>
              다음의 경우 환불이 제한될 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>구매 후 48시간이 초과된 경우</li>
              <li>구매 후 7일 이상 서비스를 정상적으로 이용한 경우</li>
              <li>Google Play 정책에 따라 환불 요건을 충족하지 못하는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">6. 서비스 종료 시 환불</h2>
            <p>
              서비스가 종료되는 경우 다음과 같이 처리됩니다:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                서비스 종료 30일 전 공지를 원칙으로 하며, 공지 기간 내에
                아래 이메일로 환불을 요청하실 수 있습니다.
              </li>
              <li>
                단, 인앱 결제 환불은 Google Play의 자체 정책(구매 후 48시간 이내)에 따르며,
                이를 초과한 경우 Google Play를 통한 환불이 불가할 수 있습니다.
              </li>
              <li>
                Google Play 환불이 불가한 경우에도, 운영자는 합리적인 범위 내에서
                직접 환불을 검토할 수 있습니다. 구매 내역과 함께 이메일로 문의해 주세요.
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">
              ※ 인앱 결제 상품은 &quot;서비스가 운영되는 기간 동안&quot; 유효하며,
              앱스토어/Google Play의 영구 구매는 서비스 운영 지속을 보장하지 않습니다.
              이 점을 충분히 인지한 후 구매해 주세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">7. 직접 문의</h2>
            <p>
              Google Play를 통한 환불이 어려운 경우 아래 이메일로 직접 문의해 주세요.
              구매 내역과 환불 사유를 함께 알려주시면 빠르게 처리해 드리겠습니다.
            </p>
            <p>
              이메일: <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">treedoctor@kakao.com</a>
            </p>
          </section>

          <p className="text-sm text-gray-500">시행일: 2026년 3월 1일</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
