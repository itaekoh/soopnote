'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Eye, MapPin, Clock, ArrowLeft, User, Tag, Heart, Share2, MessageCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Comments } from '@/components/Comments';
import { ImageModal } from '@/components/ImageModal';
import { getPostFullById, incrementViewCount } from '@/lib/api/posts';
import { checkUserLike, toggleLike } from '@/lib/api/likes';
import { supabase } from '@/lib/supabase/client';
import type { PostFull } from '@/lib/types/database.types';

export default function WildflowerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentUser();
    loadPost();
  }, [postId]);

  // 본문 이미지 클릭 시 확대 기능
  useEffect(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    const images = content.querySelectorAll('img');

    // 이미지에 커서 스타일 적용
    images.forEach((img) => {
      img.style.cursor = 'pointer';
    });

    // 이벤트 위임 방식으로 클릭 처리
    const handleContentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        setSelectedImage(img.src);
      }
    };

    content.addEventListener('click', handleContentClick);

    return () => {
      content.removeEventListener('click', handleContentClick);
    };
  }, [post]);

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

  function canEdit(): boolean {
    if (!post) return false;
    if (userRole === 'super_admin') return true;
    if (post.author_id === currentUserId) return true;
    return false;
  }

  function handleEdit() {
    if (!canEdit()) {
      alert('본인의 글만 수정할 수 있습니다.');
      return;
    }
    router.push(`/write/${postId}`);
  }

  async function handleDelete() {
    if (!canEdit()) {
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
      router.push('/wildflower');
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert(`삭제에 실패했습니다: ${error.message}`);
    }
  }

  async function handleShare() {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url: window.location.href,
    };

    try {
      // Web Share API 지원 확인
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('공유 성공');
      } else {
        // Web Share API 미지원 시 클립보드 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('공유 실패:', error);
        // 클립보드 복사도 실패한 경우
        alert('공유에 실패했습니다. 링크를 직접 복사해주세요:\n' + window.location.href);
      }
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
              href="/wildflower"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
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
        {/* 상단: 뒤로가기 버튼 및 관리 버튼 */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/wildflower"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </Link>

          {/* 수정/삭제 버튼 (권한이 있는 경우만 표시) */}
          {canEdit() && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="수정"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">수정</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">삭제</span>
              </button>
            </div>
          )}
        </div>

        {/* 카테고리 배지 */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
            {post.category_name}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-6 leading-tight">
          {post.title}
        </h1>

        {/* 요약 */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-green-500 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200 text-sm text-gray-600">
          {/* 작성자 */}
          <div className="flex items-center gap-2">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name || '탈퇴한 사용자'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-4 h-4 text-green-700" />
              </div>
            )}
            <span className={`font-medium ${post.author_name ? 'text-gray-800' : 'text-gray-400'}`}>
              {post.author_name || '탈퇴한 사용자'}
            </span>
          </div>

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
          ref={contentRef}
          className="prose prose-lg max-w-none mb-12 overflow-x-auto"
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
                  className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm"
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
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <Comments
          postId={post.id}
          initialCount={post.comment_count}
          accentColor="green"
          onCountChange={setCommentCount}
        />

        {/* 하단: 목록으로 돌아가기 */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/wildflower"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            목록으로 돌아가기
          </Link>
        </div>
      </article>

      <Footer />

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
