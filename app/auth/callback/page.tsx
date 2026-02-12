'use client';

import { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = new URL(window.location.href).searchParams.get('code');

        if (!code) {
          window.location.href = '/login?error=no_code';
          return;
        }

        // 브라우저 Supabase 클라이언트에서 직접 세션 교환
        // → 세션이 브라우저 쿠키에 직접 저장됨 (서버 쿠키 전달 문제 없음)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Auth callback error:', error);
          window.location.href = '/login?error=auth_callback_error';
          return;
        }

        // 세션이 브라우저에 직접 설정된 상태에서 홈으로 이동
        window.location.href = '/';
      } catch (err) {
        console.error('Auth callback exception:', err);
        window.location.href = '/login?error=auth_callback_error';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6 text-green-700" />
          </div>
        </div>
        <div className="text-gray-600">로그인 처리 중...</div>
      </div>
    </div>
  );
}
