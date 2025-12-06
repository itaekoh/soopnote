'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Star, FolderTree } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { checkAdminPermission } from '@/lib/api/admin';
import { UserManagement } from '@/components/admin/UserManagement';
import { FeaturedManagement } from '@/components/admin/FeaturedManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';

type TabType = 'users' | 'featured' | 'categories';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    try {
      const hasPermission = await checkAdminPermission();
      setIsAdmin(hasPermission);

      if (!hasPermission) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    } catch (error) {
      console.error('권한 확인 실패:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'users' as TabType, label: '회원 관리', icon: Users },
    { id: 'featured' as TabType, label: '추천글 관리', icon: Star },
    { id: 'categories' as TabType, label: '카테고리 관리', icon: FolderTree },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">권한 확인 중...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
          </div>
          <p className="text-gray-600">회원, 게시글, 카테고리를 관리합니다.</p>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'featured' && <FeaturedManagement />}
            {activeTab === 'categories' && <CategoryManagement />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
