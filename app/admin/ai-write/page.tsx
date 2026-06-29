'use client';

// ============================================
// AI 글쓰기 — 2단 스튜디오 화면
// 좌측: 생성 컨트롤(카테고리/주제/현장메모/분량/톤) · 우측: 결과 편집 + 발행
// 한 페이지에서 생성 → 검토 → 발행까지 처리한다 (이전 /review 페이지 흡수).
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Editor } from '@tinymce/tinymce-react';
import {
  Leaf,
  Stethoscope,
  BookOpen,
  Sparkles,
  Loader2,
  Save,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ImagePlus,
} from 'lucide-react';
import { getMenuCategories } from '@/lib/api/categories';
import { createPost } from '@/lib/api/posts';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Category } from '@/lib/types/database.types';
import imageCompression from 'browser-image-compression';

type CategorySlug = 'wildflower' | 'tree-diagnose' | 'logs';
type LengthOption = 'short' | 'medium' | 'long';
type ApiStatus = 'checking' | 'connected' | 'not_configured' | 'invalid_key' | 'error';

const LENGTH_OPTIONS: { value: LengthOption; label: string; hint: string }[] = [
  { value: 'short', label: '짧게', hint: '약 600자' },
  { value: 'medium', label: '보통', hint: '약 1,200자' },
  { value: 'long', label: '길게', hint: '약 2,000자' },
];

const TONE_OPTIONS = [
  '따뜻한 에세이',
  '담백한 현장 기록',
  '정보 전달 중심',
  '서정적인 관찰일지',
];

