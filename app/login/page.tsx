'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithKakao, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setError('');
    setSocialLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithKakao();
      }
    } catch (err: any) {
      setError(err.message || '소셜 로그인에 실패했습니다.');
      setSocialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-green-700" />
            </div>
            <h1 className="text-3xl font-bold text-[#26422E] mb-2">로그인</h1>
            <p className="text-gray-600">숲의 기록에 오신 것을 환영합니다</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              disabled={socialLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.64 5.18-.16.57-.58 2.07-.67 2.39-.1.39.14.39.3.28.12-.08 1.93-1.31 2.71-1.84.65.09 1.32.14 2.02.14 4.42 0 8-2.79 8-6.21C17 3.79 13.42 1 9 1z" fill="#000000"/>
              </svg>
              카카오로 시작하기
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading}
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="비밀번호"
                required
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-green-700 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
