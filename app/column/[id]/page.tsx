'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Eye, MapPin, Clock, ArrowLeft, User, Tag, Heart, Share2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Comments } from '@/components/Comments';
import { getPostFullById, incrementViewCount } from '@/lib/api/posts';
import { checkUserLike, toggleLike } from '@/lib/api/likes';
import type { PostFull } from '@/lib/types/database.types';

export default function ColumnDetailPage() {
  const params = useParams();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    loadPost();
  }, [postId]);

  async function loadPost() {
    try {
      if (isNaN(postId)) {
        setError('잘못된 게시글 ID입니다.');
        setLoading(false);
        return;
      }

      const postData = await getPostFullById(postId);

      if (!postData) {
        setError('게시글을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setPost(postData);
      setLikeCount(postData.like_count);
      setCommentCount(postData.comment_count);
      setLoading(false);

      // 조회수 증가
      incrementViewCount(postId).catch(console.error);

      // 좋아요 상태 확인
      const liked = await checkUserLike(postId);
      setIsLiked(liked);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      setError('게시글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }

  async function handleLikeToggle() {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newLikedState = await toggleLike(postId);
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error: any) {
      console.error('좋아요 토글 실패:', error);
      alert(error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center text-gray-600">게시글을 불러오는 중...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-gray-600 mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
            <Link
              href="/column"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 게시글 상세 */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* 상단: 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            href="/column"
            className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </Link>
        </div>

        {/* 카테고리 배지 */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
            {post.category_name}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 요약 */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-purple-500 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200 text-sm text-gray-600">
          {/* 작성자 */}
          {post.author_name && (
            <div className="flex items-center gap-2">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-700" />
                </div>
              )}
              <span className="font-medium text-gray-800">{post.author_name}</span>
            </div>
          )}

          {/* 발행일 */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{post.published_date}</span>
          </div>

          {/* 조회수 */}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.view_count}</span>
          </div>

          {/* 읽기 시간 */}
          {post.read_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.read_time} 읽기</span>
            </div>
          )}

          {/* 위치 */}
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        {/* 대표 이미지 */}
        {post.featured_image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* 본문 */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 서브카테고리 태그 */}
        {post.subcategory_names && post.subcategory_names.length > 0 && (
          <div className="mb-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">관련 태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.subcategory_names.map((name, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 상호작용 영역 */}
        <div className="border-y border-gray-200 py-6 my-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentCount}</span>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <Comments
          postId={post.id}
          initialCount={post.comment_count}
          accentColor="purple"
          onCountChange={setCommentCount}
        />

        {/* 하단: 목록으로 돌아가기 */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/column"
            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            목록으로 돌아가기
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
