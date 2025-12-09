'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/contexts/AuthContext';
import { User, Mail, Calendar, AlertTriangle, Trash2 } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // 로그인하지 않은 경우 리다이렉트
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '회원탈퇴') {
      setError('정확히 "회원탈퇴"를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      console.log('회원 탈퇴 시작...');
      await deleteAccount();
      console.log('회원 탈퇴 완료, 리다이렉트됩니다...');
      // deleteAccount 함수 내부에서 리다이렉트 처리됨
    } catch (err: any) {
      console.error('회원 탈퇴 실패:', err);
      setError(err.message || '회원 탈퇴에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#26422E] mb-2">계정 설정</h1>
          <p className="text-gray-600">회원 정보 및 계정 관리</p>
        </div>

        {/* 계정 정보 섹션 */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-semibold text-[#26422E] mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            계정 정보
          </h2>

          <div className="space-y-4">
            {/* 이메일 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 mb-1">이메일</p>
                <p className="text-gray-800 font-medium">{user?.email}</p>
              </div>
            </div>

            {/* 표시 이름 */}
            {profile?.display_name && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">표시 이름</p>
                  <p className="text-gray-800 font-medium">{profile.display_name}</p>
                </div>
              </div>
            )}

            {/* 가입일 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 mb-1">가입일</p>
                <p className="text-gray-800 font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
            </div>

            {/* 역할 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 mb-1">역할</p>
                <p className="text-gray-800 font-medium">
                  {profile?.role === 'super_admin' ? '관리자' : profile?.role === 'writer' ? '작성자' : '일반 회원'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 위험 구역 */}
        <div className="bg-white rounded-2xl shadow-md p-8 border-2 border-red-100">
          <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            위험 구역
          </h2>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">회원 탈퇴</p>
            <p className="text-sm text-gray-600 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
              <li>작성한 게시글은 유지되지만 작성자 정보가 제거됩니다</li>
              <li>작성한 댓글은 유지되지만 작성자 정보가 제거됩니다</li>
              <li>좋아요 기록이 모두 삭제됩니다</li>
              <li>계정 정보가 완전히 삭제됩니다</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            회원 탈퇴
          </button>
        </div>
      </main>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">회원 탈퇴 확인</h3>
            </div>

            <p className="text-gray-700 mb-4">
              정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                확인을 위해 <span className="font-bold text-red-600">"회원탈퇴"</span>를 입력해주세요
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="회원탈퇴"
                disabled={isDeleting}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setError('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== '회원탈퇴'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    탈퇴 처리 중...
                  </>
                ) : (
                  '탈퇴하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
