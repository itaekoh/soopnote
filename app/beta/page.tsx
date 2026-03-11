'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// ─── 섹션 1: 신청 폼 ───────────────────────────────────────
function ApplySection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || data.error });
      if (res.ok) { setName(''); setEmail(''); }
    } catch {
      setResult({ ok: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="apply" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-xl font-bold text-[#26422E] mb-6">📝 베타 테스터 신청</h2>

      {result?.ok ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-lg font-semibold text-[#3d5c3e]">신청이 완료되었습니다!</p>
          <p className="text-sm text-gray-500 mt-2">
            2주간 앱을 사용해 보시고 결과 확인 섹션에서 혜택을 신청해 주세요.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5c3e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-[#3d5c3e] font-semibold">(Google Play 계정 Gmail)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5c3e]"
            />
            <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ 앱에서 반드시 이 이메일과 동일한 Google 계정으로 <strong>Google로 시작하기</strong>를 해주세요.
              다른 계정으로 로그인하면 활동 내역이 연결되지 않습니다.
            </p>
          </div>
          {result && !result.ok && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{result.message}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3d5c3e] text-white font-semibold rounded-lg hover:bg-[#2d4a2e] transition-colors disabled:opacity-50"
          >
            {loading ? '신청 중...' : '베타 테스터 신청하기'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── 섹션 2: 결과 확인 ─────────────────────────────────────
type CheckResult = {
  applicant: { name: string; applied_at: string; benefit_granted: boolean; benefit_months?: number };
  quizSessions: number;
  activeDays: number;
  qualified: boolean;
  appLinked: boolean;
  benefitMonthsIfGranted?: number;
  slotsRemaining?: number;
  message?: string;
};

function CheckSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkData, setCheckData] = useState<CheckResult | null>(null);
  const [checkError, setCheckError] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantResult, setGrantResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCheckData(null);
    setCheckError('');
    setGrantResult(null);
    try {
      const res = await fetch(`/api/beta/check?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCheckError(data.error); return; }
      setCheckData(data);
    } catch {
      setCheckError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async () => {
    setGrantLoading(true);
    setGrantResult(null);
    try {
      const res = await fetch('/api/beta/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setGrantResult({ ok: res.ok, message: data.message || data.error });
      if (res.ok) {
        // 결과 갱신
        const refetch = await fetch(`/api/beta/check?email=${encodeURIComponent(email.trim())}`);
        if (refetch.ok) setCheckData(await refetch.json());
      }
    } catch {
      setGrantResult({ ok: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setGrantLoading(false);
    }
  };

  return (
    <div id="check" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-xl font-bold text-[#26422E] mb-2">🏆 결과 확인 & 혜택 신청</h2>
      <p className="text-sm text-gray-500 mb-6">2주 테스트 후, 신청하신 이메일로 활동 내역을 확인해 주세요.</p>

      <form onSubmit={handleCheck} className="flex gap-2 mb-6">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="신청 시 사용한 이메일"
          required
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5c3e]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-[#3d5c3e] text-white text-sm font-semibold rounded-lg hover:bg-[#2d4a2e] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? '확인 중...' : '확인하기'}
        </button>
      </form>

      {checkError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{checkError}</p>
      )}

      {checkData && (
        <div className="space-y-4">
          {/* 활동 내역 카드 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">신청자</span>
              <span className="font-semibold text-gray-800">{checkData.applicant.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">앱 연결 상태</span>
              <span className={`font-semibold ${checkData.appLinked ? 'text-[#3d5c3e]' : 'text-red-500'}`}>
                {checkData.appLinked ? '✅ 연결됨' : '❌ 미연결 (앱 로그인 필요)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">퀴즈 참여 횟수</span>
              <span className="font-semibold text-gray-800">{checkData.quizSessions}세션</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">접속 일수</span>
              <span className="font-semibold text-gray-800">
                {checkData.activeDays}일
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${checkData.qualified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {checkData.qualified ? '조건 충족 ✓' : '조건 미충족'}
                </span>
              </span>
            </div>
            {checkData.slotsRemaining !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">남은 혜택 자리</span>
                <span className="text-sm text-gray-700">1년권 {checkData.slotsRemaining}자리</span>
              </div>
            )}
          </div>

          {/* 혜택 상태 */}
          {checkData.applicant.benefit_granted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-lg font-bold text-green-700">🎊 혜택 적용 완료!</p>
              <p className="text-sm text-green-600 mt-1">
                {checkData.applicant.benefit_months}개월 광고 제거가 앱에 적용되었습니다.
              </p>
            </div>
          ) : checkData.qualified && checkData.appLinked ? (
            <div className="space-y-3">
              {grantResult ? (
                <div className={`rounded-xl p-4 text-center ${grantResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${grantResult.ok ? 'text-green-700' : 'text-red-600'}`}>
                    {grantResult.ok ? '🎊 ' : '❌ '}{grantResult.message}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[#f0f7f0] border border-[#c8e6c9] rounded-xl p-4 text-center">
                    <p className="font-semibold text-[#2d4a2e]">
                      🎉 조건을 충족하셨습니다! ({checkData.benefitMonthsIfGranted}개월권 신청 가능)
                    </p>
                  </div>
                  <button
                    onClick={handleGrant}
                    disabled={grantLoading}
                    className="w-full py-3 bg-[#3d5c3e] text-white font-bold rounded-lg hover:bg-[#2d4a2e] transition-colors disabled:opacity-50 text-base"
                  >
                    {grantLoading ? '처리 중...' : `${checkData.benefitMonthsIfGranted}개월 광고 제거 혜택 받기`}
                  </button>
                </>
              )}
            </div>
          ) : !checkData.appLinked ? (
            <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
              앱에서 <strong>이 이메일과 동일한 Google 계정</strong>으로 로그인 후 다시 확인해 주세요.
            </p>
          ) : (
            <p className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
              자격 조건: 퀴즈 5세션 이상 + 3일 이상 접속<br />
              현재: {checkData.quizSessions}세션 / {checkData.activeDays}일 접속
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 섹션 3: 피드백 ────────────────────────────────────────
function FeedbackSection() {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || data.error });
      if (res.ok) { setEmail(''); setContent(''); }
    } catch {
      setResult({ ok: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-xl font-bold text-[#26422E] mb-2">💬 사용 후기 & 개선 의견</h2>
      <p className="text-sm text-gray-500 mb-2">솔직한 의견이 앱 개선에 큰 도움이 됩니다.</p>
      <p className="text-sm text-[#3d5c3e] bg-[#f0f7f0] px-4 py-3 rounded-lg mb-6">
        베타 테스터 여부와 관계없이 누구나 의견을 남겨주실 수 있습니다. 불편했던 점, 개선됐으면 하는 기능, 사용 소감 등 자유롭게 작성해 주세요. 하나하나 꼼꼼히 읽고 반영하겠습니다. 🙏
      </p>

      {result?.ok ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🙏</div>
          <p className="text-lg font-semibold text-[#3d5c3e]">소중한 의견 감사합니다!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-gray-400 font-normal">(선택, 답변 원하시면 입력)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5c3e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="사용 소감, 불편한 점, 개선 제안 등 자유롭게 작성해 주세요."
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d5c3e] resize-none"
            />
          </div>
          {result && !result.ok && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{result.message}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3d5c3e] text-white font-semibold rounded-lg hover:bg-[#2d4a2e] transition-colors disabled:opacity-50"
          >
            {loading ? '제출 중...' : '의견 보내기'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── 메인 페이지 ────────────────────────────────────────────
export default function BetaPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-10">

        {/* 히어로 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#e8f0e8] text-[#3d5c3e] text-sm font-semibold px-4 py-1.5 rounded-full">
            🌲 선착순 15명 모집
          </div>
          <h1 className="text-3xl font-bold text-[#26422E]">
            트리오! 베타 테스터 모집
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            나무의사 시험을 준비하는 수험생을 위한 수종 퀴즈 앱 <strong>트리오!</strong>의<br />
            베타 테스터를 모집합니다. 2주간 테스트 후 혜택을 드립니다.
          </p>
        </div>

        {/* 참여 안내 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-500 mb-2">참여 조건</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              2주 내 퀴즈 <strong>5세션 이상</strong> 참여<br />
              <strong>3일 이상</strong> 접속<br />
              Google 계정으로 앱 로그인 필수
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-500 mb-2">혜택</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              🎁 선착순 15명 전원 <strong>1년 광고 제거</strong><br />
              <span className="text-xs text-gray-500">요건 충족 후 결과 확인 섹션에서<br />직접 신청하셔야 합니다.</span>
            </p>
          </div>
        </div>

        {/* 참여 방법 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-[#26422E] mb-5">참여 방법</h2>
          <ol className="space-y-4">
            {[
              { step: '01', text: '아래 신청 폼에 이름과 이메일(Gmail)을 입력해 신청합니다.' },
              { step: '02', text: '아래 링크로 앱을 설치하고, 신청한 Gmail로 Google 로그인합니다.' },
              { step: '03', text: '2주간 자유롭게 퀴즈를 풀어보세요. (5세션 이상, 3일 이상 접속)' },
              { step: '04', text: '결과 확인 섹션에서 이메일로 활동 내역을 확인하고 혜택을 신청합니다.' },
            ].map(({ step, text }) => (
              <li key={step} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-[#3d5c3e] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed pt-1">{text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://play.google.com/apps/testing/com.soopify.tree.quiz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#3d5c3e] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#2d4a2e] transition-colors"
            >
              🌐 웹에서 테스트 참여
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.soopify.tree.quiz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#3d5c3e] text-[#3d5c3e] text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#f0f7f0] transition-colors"
            >
              📱 Android에서 다운로드
            </a>
          </div>
        </div>

        {/* 신청 폼 */}
        <ApplySection />

        {/* 결과 확인 */}
        <CheckSection />

        {/* 피드백 */}
        <FeedbackSection />

      </main>
      <Footer />
    </div>
  );
}
