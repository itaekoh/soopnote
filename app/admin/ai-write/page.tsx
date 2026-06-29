'use client';

// ============================================
// AI 글쓰기 — 입력 화면
// 현장 메모/관찰 내용을 입력하면 AI가 에세이형 블로그 초안(HTML)을 생성한다.
// 생성된 초안은 미리보기 후 글쓰기 에디터로 이어받는다.
// (생성 API: /api/admin/ai-write — 다음 단계에서 구현)
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Leaf,
  Stethoscope,
  BookOpen,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { getMenuCategories, getCategoryAttributesGrouped } from '@/lib/api/categories';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Category } from '@/lib/types/database.types';

type CategorySlug = 'wildflower' | 'tree-diagnose' | 'logs';
type LengthOption = 'short' | 'medium' | 'long';

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
  const { user, profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // 카테고리
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [selectedMenuSlug, setSelectedMenuSlug] = useState<CategorySlug>('wildflower');
  const [subCategories, setSubCategories] = useState<Record<string, Category[]>>({});
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);

  // 입력 필드
  const [subject, setSubject] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [keywords, setKeywords] = useState('');
  const [length, setLength] = useState<LengthOption>('medium');
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);

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
      }
    }
  }, [authLoading, user, profile, router]);

  // 메뉴 변경 시 서브카테고리 로드
  useEffect(() => {
    if (selectedMenuSlug) {
      loadSubCategories(selectedMenuSlug);
    }
  }, [selectedMenuSlug]);

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

  async function loadSubCategories(menuSlug: CategorySlug) {
    try {
      const grouped = await getCategoryAttributesGrouped(menuSlug);
      setSubCategories(grouped);
      setSelectedSubcategoryIds([]);
    } catch (err) {
      console.error('서브카테고리 로드 실패:', err);
    }
  }

  const getCategoryStyle = (slug: string) => {
    switch (slug) {
      case 'wildflower':
        return { icon: Leaf, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-700' };
      case 'tree-diagnose':
        return { icon: Stethoscope, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-700' };
      case 'logs':
        return { icon: BookOpen, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-700' };
      default:
        return { icon: BookOpen, color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-700' };
    }
  };

  const selectedCategoryStyle = getCategoryStyle(selectedMenuSlug);

  const toggleSubcategory = (categoryId: number) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const groupLabel = (key: string) => {
    const map: Record<string, string> = {
      region: '지역별', month: '월별', species: '수종', pest: '병해충',
      equipment: '장비', status: '상태', subcategory: '서브카테고리',
    };
    return map[key] || key;
  };

  // ── AI 초안 생성 ─────────────────────────────────────────
  const handleGenerate = async () => {
    setError('');

    if (!subject.trim()) {
      setError('주제(소재)를 입력해주세요.');
      return;
    }
    if (!fieldNotes.trim()) {
      setError('현장 메모·관찰 내용을 입력해주세요. AI가 이 내용을 바탕으로 글을 씁니다.');
      return;
    }
    if (!selectedMenuId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setGenerating(true);
    try {
      // 인증 토큰 (upload API와 동일 패턴)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('인증 세션을 가져오지 못했습니다. 다시 로그인해주세요.');
      }

      const payload = {
        categoryId: selectedMenuId,
        categorySlug: selectedMenuSlug,
        subcategoryIds: selectedSubcategoryIds,
        subject: subject.trim(),
        fieldNotes: fieldNotes.trim(),
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        length,
        tone,
      };

      const response = await fetch('/api/admin/ai-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `생성 요청 실패 (HTTP ${response.status})`);
      }

      const result = await response.json();

      // 생성 결과를 다음 화면(검토/편집)으로 전달
      sessionStorage.setItem(
        'ai-write-draft',
        JSON.stringify({ ...payload, ...result })
      );
      router.push('/admin/ai-write/review');
    } catch (err: any) {
      console.error('AI 초안 생성 실패:', err);
      setError(err.message || 'AI 초안 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // ── 렌더 ─────────────────────────────────────────────────
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
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-100">
              <Sparkles className="w-6 h-6 text-green-700" />
            </div>
            <h1 className="text-3xl font-bold text-[#26422E]">AI 글쓰기</h1>
          </div>
          <p className="text-gray-600">
            현장에서 적어둔 메모와 관찰 내용을 입력하면, AI가 에세이형 초안을 만들어 드립니다.
          </p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 카테고리 */}
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
                  type="button"
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

        {/* 서브카테고리 속성 (선택) */}
        {Object.keys(subCategories).length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              속성 선택 (선택, 여러 개 가능)
            </label>
            <div className="space-y-4">
              {Object.entries(subCategories).map(([groupKey, categories]) => (
                <div key={groupKey} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="text-sm font-medium text-gray-700 mb-3">{groupLabel(groupKey)}</div>
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

        {/* 주제 / 소재 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주제 · 소재 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="예: 주문진 바닷가에서 만난 해당화 / 벚나무 줄기마름병 진단"
          />
        </div>

        {/* 현장 메모 · 관찰 내용 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현장 메모 · 관찰 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
            placeholder={
              '글의 재료가 되는 내용을 자유롭게 적어주세요.\n' +
              '- 무엇을 보았는지, 어디서, 언제\n' +
              '- 눈에 띈 증상·특징, 날씨, 주변 풍경\n' +
              '- 떠오른 생각이나 진단 소견\n' +
              '메모 형태로 두서없이 적어도 AI가 글로 다듬습니다.'
            }
          />
          <p className="mt-1 text-xs text-gray-400">
            구체적으로 적을수록 좋은 초안이 나옵니다. 사실 위주로 적어주세요.
          </p>
        </div>

        {/* 강조 키워드 (선택) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">강조 키워드 (선택)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="쉼표로 구분 — 예: 해당화, 염생식물, 해안사구"
          />
        </div>

        {/* 분량 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">분량</label>
          <div className="grid grid-cols-3 gap-3">
            {LENGTH_OPTIONS.map((opt) => {
              const isSelected = length === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLength(opt.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? 'bg-green-50 border-green-700 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 톤 · 문체 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">톤 · 문체</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 생성 버튼 */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            disabled={generating}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                초안 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 초안 생성
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
