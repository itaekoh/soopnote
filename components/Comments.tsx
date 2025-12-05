'use client';

import { useState, useEffect } from 'react';
import { User, Trash2, Edit2, X } from 'lucide-react';
import { getCommentsByPostId, createComment, deleteComment, updateComment } from '@/lib/api/comments';
import { supabase } from '@/lib/supabase/client';
import type { CommentWithUser } from '@/lib/types/database.types';

interface CommentsProps {
  postId: number;
  initialCount: number;
  accentColor?: string; // 'green' | 'amber' | 'purple'
  onCountChange?: (newCount: number) => void;
}

export function Comments({ postId, initialCount, accentColor = 'green', onCountChange }: CommentsProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      button: 'bg-green-700 hover:bg-green-800',
      ring: 'focus:ring-green-500',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      button: 'bg-amber-700 hover:bg-amber-800',
      ring: 'focus:ring-amber-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      button: 'bg-purple-700 hover:bg-purple-800',
      ring: 'focus:ring-purple-500',
    },
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.green;

  useEffect(() => {
    loadComments();
    checkUser();
  }, [postId]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }

  async function loadComments() {
    try {
      setLoading(true);
      const data = await getCommentsByPostId(postId);
      setComments(data);

      // 삭제되지 않은 댓글 수를 부모에게 알림
      const visibleCount = data.filter(c => !c.is_deleted).length;
      onCountChange?.(visibleCount);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setSubmitting(true);
      await createComment({
        post_id: postId,
        content: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      alert(error.message || '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error: any) {
      console.error('댓글 삭제 실패:', error);
      alert(error.message || '댓글 삭제에 실패했습니다.');
    }
  }

  async function handleEdit(commentId: number, content: string) {
    setEditingId(commentId);
    setEditContent(content);
  }

  async function handleUpdateSubmit(commentId: number) {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error: any) {
      console.error('댓글 수정 실패:', error);
      alert(error.message || '댓글 수정에 실패했습니다.');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditContent('');
  }

  function getDisplayName(comment: CommentWithUser): string {
    return comment.user?.display_name || '익명';
  }

  function getAvatarInitial(comment: CommentWithUser): string {
    const name = getDisplayName(comment);
    return name.charAt(0);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const visibleComments = comments.filter(c => !c.is_deleted);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[#26422E] mb-6">
        댓글 {visibleComments.length}개
      </h2>

      {/* 댓글 작성 폼 */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={4}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${colors.ring} focus:border-transparent resize-none mb-3`}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded-lg ${colors.button} text-white font-semibold transition-colors disabled:opacity-50`}
            >
              {submitting ? '작성 중...' : '댓글 작성'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200 text-center">
          <p className="text-gray-600">댓글을 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">댓글을 불러오는 중...</div>
      ) : visibleComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>아직 댓글이 없습니다.</p>
          <p className="text-sm mt-2">첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                {/* 아바타 */}
                <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  {comment.user?.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={getDisplayName(comment)}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className={`${colors.text} font-semibold`}>
                      {getAvatarInitial(comment)}
                    </span>
                  )}
                </div>

                {/* 댓글 내용 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {getDisplayName(comment)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-gray-400">(수정됨)</span>
                      )}
                    </div>

                    {/* 수정/삭제 버튼 */}
                    {currentUserId === comment.user_id && (
                      <div className="flex items-center gap-2">
                        {editingId !== comment.id && (
                          <>
                            <button
                              onClick={() => handleEdit(comment.id, comment.content)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                              title="수정"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 댓글 내용 or 수정 폼 */}
                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${colors.ring} focus:border-transparent resize-none mb-2`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleUpdateSubmit(comment.id)}
                          className={`px-4 py-1.5 rounded-lg ${colors.button} text-white transition-colors text-sm`}
                        >
                          수정
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
