'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Editor } from '@tinymce/tinymce-react';
import { Leaf, Stethoscope, BookOpen, Save, X } from 'lucide-react';

type Category = 'wildflower' | 'tree-diagnose' | 'column';

export default function WritePage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [category, setCategory] = useState<Category>('wildflower');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [excerpt, setExcerpt] = useState('');

  // 개발 모드: 인증 체크 비활성화 (나중에 활성화)
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/');
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return null;
  // }

  const categories = [
    {
      id: 'wildflower' as Category,
      name: '야생화 일지',
      icon: Leaf,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-700',
    },
    {
      id: 'tree-diagnose' as Category,
      name: '나무진단',
      icon: Stethoscope,
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-700',
    },
    {
      id: 'column' as Category,
      name: '칼럼',
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-700',
    },
  ];

  const selectedCategory = categories.find((c) => c.id === category)!;

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();

      // 여기서 Supabase에 저장
      console.log({
        category,
        title,
        location,
        excerpt,
        content,
      });

      alert('글이 저장되었습니다!');
      router.push(`/${category}`);
    }
  };

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
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${cat.bgColor} ${cat.borderColor} shadow-md`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${isSelected ? cat.textColor : 'text-gray-400'}`} />
                    <span className={`font-semibold ${isSelected ? cat.textColor : 'text-gray-600'}`}>
                      {cat.name}
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

        {/* 위치 (야생화 일지, 나무진단만) */}
        {(category === 'wildflower' || category === 'tree-diagnose') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="예: 강원도 강릉"
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
                language: 'ko_KR',
                placeholder: '내용을 입력하세요...',
              }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            취소
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg ${selectedCategory.bgColor.replace('50', '700')} text-white font-semibold hover:scale-[1.02] transition-transform flex items-center gap-2`}
            style={{
              backgroundColor: selectedCategory.color === 'green' ? '#15803d' :
                               selectedCategory.color === 'amber' ? '#b45309' :
                               '#6d28d9'
            }}
          >
            <Save className="w-5 h-5" />
            저장하기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
