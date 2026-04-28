'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Lock, CheckCircle2 } from 'lucide-react';

type Stage = 'verifying' | 'ready' | 'done' | 'invalid';

export default function ResetPasswordPage() {
  const [stage, setStage] = useState<Stage>('verifying');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // @supabase/ssr 의 createBrowserClient 는 PKCE+cookie 기반이라
    // 이메일 recovery의 hash 기반 토큰을 자동 처리하지 않는다.
    // → hash를 직접 파싱해서 setSession() 으로 명시 적용.
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // 1) error 가 있으면 즉시 invalid
    if (hash.includes('error=') || search.includes('error=')) {
      setStage('invalid');
      return;
    }

    // 2) hash 파싱
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (!accessToken || !refreshToken || type !== 'recovery') {
      setStage('invalid');
      return;
    }

    // 3) 세션 명시 적용
    let cancelled = false;
    (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (cancelled) return;
      if (error) {
        setStage('invalid');
        return;
      }
      setStage('ready');
      // hash 에서 토큰을 지워 새로고침 시 재사용/노출 방지
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch (_) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pw.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (pw !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setStage('done');
      // 변경 후 세션 정리 — 사용자가 다시 새 비밀번호로 로그인하도록
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              {stage === 'done' ? (
                <CheckCircle2 className="w-8 h-8 text-green-700" />
              ) : (
                <Lock className="w-8 h-8 text-green-700" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-[#26422E] mb-2">
              {stage === 'done' ? '변경 완료' : '비밀번호 재설정'}
            </h1>
            <p className="text-gray-600">
              {stage === 'verifying' && '링크를 확인하는 중…'}
              {stage === 'ready' && '새로 사용할 비밀번호를 입력해주세요.'}
              {stage === 'done' && '비밀번호가 변경되었습니다.'}
              {stage === 'invalid' && '링크가 만료되었거나 유효하지 않습니다.'}
            </p>
          </div>

          {stage === 'verifying' && (
            <div className="text-center text-gray-500 py-8">잠시만 기다려주세요…</div>
          )}

          {stage === 'invalid' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                재설정 링크는 일정 시간이 지나면 만료됩니다.
                <br />
                앱에서 비밀번호 재설정 메일을 다시 보내주세요.
              </div>
              <Link
                href="/login"
                className="block w-full py-3 text-center bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
              >
                로그인 페이지로
              </Link>
            </div>
          )}

          {stage === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6자 이상"
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="비밀번호를 다시 입력"
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '변경 중…' : '비밀번호 변경'}
              </button>
            </form>
          )}

          {stage === 'done' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm leading-relaxed">
                새 비밀번호로 앱 또는 웹에서 다시 로그인해주세요.
              </div>
              <Link
                href="/login"
                className="block w-full py-3 text-center bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
              >
                로그인 페이지로
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
