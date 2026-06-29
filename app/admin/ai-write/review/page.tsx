'use client';

// ============================================
// AI 글쓰기 — 검토 / 편집 / 발행 화면
// 입력 화면(/admin/ai-write)에서 생성한 초안을 sessionStorage로 넘겨받아
// 사용자가 다듬은 뒤 게시글로 저장한다. (write 페이지의 저장 로직 재사용)
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Editor } from '@tinymce/tinymce-react';
import { Save, X, Upload, Sparkles, ArrowLeft } from 'lucide-react';
import { createPost } from '@/lib/api/posts';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import imageCompression from 'browser-image-compression';

interface AiWriteDraft {
  categoryId: number;
  categorySlug: string;
  subcategoryIds: number[];
  subject: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  readTime: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  wildflower: '식물 관찰',
  'tree-diagnose': '나무진단',
  logs: '아카이브',
};

export default function AiWriteReviewPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const { user, profile, loading: authLoading } = useAuth();

  const [draft, setDraft] = useState<AiWriteDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 편집 가능한 필드
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [readTime, setReadTime] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialContent, setInitialContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState('');
  const [error, setError] = useState('');

  // 권한 체크 (write 페이지와 동일 패턴)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      if (profile && profile.role === 'user') {
        alert('글쓰기 권한이 없습니다.');
        router.push('/');
      }
    }
  }, [authLoading, user, profile, router]);

  // 생성 초안 로드
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ai-write-draft');
      if (raw) {
        const parsed = JSON.parse(raw) as AiWriteDraft;
        setDraft(parsed);
        setTitle(parsed.title || '');
        setExcerpt(parsed.excerpt || '');
        setReadTime(parsed.readTime || '');
        setInitialContent(parsed.contentHtml || '');
      }
    } catch (e) {
      console.error('초안 로드 실패:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  const handleSave = async (isDraft: boolean) => {
    setError('');
    if (!draft) return;
    if (!editorRef.current) return;

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!excerpt.trim()) {
      setError('요약을 입력해주세요.');
      return;
    }
    const content = editorRef.current.getContent();
    if (!content.trim()) {
      setError('본문이 비어 있습니다.');
      return;
    }
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      // 대표 이미지 업로드 (선택, write 페이지와 동일)
      let imageUrl: string | undefined;
      if (imageFile) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        if (imageFile.size > MAX_IMAGE_SIZE) {
          setError('이미지 파일은 5MB 이하만 업로드 가능합니다.');
          setSaving(false);
          return;
        }
        setSavingStatus('이미지 업로드 중...');
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `posts/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);
        if (uploadError) {
          setError(`이미지 업로드 실패: ${uploadError.message}`);
          setSaving(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      setSavingStatus('게시글 저장 중...');
      const postData = {
        title,
        excerpt,
        content,
        category_id: draft.categoryId,
        published_date: date,
        location: location || undefined,
        read_time: readTime || undefined,
        featured_image_url: imageUrl,
        subcategory_ids:
          draft.subcategoryIds && draft.subcategoryIds.length > 0
            ? draft.subcategoryIds
            : undefined,
        status: (isDraft ? 'draft' : 'published') as 'draft' | 'published',
      };

      const createPromise = createPost(postData, user.id);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('게시글 저장 시간 초과 (30초).')), 30000)
      );
      await Promise.race([createPromise, timeoutPromise]);

      sessionStorage.removeItem('ai-write-draft');
      setSavingStatus('완료!');
      alert(isDraft ? '임시저장되었습니다!' : '글이 발행되었습니다!');
      router.push(`/${draft.categorySlug}`);
    } catch (err: any) {
      console.error('저장 실패:', err);
      setError(err.message || '글 저장에 실패했습니다.');
    } finally {
      setSaving(false);
      setSavingStatus('');
    }
  };

  // 로딩
  if (authLoading || !hydrated) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600">로딩중...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || profile.role === 'user') {
    return null;
  }

  // 초안 없음 → 입력 화면으로 안내
  if (!draft) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-gray-600 mb-6">표시할 AI 초안이 없습니다. 먼저 입력 화면에서 초안을 생성해 주세요.</p>
          <button
            onClick={() => router.push('/admin/ai-write')}
            className="px-6 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            AI 글쓰기로 이동
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-6 h-6 text-green-700" />
              <h1 className="text-3xl font-bold text-[#26422E]">AI 초안 검토</h1>
            </div>
            <p className="text-gray-600">
              생성된 초안을 다듬어 발행하세요. ·{' '}
              <span className="font-medium">{CATEGORY_LABEL[draft.categorySlug] || draft.categorySlug}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/ai-write')}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            다시 생성
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 제목 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* 날짜 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* 상세 주소 (식물 관찰 / 나무진단) */}
        {(draft.categorySlug === 'wildflower' || draft.categorySlug === 'tree-diagnose') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 주소 (선택)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="예: 강원도 강릉시 주문진읍"
            />
          </div>
        )}

        {/* 읽기 시간 (아카이브) */}
        {draft.categorySlug === 'logs' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">읽기 시간</label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="예: 5분"
            />
          </div>
        )}

        {/* 요약 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">요약</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 대표 이미지 (선택) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            대표 이미지 (선택)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const compressed = await imageCompression(file, {
                    maxSizeMB: 4,
                    maxWidthOrHeight: 2048,
                    useWebWorker: true,
                    fileType: file.type,
                  });
                  setImageFile(compressed);
                } catch (err) {
                  console.error('이미지 압축 실패:', err);
                  alert('이미지 처리 중 오류가 발생했습니다.');
                  e.target.value = '';
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imageFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 font-medium">{imageFile.name}</div>
                  <div className="text-sm text-gray-500">클릭하여 다른 이미지 선택</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-400" />
                  <div className="text-gray-600">클릭하여 이미지 업로드</div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 본문 에디터 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
              initialValue={initialContent}
              init={{
                height: 560,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | image media | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                language: 'ko-KR',
                placeholder: '내용을 입력하세요...',
                automatic_uploads: true,
                paste_data_images: true,
                images_file_types: 'jpeg,jpg,png,gif,webp,svg',
                images_reuse_filename: false,
                file_picker_types: 'image',
                convert_urls: false,
                images_upload_handler: async (blobInfo: any) => {
                  const originalFilename = blobInfo.filename();
                  const blob = blobInfo.blob();
                  try {
                    const originalFile = new File([blob], originalFilename || 'image.png', {
                      type: blob.type,
                      lastModified: Date.now(),
                    });
                    const compressedBlob = await imageCompression(originalFile, {
                      maxSizeMB: 4,
                      maxWidthOrHeight: 2048,
                      useWebWorker: true,
                    });
                    const mimeToExt: Record<string, string> = {
                      'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
                      'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg',
                    };
                    const ext = mimeToExt[compressedBlob.type] || 'jpg';
                    let sanitized = originalFilename
                      .replace(/\s+/g, '_')
                      .replace(/[^\w\-.]/g, '');
                    if (!sanitized) sanitized = `image_${Date.now()}.${ext}`;
                    else if (!sanitized.includes('.')) sanitized = `${sanitized}.${ext}`;

                    const compressedFile = new File([compressedBlob], sanitized, {
                      type: compressedBlob.type,
                      lastModified: Date.now(),
                    });
                    const formData = new FormData();
                    formData.append('file', compressedFile);

                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError || !session) {
                      throw new Error('Authentication error: Could not get session.');
                    }
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                      headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }
                    const result = await response.json();
                    return result.location;
                  } catch (error: unknown) {
                    const msg = error instanceof Error ? error.message : String(error);
                    alert(`이미지 업로드 실패: ${msg}`);
                    throw new Error(`Image upload failed: ${msg}`);
                  }
                },
              }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => router.push('/admin/ai-write')}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            취소
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? (savingStatus || '저장중...') : '임시저장'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? (savingStatus || '발행중...') : '발행하기'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
