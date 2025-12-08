'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Editor } from '@tinymce/tinymce-react';
import { Leaf, Stethoscope, BookOpen, Save, X, Calendar, Upload, FileText } from 'lucide-react';
import { getMenuCategories, getCategoryAttributesGrouped } from '@/lib/api/categories';
import { createPost } from '@/lib/api/posts';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Category } from '@/lib/types/database.types';

type CategorySlug = 'wildflower' | 'tree-diagnose' | 'logs';

export default function WritePage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const { user, profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 카테고리 데이터
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [selectedMenuSlug, setSelectedMenuSlug] = useState<CategorySlug>('wildflower');
  const [subCategories, setSubCategories] = useState<Record<string, Category[]>>({});

  // 폼 필드
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // 선택된 서브카테고리 ID들
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);

  // 특정 필드 값들 (UI용)
  const [readTime, setReadTime] = useState('');

  // 권한 체크
  useEffect(() => {
    console.log('=== 권한 체크 시작 ===');
    console.log('authLoading:', authLoading, 'user:', !!user, 'profile:', profile);

    if (!authLoading) {
      // 로그인 안 됨
      if (!user) {
        console.log('✗ 로그인 안됨 - 로그인 페이지로 이동');
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 권한 없음 (user는 글쓰기 불가)
      if (profile && profile.role === 'user') {
        console.log('✗ 권한 없음 (role: user) - 홈으로 이동');
        alert('글쓰기 권한이 없습니다.');
        router.push('/');
        return;
      }

      // 권한 있음 - 카테고리 로드
      if (profile) {
        console.log('✓ 권한 확인 완료 (role:', profile.role + ') - 카테고리 로드 시작');
        loadCategories();
      } else {
        console.log('⏳ 프로필 로딩 대기 중...');
      }
    }
  }, [authLoading, user, profile, router]);

  // 선택된 메뉴 변경 시 서브카테고리 로드
  useEffect(() => {
    if (selectedMenuSlug) {
      loadSubCategories(selectedMenuSlug);
    }
  }, [selectedMenuSlug]);

  // 카테고리 로드
  async function loadCategories() {
    try {
      console.log('📂 카테고리 조회 시작...');
      const menus = await getMenuCategories();
      console.log('✓ 카테고리 조회 성공:', menus.length, '개');
      console.log('카테고리 목록:', menus);

      setMenuCategories(menus);

      if (menus.length > 0) {
        const firstMenu = menus[0];
        setSelectedMenuId(firstMenu.id);
        setSelectedMenuSlug(firstMenu.slug as CategorySlug);
        console.log('✓ 기본 카테고리 설정:', firstMenu.name);
      } else {
        console.warn('⚠️  카테고리가 없습니다!');
      }

      setLoading(false);
      console.log('✓ 카테고리 로드 완료 - 로딩 해제');
    } catch (error: any) {
      console.error('✗ 카테고리 로드 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      alert(`카테고리를 불러오는데 실패했습니다.\n\n에러: ${error.message || '알 수 없는 오류'}\n\n브라우저 콘솔을 확인해주세요.`);
      setLoading(false);
    }
  }

  // 서브카테고리 로드
  async function loadSubCategories(menuSlug: CategorySlug) {
    try {
      const grouped = await getCategoryAttributesGrouped(menuSlug);
      setSubCategories(grouped);
      setSelectedSubcategoryIds([]); // 메뉴 변경 시 선택 초기화
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  }

  // 카테고리 아이콘 및 스타일
  const getCategoryStyle = (slug: string) => {
    switch (slug) {
      case 'wildflower':
        return {
          icon: Leaf,
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-700',
        };
      case 'tree-diagnose':
        return {
          icon: Stethoscope,
          color: 'amber',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-700',
        };
      case 'logs':
        return {
          icon: BookOpen,
          color: 'purple',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-700',
        };
      default:
        return {
          icon: BookOpen,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-700',
        };
    }
  };

  const selectedCategoryStyle = getCategoryStyle(selectedMenuSlug);

  // 서브카테고리 선택/해제 토글
  const toggleSubcategory = (categoryId: number) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 게시글 저장
  const handleSave = async (isDraft: boolean = true) => {
    if (!editorRef.current || !selectedMenuId) return;

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!excerpt.trim()) {
      alert('요약을 입력해주세요.');
      return;
    }

    const content = editorRef.current.getContent();
    if (!content.trim()) {
      alert('본문을 입력해주세요.');
      return;
    }

    setSaving(true);
    const statusText = isDraft ? '임시저장' : '발행';
    console.log(`=== ${statusText} 시작 ===`);

    try {
      // 현재 로그인한 사용자 확인 (AuthContext에서 가져옴)
      console.log('1. 사용자 인증 확인 중...');
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      console.log('✓ 사용자 인증 완료:', user.id);

      // 이미지 업로드 (선택적)
      let imageUrl = null;
      if (imageFile) {
        console.log('2. 이미지 업로드 중...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('✗ 이미지 업로드 실패:', uploadError);
          alert(`이미지 업로드 실패: ${uploadError.message}`);
          return;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
          console.log('✓ 이미지 업로드 완료:', imageUrl);
        }
      } else {
        console.log('2. 이미지 없음 - 스킵');
      }

      // 문서 파일 업로드 (선택적)
      let documentUrl = null;
      let documentName = null;
      let documentSize = null;
      let documentType = null;
      if (documentFile) {
        console.log('3. 문서 파일 업로드 중...');
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, documentFile);

        if (uploadError) {
          console.error('✗ 문서 업로드 실패:', uploadError);
          alert(`문서 업로드 실패: ${uploadError.message}`);
          return;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
          documentUrl = publicUrl;
          documentName = documentFile.name;
          documentSize = documentFile.size;
          documentType = documentFile.type;
          console.log('✓ 문서 업로드 완료:', documentUrl);
        }
      } else {
        console.log('3. 문서 없음 - 스킵');
      }

      // 게시글 생성
      console.log('4. 게시글 생성 중...');
      const postData = {
        title,
        excerpt,
        content,
        category_id: selectedMenuId,
        published_date: date,
        location: location || undefined,
        read_time: readTime || undefined,
        featured_image_url: imageUrl || undefined,
        attachment_url: documentUrl || undefined,
        attachment_name: documentName || undefined,
        attachment_size: documentSize || undefined,
        attachment_type: documentType || undefined,
        subcategory_ids: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
        status: isDraft ? 'draft' : 'published',
      };
      console.log('게시글 데이터:', postData);

      const post = await createPost(postData, user.id);
      console.log('✓ 게시글 생성 완료:', post.id);

      alert(isDraft ? '임시저장되었습니다!' : '글이 발행되었습니다!');
      router.push(`/${selectedMenuSlug}`);
    } catch (error: any) {
      console.error('✗ 저장 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      alert(`글 저장에 실패했습니다.\n\n에러: ${error.message || '알 수 없는 오류'}\n\n브라우저 콘솔을 확인해주세요.`);
    } finally {
      setSaving(false);
      console.log('=== 저장 종료 ===');
    }
  };

  // 인증 로딩 중이거나 카테고리 로딩 중
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

  // 권한 없음
  if (!user || !profile || profile.role === 'user') {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#26422E] mb-2">글쓰기</h1>
          <p className="text-gray-600">자연과의 만남을 기록해보세요</p>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">카테고리</label>
          <div className="grid grid-cols-3 gap-4">
            {menuCategories.map((menu) => {
              const style = getCategoryStyle(menu.slug);
              const Icon = style.icon;
              const isSelected = selectedMenuId === menu.id;

              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setSelectedMenuId(menu.id);
                    setSelectedMenuSlug(menu.slug as CategorySlug);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${style.bgColor} ${style.borderColor} shadow-md`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? style.textColor : 'text-gray-400'}`} />
                    <span className={`font-semibold ${isSelected ? style.textColor : 'text-gray-600'}`}>
                      {menu.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 제목 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="글 제목을 입력하세요"
          />
        </div>

        {/* 날짜 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* 상세 주소 (야생화 일지, 나무진단만) */}
        {(selectedMenuSlug === 'wildflower' || selectedMenuSlug === 'tree-diagnose') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="예: 강원도 강릉시 주문진읍 또는 GPS 좌표"
            />
          </div>
        )}

        {/* 동적 서브카테고리 필드 */}
        {Object.keys(subCategories).length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              속성 선택 (여러 개 선택 가능)
            </label>
            <div className="space-y-4">
              {Object.entries(subCategories).map(([groupKey, categories]) => (
                <div key={groupKey} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3 capitalize">
                    {groupKey === 'region' && '지역별'}
                    {groupKey === 'month' && '월별'}
                    {groupKey === 'species' && '수종'}
                    {groupKey === 'pest' && '병해충'}
                    {groupKey === 'equipment' && '장비'}
                    {groupKey === 'status' && '상태'}
                    {groupKey === 'subcategory' && '서브카테고리'}
                    {!['region', 'month', 'species', 'pest', 'equipment', 'status', 'subcategory'].includes(groupKey) && groupKey}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleSubcategory(cat.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedSubcategoryIds.includes(cat.id)
                            ? `${selectedCategoryStyle.bgColor} ${selectedCategoryStyle.borderColor} ${selectedCategoryStyle.textColor}`
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 읽기 시간 (로그만) */}
        {selectedMenuSlug === 'logs' && (
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
            placeholder="글의 간단한 요약을 입력하세요 (1-2문장)"
          />
        </div>

        {/* 대표 이미지 업로드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            대표 이미지
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
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
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="text-gray-600">클릭하여 이미지 업로드</div>
                  <div className="text-sm text-gray-400">JPG, PNG, GIF (최대 10MB)</div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 문서 첨부 (로그만) */}
        {selectedMenuSlug === 'logs' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              문서 첨부 (선택)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // 파일 크기 체크 (20MB 제한)
                    if (file.size > 20 * 1024 * 1024) {
                      alert('파일 크기는 20MB를 초과할 수 없습니다.');
                      e.target.value = '';
                      return;
                    }
                    setDocumentFile(file);
                  }
                }}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                {documentFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-purple-600" />
                    <div className="text-purple-600 font-medium">{documentFile.name}</div>
                    <div className="text-sm text-gray-500">
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="text-sm text-gray-500">클릭하여 다른 파일 선택</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-gray-400" />
                    <div className="text-gray-600">클릭하여 문서 업로드</div>
                    <div className="text-sm text-gray-400">
                      PDF, DOC, HWP, PPT, XLS, TXT (최대 20MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {/* TinyMCE 에디터 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
              init={{
                height: 500,
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
              }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => router.back()}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            취소
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? '저장중...' : '임시저장'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 rounded-lg text-white font-semibold hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedCategoryStyle.color === 'green' ? '#15803d' :
                               selectedCategoryStyle.color === 'amber' ? '#b45309' :
                               selectedCategoryStyle.color === 'purple' ? '#6d28d9' :
                               '#374151'
            }}
          >
            <Save className="w-5 h-5" />
            {saving ? '발행중...' : '발행하기'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
