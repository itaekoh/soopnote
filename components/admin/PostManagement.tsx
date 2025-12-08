'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { getAllPostsForAdmin } from '@/lib/api/admin';
import { supabase } from '@/lib/supabase/client';
import type { PostFull } from '@/lib/types/database.types';

export function PostManagement() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadPosts();
  }, []);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from('sn_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserRole(data.role);
      }
    }
  }

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await getAllPostsForAdmin();
      setPosts(data);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: number, authorId: string | null) {
    // 권한 체크: super_admin이거나 자신의 글
    if (userRole !== 'super_admin' && authorId !== currentUserId) {
      alert('본인의 글만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sn_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      alert('게시글이 삭제되었습니다.');
      loadPosts();
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert(`삭제에 실패했습니다: ${error.message}`);
    }
  }

  function handleEdit(postId: number, authorId: string | null) {
    // 권한 체크: super_admin이거나 자신의 글
    if (userRole !== 'super_admin' && authorId !== currentUserId) {
      alert('본인의 글만 수정할 수 있습니다.');
      return;
    }

    router.push(`/write/${postId}`);
  }

  function canEdit(authorId: string | null): boolean {
    if (userRole === 'super_admin') return true;
    if (authorId === currentUserId) return true;
    return false;
  }

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">발행됨</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">임시저장</span>;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          게시글 관리 ({posts.length}개)
        </h2>
        {userRole === 'writer' && (
          <p className="text-sm text-gray-500">본인이 작성한 글만 수정/삭제할 수 있습니다.</p>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {post.excerpt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {post.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author_name || '알 수 없음'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit(post.author_id) ? (
                        <>
                          <button
                            onClick={() => handleEdit(post.id, post.author_id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.author_id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">수정 불가</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
