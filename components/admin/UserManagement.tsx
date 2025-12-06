'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '@/lib/api/admin';
import type { User, UserRole } from '@/lib/types/database.types';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          전체 회원 <span className="text-gray-500">({users.length}명)</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                현재 권한
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                권한 변경
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.display_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
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
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">등록된 회원이 없습니다.</div>
      )}
    </div>
  );
}
