'use client';

import { useState, useEffect } from 'react';
import { getAllPostsForAdmin, toggleFeatured } from '@/lib/api/admin';
import type { Post } from '@/lib/types/database.types';
import { Star } from 'lucide-react';

export function FeaturedManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await getAllPostsForAdmin();
      setPosts(data);
    } catch (error) {
      console.error('게시글 목록 로딩 실패:', error);
      alert('게시글 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFeatured(postId: number, currentStatus: boolean) {
    try {
      setUpdating(postId);
      await toggleFeatured(postId, !currentStatus);
      await loadPosts();
    } catch (error) {
      console.error('추천글 설정 실패:', error);
      alert('추천글 설정에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (filter === 'featured') {
      return post.is_featured;
    }
    return true;
  });

  const featuredCount = posts.filter((p) => p.is_featured).length;

  if (loading) {
    return <div className="text-center py-8 text-gray-600">게시글 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          메인 추천글 관리{' '}
          <span className="text-sm text-gray-500">
            (현재 {featuredCount}개 / 전체 {posts.length}개)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === 'featured'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            추천글만
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          💡 메인 페이지 상단에 표시할 게시글을 선택하세요. (권장: 2개)
        </p>
      </div>

      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              post.is_featured
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {post.is_featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
                <h3 className="font-semibold text-gray-900">{post.title}</h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>ID: {post.id}</span>
                <span>상태: {post.status === 'published' ? '게시됨' : '비공개'}</span>
                <span>조회수: {post.view_count}</span>
                <span>좋아요: {post.like_count}</span>
                <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            <button
              onClick={() => handleToggleFeatured(post.id, post.is_featured)}
              disabled={updating === post.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                post.is_featured
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {updating === post.id
                ? '처리중...'
                : post.is_featured
                ? '추천 해제'
                : '추천 설정'}
            </button>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {filter === 'featured' ? '추천 게시글이 없습니다.' : '게시글이 없습니다.'}
        </div>
      )}
    </div>
  );
}
