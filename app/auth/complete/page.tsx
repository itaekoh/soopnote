'use client';

import { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCompletePage() {
  useEffect(() => {
    // 서버에서 설정한 쿠키가 브라우저에 정착될 때까지 대기 후
    // 세션 확인하고 홈으로 이동
    const completeAuth = async () => {
      try {
        // 브라우저 쿠키에서 세션 읽기 (서버 callback에서 설정됨)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // 세션 확인됨 → 홈으로 이동 (전체 페이지 로드)
          window.location.href = '/';
        } else {
          // 세션 없음 → 잠시 대기 후 재시도
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              window.location.href = '/';
            } else {
              window.location.href = '/login?error=session_not_found';
            }
          }, 1000);
        }
      } catch {
        window.location.href = '/login?error=auth_complete_error';
      }
    };

    completeAuth();
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