export default function AiWritePage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const { user, profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  // API 연결 상태
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [apiStatusMsg, setApiStatusMsg] = useState('');

  // 좌측: 생성 컨트롤
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [selectedMenuSlug, setSelectedMenuSlug] = useState<CategorySlug>('wildflower');
  const [subject, setSubject] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [keywords, setKeywords] = useState('');

  // 본문 이미지 갤러리
  const [galleryImages, setGalleryImages] = useState<{ url: string; name: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [length, setLength] = useState<LengthOption>('medium');
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);

  // 우측: 결과 + 발행
  const [hasResult, setHasResult] = useState(false);
  const [generationId, setGenerationId] = useState(0); // 에디터 remount 키
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [readTime, setReadTime] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [generating, setGenerating] = useState(false);
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
        return;
      }
      if (profile) {
        loadCategories();
        checkApiStatus();
      }
    }
  }, [authLoading, user, profile, router]);

  async function checkApiStatus() {
    setApiStatus('checking');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setApiStatus('error');
        setApiStatusMsg('세션을 확인할 수 없습니다.');
        return;
      }
      const res = await fetch('/api/admin/ai-write/status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApiStatus('error');
        setApiStatusMsg(data.error || '상태 확인에 실패했습니다.');
        return;
      }
      setApiStatus((data.status as ApiStatus) || 'error');
      setApiStatusMsg(data.message || '');
    } catch (e: any) {
      setApiStatus('error');
      setApiStatusMsg(e?.message || '상태 확인에 실패했습니다.');
    }
  }

  async function loadCategories() {
    try {
      const menus = await getMenuCategories();
      setMenuCategories(menus);
      if (menus.length > 0) {
        setSelectedMenuId(menus[0].id);
        setSelectedMenuSlug(menus[0].slug as CategorySlug);
      }
    } catch (err: any) {
      console.error('카테고리 로드 실패:', err);
      alert(`카테고리를 불러오지 못했습니다.\n\n${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }

  const getCategoryStyle = (slug: string) => {
    switch (slug) {
      case 'wildflower':
        return { icon: Leaf, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-700' };
      case 'tree-diagnose':
        return { icon: Stethoscope, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-700' };
      case 'logs':
        return { icon: BookOpen, bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-700' };
      default:
        return { icon: BookOpen, bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-700' };
    }
  };

  // ── AI 초안 생성 ──────────────────────────────────────────
  const handleGenerate = async () => {
    setError('');
    if (!subject.trim()) {
      setError('주제(소재)를 입력해주세요.');
      return;
    }
    if (!fieldNotes.trim() && !pdfFile) {
      setError('현장 메모를 입력하거나 보고서 PDF를 첨부해주세요.');
      return;
    }
    if (!selectedMenuId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setGenerating(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('인증 세션을 가져오지 못했습니다. 다시 로그인해주세요.');
      }

      const formData = new FormData();
      formData.append('categorySlug', selectedMenuSlug);
      formData.append('subject', subject.trim());
      formData.append('fieldNotes', fieldNotes.trim());
      formData.append('keywords', keywords);
      formData.append('length', length);
      formData.append('tone', tone);
      if (pdfFile) formData.append('pdf', pdfFile);

      const response = await fetch('/api/admin/ai-write', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `생성 요청 실패 (HTTP ${response.status})`);
      }

      const result = await response.json();
      setTitle(result.title || '');
      setExcerpt(result.excerpt || '');
      setReadTime(result.readTime || '');
      setGeneratedContent(result.contentHtml || '');
      setGenerationId((n) => n + 1);
      setHasResult(true);
    } catch (err: any) {
      console.error('AI 초안 생성 실패:', err);
      setError(err.message || 'AI 초안 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // ── 저장 / 발행 ───────────────────────────────────────────
  const handleSave = async (isDraft: boolean) => {
    setError('');
    if (!editorRef.current || !selectedMenuId || !user) return;

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

    setSaving(true);
    try {
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
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, imageFile);
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
        category_id: selectedMenuId,
        published_date: date,
        location: location || undefined,
        read_time: readTime || undefined,
        featured_image_url: imageUrl,
        status: (isDraft ? 'draft' : 'published') as 'draft' | 'published',
      };

      const createPromise = createPost(postData, user.id);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('게시글 저장 시간 초과 (30초).')), 30000)
      );
      await Promise.race([createPromise, timeoutPromise]);

      setSavingStatus('완료!');
      alert(isDraft ? '임시저장되었습니다!' : '글이 발행되었습니다!');
      router.push(`/${selectedMenuSlug}`);
    } catch (err: any) {
      console.error('저장 실패:', err);
      setError(err.message || '글 저장에 실패했습니다.');
    } finally {
      setSaving(false);
      setSavingStatus('');
    }
  };

  // ── 본문 이미지 갤러리 ────────────────────────────────────
  const handleGalleryUpload = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('인증 세션을 가져오지 못했습니다.');

      const uploaded: { url: string; name: string }[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
          fileType: file.type,
        });
        const formData = new FormData();
        formData.append('file', compressed, file.name);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `업로드 실패 (HTTP ${res.status})`);
        }
        const { location } = await res.json();
        uploaded.push({ url: location, name: file.name });
      }
      setGalleryImages((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      console.error('갤러리 업로드 실패:', err);
      alert(`이미지 업로드 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const insertImage = (url: string, name: string) => {
    if (!editorRef.current) {
      alert('먼저 AI 초안을 생성하면 본문에 이미지를 삽입할 수 있어요.');
      return;
    }
    editorRef.current.insertContent(
      `<p><img src="${url}" alt="${name}" style="max-width:100%;height:auto;" /></p>`
    );
  };

  const removeGalleryImage = (url: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.url !== url));
  };

  // ── 로딩 / 권한 ───────────────────────────────────────────
  if (authLoading || loading) {
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

  const statusMeta: Record<ApiStatus, { cls: string; label: string; Icon: any; spin?: boolean }> = {
    checking: { cls: 'text-gray-500 bg-gray-100', label: 'API 연결 확인 중', Icon: Loader2, spin: true },
    connected: { cls: 'text-green-700 bg-green-100', label: 'API 연결됨', Icon: CheckCircle2 },
    not_configured: { cls: 'text-red-700 bg-red-100', label: 'API 키 미설정', Icon: AlertCircle },
    invalid_key: { cls: 'text-red-700 bg-red-100', label: 'API 키 오류', Icon: AlertCircle },
    error: { cls: 'text-amber-700 bg-amber-100', label: '연결 확인 실패', Icon: AlertCircle },
  };
  const apiBadge = statusMeta[apiStatus];

  const tinymceInit = {
    height: 520,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
    ],
    toolbar:
      'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | removeformat | image media | help',
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
        let sanitized = originalFilename.replace(/\s+/g, '_').replace(/[^\w\-.]/g, '');
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`이미지 업로드 실패: ${msg}`);
        throw new Error(`Image upload failed: ${msg}`);
      }
    },
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-100">
            <Sparkles className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#26422E]">AI 글쓰기</h1>
            <p className="text-sm text-gray-600">왼쪽에서 입력하고 생성하면, 오른쪽에서 다듬어 발행합니다.</p>
          </div>
          <button
            type="button"
            onClick={checkApiStatus}
            title={apiStatusMsg ? `${apiBadge.label} · ${apiStatusMsg} (클릭하여 다시 확인)` : `${apiBadge.label} (클릭하여 다시 확인)`}
            className={`ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${apiBadge.cls}`}
          >
            <apiBadge.Icon className={`w-3.5 h-3.5 ${apiBadge.spin ? 'animate-spin' : ''}`} />
            {apiBadge.label}
          </button>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 2단 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* ── 좌측: 생성 컨트롤 ── */}
          <aside className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <div className="grid grid-cols-1 gap-2">
                {menuCategories.map((menu) => {
                  const style = getCategoryStyle(menu.slug);
                  const Icon = style.icon;
                  const isSelected = selectedMenuId === menu.id;
                  return (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => {
                        setSelectedMenuId(menu.id);
                        setSelectedMenuSlug(menu.slug as CategorySlug);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? `${style.bgColor} ${style.borderColor} shadow-sm`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-5 h-5 ${isSelected ? style.textColor : 'text-gray-400'}`} />
                        <span className={`text-sm font-semibold ${isSelected ? style.textColor : 'text-gray-600'}`}>
                          {menu.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 주제 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주제 · 소재 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="예: 주문진에서 만난 해당화"
              />
            </div>

            {/* 현장 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">현장 메모 · 관찰</label>
              <textarea
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                rows={7}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y text-sm"
                placeholder={'본 것·증상·날씨·풍경·떠오른 생각을\n메모처럼 자유롭게 적어주세요.'}
              />
            </div>

            {/* 보고서 PDF 첨부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보고서 첨부 (PDF · 선택)</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.type !== 'application/pdf') {
                    alert('PDF 파일만 첨부할 수 있습니다.');
                    e.target.value = '';
                    return;
                  }
                  if (file.size > 4 * 1024 * 1024) {
                    alert('PDF는 4MB 이하만 첨부할 수 있습니다.');
                    e.target.value = '';
                    return;
                  }
                  setPdfFile(file);
                }}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="block border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-center cursor-pointer hover:border-green-500 transition-colors text-sm"
              >
                {pdfFile ? (
                  <span className="text-green-600 font-medium break-all">{pdfFile.name}</span>
                ) : (
                  <span className="text-gray-500">PDF 보고서 업로드</span>
                )}
              </label>
              {pdfFile && (
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  첨부 제거
                </button>
              )}
              <p className="mt-1 text-[11px] text-gray-400">
                보고서를 올리면 그 내용을 바탕으로 글을 씁니다. 메모와 함께 써도 됩니다. (최대 4MB)
              </p>
            </div>

            {/* 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">강조 키워드 (선택)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="쉼표로 구분"
              />
            </div>

            {/* 분량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">분량</label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTH_OPTIONS.map((opt) => {
                  const isSelected = length === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLength(opt.value)}
                      className={`px-2 py-2 rounded-lg border-2 transition-all text-center ${
                        isSelected
                          ? 'bg-green-50 border-green-700 text-green-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-gray-400">{opt.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 톤 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">톤 · 문체</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 생성 버튼 */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || saving}
              className="w-full py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  초안 생성 중...
                </>
              ) : (
                <>
                  {hasResult ? <RefreshCw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  {hasResult ? '다시 생성' : 'AI 초안 생성'}
                </>
              )}
            </button>

            {/* 본문 이미지 갤러리 */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4" />
                본문 이미지
              </label>
              <p className="text-[11px] text-gray-400 mb-2">
                사진을 올려두고, 초안 생성 후 썸네일을 클릭하면 본문 커서 위치에 삽입됩니다.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) handleGalleryUpload(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="block border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-center cursor-pointer hover:border-green-500 transition-colors text-sm text-gray-500"
              >
                {uploadingImages ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...
                  </span>
                ) : (
                  '사진 여러 장 업로드'
                )}
              </label>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {galleryImages.map((img) => (
                    <div key={img.url} className="relative group">
                      <button
                        type="button"
                        onClick={() => insertImage(img.url, img.name)}
                        title="본문에 삽입"
                        className="block w-full aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-green-500"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(img.url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="이미지 제거"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* ── 우측: 결과 + 발행 ── */}
          <section className="min-h-[600px]">
            {generating ? (
              // 로딩 스켈레톤
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 text-gray-500 mb-6">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI가 초안을 작성하고 있습니다...
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-11/12" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ) : !hasResult ? (
              // 빈 상태
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center min-h-[600px]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 mb-4">
                  <Sparkles className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-gray-700 font-medium mb-1">왼쪽에서 입력하고 “AI 초안 생성”을 눌러주세요</p>
                <p className="text-sm text-gray-400">생성된 초안이 여기에 표시되고, 바로 다듬어 발행할 수 있습니다.</p>
              </div>
            ) : (
              // 결과 + 발행
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                {/* 제목 + 액션 */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="제목"
                  />
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving || generating}
                    className="shrink-0 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? (savingStatus || '저장중') : '임시저장'}
                  </button>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || generating}
                    className="shrink-0 px-5 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? (savingStatus || '발행중') : '발행'}
                  </button>
                </div>

                {/* 메타 (발행 정보) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">날짜</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {(selectedMenuSlug === 'wildflower' || selectedMenuSlug === 'tree-diagnose') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">상세 주소 (선택)</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="예: 강원도 강릉시 주문진읍"
                      />
                    </div>
                  )}
                  {selectedMenuSlug === 'logs' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">읽기 시간</label>
                      <input
                        type="text"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="예: 5분"
                      />
                    </div>
                  )}
                </div>

                {/* 요약 */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">요약</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* 대표 이미지 */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    대표 이미지 (선택)
                  </label>
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
                  <label
                    htmlFor="image-upload"
                    className="block border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-center cursor-pointer hover:border-green-500 transition-colors text-sm"
                  >
                    {imageFile ? (
                      <span className="text-green-600 font-medium">{imageFile.name} · 클릭하여 변경</span>
                    ) : (
                      <span className="text-gray-500">클릭하여 대표 이미지 업로드</span>
                    )}
                  </label>
                </div>

                {/* 본문 에디터 */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">본문</label>
                  <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                    <Editor
                      key={generationId}
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                      onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
                      initialValue={generatedContent}
                      init={tinymceInit}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
