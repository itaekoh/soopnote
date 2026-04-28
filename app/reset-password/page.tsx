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
    // 1) URL hash 또는 query에 error가 있으면 바로 invalid
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';

    if (hash.includes('error=') || search.includes('error=')) {
      setStage('invalid');
      return;
    }

    // 2) hash에 access_token 또는 type=recovery 가 있으면 recovery 흐름
    //    Supabase JS가 자동으로 hash를 파싱해 세션을 만든다 (detectSessionInUrl: true 기본값)
    const hasRecoveryHash =
      hash.includes('access_token=') || hash.includes('type=recovery');

    let resolved = false;

    const markReady = () => {
      if (!resolved) {
        resolved = true;
        setStage('ready');
      }
    };

    // 3) Supabase 이벤트 listener — PASSWORD_RECOVERY / SIGNED_IN / INITIAL_SESSION 모두 허용
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        markReady();
        return;
      }
      // recovery hash가 있는 상태에서 세션이 잡히면 ready로 간주
      if (hasRecoveryHash && session) {
        markReady();
      }
    });

    // 4) 이미 처리된 세션 폴링 (이벤트 놓쳤을 경우 대비)
    const poll = async () => {
      for (let i = 0; i < 20; i++) {
        if (resolved) return;
        const { data } = await supabase.auth.getSession();
        if (data.session && hasRecoveryHash) {
          markReady();
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      // 5초 동안 세션이 안 잡히면 invalid
      if (!resolved) setStage('invalid');
    };

    if (hasRecoveryHash) {
      poll();
    } else {
      // hash 자체에 recovery 토큰이 없으면 잘못된 진입
      setStage('invalid');
    }

    return () => {
      sub.subscription.unsubscribe();
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
