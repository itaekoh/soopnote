'use client';

import { Leaf, LogOut, User as UserIcon, Edit, Shield, Menu, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 모바일 메뉴 열릴 때 스크롤 방지
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false);
      setShowMobileMenu(false);
      await signOut();
      // router.push 대신 window.location 사용 (확실한 페이지 이동)
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // 에러가 발생해도 강제로 홈으로 이동
      alert('로그아웃 중 오류가 발생했습니다. 페이지를 새로고침합니다.');
      window.location.href = '/';
    }
  };

  // 글쓰기 권한 확인 (writer 또는 super_admin)
  const canWrite = profile?.role === 'writer' || profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'super_admin';

  return (
    <header className="sticky top-0 bg-[#F5F3EE]/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" strokeWidth={1.8} />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-semibold">soopnote</div>
            <div className="text-xs text-gray-500 -mt-0.5">plant journal & tree doctor</div>
          </div>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          <Link className="text-sm hover:text-green-700 transition-colors" href="/wildflower">
            야생화 일지
          </Link>
          <Link className="text-sm hover:text-green-700 transition-colors" href="/tree-diagnose">
            나무진단
          </Link>
          <Link className="text-sm hover:text-green-700 transition-colors" href="/logs">
            아카이브
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
                  {isAdmin && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
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
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-red-600" />
                        관리자 페이지
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      계정 설정
                    </Link>
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

        {/* 모바일 메뉴 버튼 */}
        <div className="flex md:hidden items-center gap-2">
          {user && canWrite && (
            <Link
              href="/write"
              className="p-2 rounded-lg bg-green-700 text-white shadow-sm"
            >
              <Edit className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 bg-[#F5F3EE] z-[60]">
          {/* 모바일 메뉴 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F5F3EE]">
            <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-green-700" strokeWidth={1.8} />
              </div>
              <span className="text-lg font-semibold text-gray-900">soopnote</span>
            </Link>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-lg bg-white/80 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          <div className="h-[calc(100vh-73px)] overflow-y-auto p-6 bg-[#F5F3EE]">
            <div className="flex flex-col space-y-3">
              <Link
                href="/wildflower"
                onClick={() => setShowMobileMenu(false)}
                className="block text-base py-4 px-4 rounded-xl bg-white text-gray-900 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                🌸 야생화 일지
              </Link>
              <Link
                href="/tree-diagnose"
                onClick={() => setShowMobileMenu(false)}
                className="block text-base py-4 px-4 rounded-xl bg-white text-gray-900 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                🌳 나무진단
              </Link>
              <Link
                href="/logs"
                onClick={() => setShowMobileMenu(false)}
                className="block text-base py-4 px-4 rounded-xl bg-white text-gray-900 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                ✍️ 아카이브
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/80 rounded-xl mb-3 shadow-sm">
                      <UserIcon className="w-5 h-5 text-gray-700" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{profile?.display_name || '사용자'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      {isAdmin && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          관리자
                        </span>
                      )}
                      {profile?.role === 'writer' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          작성자
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 text-base py-3 px-4 rounded-xl bg-white text-red-700 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98] mb-2"
                      >
                        <Shield className="w-5 h-5" />
                        관리자 페이지
                      </Link>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 text-base py-3 px-4 rounded-xl bg-white text-gray-900 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98] mb-2"
                    >
                      <Settings className="w-5 h-5" />
                      계정 설정
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 text-base py-3 px-4 rounded-xl bg-white text-gray-900 font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <LogOut className="w-5 h-5" />
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-4 px-4 rounded-xl bg-green-700 text-white text-center font-medium shadow-md hover:bg-green-800 transition-all active:scale-[0.98]"
                  >
                    로그인
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
