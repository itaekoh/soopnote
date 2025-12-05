'use client';

import { Leaf, LogOut, User as UserIcon, Edit } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 글쓰기 권한 확인 (writer 또는 super_admin)
  const canWrite = profile?.role === 'writer' || profile?.role === 'super_admin';

  return (
    <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <Leaf className="w-7 h-7 text-green-700" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-lg font-semibold">soopnote</div>
          <div className="text-xs text-gray-500 -mt-0.5">plant journal & tree doctor</div>
        </div>
      </Link>

      <nav className="flex items-center gap-6">
        <Link className="text-sm hover:text-green-700 transition-colors" href="/wildflower">
          야생화 일지
        </Link>
        <Link className="text-sm hover:text-green-700 transition-colors" href="/tree-diagnose">
          나무진단
        </Link>
        <Link className="text-sm hover:text-green-700 transition-colors" href="/column">
          칼럼
        </Link>

        {/* 로그인된 경우 */}
        {user ? (
          <>
            {/* 글쓰기 버튼 (writer, super_admin만) */}
            {canWrite && (
              <Link
                href="/write"
                className="ml-2 py-2 px-4 rounded-lg bg-green-700 text-white text-sm shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                글쓰기
              </Link>
            )}

            {/* 사용자 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-sm">{profile?.display_name || '사용자'}</span>
                {profile?.role === 'super_admin' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    관리자
                  </span>
                )}
                {profile?.role === 'writer' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    작성자
                  </span>
                )}
              </button>

              {/* 드롭다운 메뉴 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 로그인되지 않은 경우 */
          <Link
            href="/login"
            className="py-2 px-4 rounded-lg bg-green-700 text-white text-sm shadow-sm hover:bg-green-800 transition-colors"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
