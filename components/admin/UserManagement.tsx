'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllUsers, updateUserRole, updateTestAccountFlag } from '@/lib/api/admin';
import type { User, UserRole, SubscriptionState } from '@/lib/types/database.types';

type SubFilter = 'all' | 'paid' | 'none';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<SubFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('회원 목록 로딩 실패:', error);
      alert('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTest(userId: string, current: boolean) {
    try {
      await updateTestAccountFlag(userId, !current);
      // 낙관적 업데이트
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_test_account: !current } : u));
    } catch {
      alert('테스트 계정 플래그 변경에 실패했습니다.');
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (!confirm(`정말 권한을 변경하시겠습니까?\n새 권한: ${newRole}`)) {
      return;
    }

    try {
      setUpdating(userId);
      await updateUserRole(userId, newRole);
      alert('권한이 변경되었습니다.');
      await loadUsers();
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert('권한 변경에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  }

  // 활성 구독 판정 (앱의 isPremium 로직과 동일)
  // canceled도 expires_at 까지는 활성 (자동갱신만 취소된 케이스)
  const isActiveSubscriber = (u: User): boolean => {
    const state = u.subscription_state;
    if (state !== 'active' && state !== 'grace_period' && state !== 'canceled') return false;
    if (!u.subscription_expires_at) return false;
    return new Date(u.subscription_expires_at) > new Date();
  };

  // 구독 상품 라벨
  const getProductLabel = (productId: string | null | undefined): string => {
    if (!productId) return '-';
    if (productId.includes('annual')) return '연간';
    if (productId.includes('monthly')) return '월간';
    return productId;
  };

  // 구독 상태 배지 색상
  const getSubBadge = (u: User) => {
    const state = u.subscription_state ?? 'none';
    const active = isActiveSubscriber(u);
    if (active) {
      return state === 'grace_period'
        ? { color: 'bg-yellow-100 text-yellow-700', label: '유예' }
        : { color: 'bg-green-100 text-green-700', label: '활성' };
    }
    switch (state) {
      case 'cancelled':
        return { color: 'bg-orange-100 text-orange-700', label: '취소됨' };
      case 'expired':
        return { color: 'bg-gray-200 text-gray-600', label: '만료' };
      case 'on_hold':
        return { color: 'bg-red-100 text-red-700', label: '보류' };
      case 'paused':
        return { color: 'bg-blue-100 text-blue-700', label: '일시정지' };
      default:
        return { color: 'bg-gray-100 text-gray-400', label: '-' };
    }
  };

  // 필터링
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (subFilter === 'paid' && !isActiveSubscriber(u)) return false;
      if (subFilter === 'none' && isActiveSubscriber(u)) return false;
      if (q) {
        const hay = `${u.email} ${u.display_name || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, subFilter, searchQuery]);

  const activeSubCount = useMemo(() => users.filter(isActiveSubscriber).length, [users]);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'writer':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '최고 관리자';
      case 'writer':
        return '작성자';
      case 'user':
        return '일반 회원';
      default:
        return role;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">회원 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          전체 회원 <span className="text-gray-500">({filteredUsers.length}/{users.length}명)</span>
          {' '}
          <span className="ml-2 text-sm font-normal text-green-700">
            💎 활성 구독: {activeSubCount}명
          </span>
        </h2>
      </div>

      {/* 필터 / 검색 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이메일·이름 검색…"
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
        <select
          value={subFilter}
          onChange={(e) => setSubFilter(e.target.value as SubFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
          title="구독 필터"
        >
          <option value="all">전체</option>
          <option value="paid">💎 구독 회원만</option>
          <option value="none">미구독</option>
        </select>
        {(subFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => { setSubFilter('all'); setSearchQuery(''); }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구독</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">만료일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="통계에서 제외할 테스트 계정 (본인 부계정 등)">🧪 테스트</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한 변경</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const badge = getSubBadge(user);
              const active = isActiveSubscriber(user);
              return (
                <tr key={user.id} className={`hover:bg-gray-50 ${active ? 'bg-green-50/30' : ''} ${user.is_test_account ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {user.display_name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {getProductLabel(user.subscription_product_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {user.subscription_expires_at
                      ? new Date(user.subscription_expires_at).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={!!user.is_test_account}
                      onChange={() => handleToggleTest(user.id, !!user.is_test_account)}
                      className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                      title="체크 시 구독 분석 등 통계에서 제외됩니다"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updating === user.id}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="user">일반 회원</option>
                      <option value="writer">작성자</option>
                      <option value="super_admin">최고 관리자</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          조건에 맞는 회원이 없습니다.{' '}
          <button onClick={() => { setSubFilter('all'); setSearchQuery(''); }} className="text-red-600 hover:underline">
            필터 초기화
          </button>
        </div>
      )}
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">등록된 회원이 없습니다.</div>
      )}
    </div>
  );
}
