import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Soopnote 개인정보처리방침 - 데이터 수집, 쿠키, 광고 네트워크 안내',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#26422E] mb-8">개인정보처리방침</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <p>
            Soopnote(이하 &quot;본 사이트&quot;)는 이용자의 개인정보를 중요하게 생각하며,
            관련 법령에 따라 개인정보를 보호하고 있습니다.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">1. 수집하는 정보</h2>
            <p>본 사이트는 다음과 같은 정보를 자동으로 수집할 수 있습니다:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>방문 페이지, 방문 시간, 체류 시간 등 이용 통계</li>
              <li>브라우저 종류, 운영체제, 기기 정보</li>
              <li>IP 주소 (익명 처리될 수 있음)</li>
              <li>쿠키 및 유사 기술을 통한 식별 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">2. Google Analytics</h2>
            <p>
              본 사이트는 Google Tag Manager(GTM)를 통해 Google Analytics를 사용하여
              사이트 이용 현황을 분석합니다. Google Analytics는 쿠키를 사용하여 이용자의
              사이트 이용 정보를 수집하며, 이 정보는 Google 서버에 저장됩니다.
            </p>
            <p>
              Google의 개인정보처리에 대한 자세한 내용은{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                Google 개인정보처리방침
              </a>
              을 참고하세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">3. Google AdSense 및 광고</h2>
            <p>
              본 사이트는 Google AdSense를 통해 광고를 게재할 수 있습니다.
              Google AdSense는 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 표시합니다.
              제3자 광고 네트워크가 쿠키를 사용하여 이전 방문 기록을 기반으로 광고를 게재할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">4. 쿠키 사용</h2>
            <p>
              본 사이트는 이용자 경험 개선과 통계 분석을 위해 쿠키를 사용합니다.
              브라우저 설정을 통해 쿠키 사용을 거부하거나 삭제할 수 있으나,
              일부 기능이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">5. 맞춤 광고 비활성화 (Opt-out)</h2>
            <p>
              맞춤 광고를 원하지 않으시면 아래 방법으로 비활성화할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline"
                >
                  Google 광고 설정
                </a>
                에서 맞춤 광고를 비활성화
              </li>
              <li>
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline"
                >
                  aboutads.info
                </a>
                에서 제3자 광고 쿠키를 비활성화
              </li>
              <li>
                <a
                  href="https://www.youronlinechoices.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline"
                >
                  Your Online Choices
                </a>
                에서 유럽 지역 광고 설정 관리
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">6. 개인정보 보호 관련 문의</h2>
            <p>
              개인정보 처리에 관한 문의사항은 아래 연락처로 문의해 주세요.
            </p>
            <p>
              이메일: <a href="mailto:treedoctor@kakao.com" className="text-green-700 underline">treedoctor@kakao.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#26422E]">7. 방침 변경</h2>
            <p>
              본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며,
              변경 시 본 페이지를 통해 공지합니다.
            </p>
            <p className="text-sm text-gray-500">최종 수정일: 2025년 2월 1일</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
