'use client';

import { useState, useEffect } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api/admin';
import type { Category } from '@/lib/types/database.types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'attribute' as 'menu' | 'attribute',
    parent_id: null as number | null,
    display_order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 목록 로딩 실패:', error);
      alert('카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'attribute',
      parent_id: null,
      display_order: 0,
    });
    setShowAddForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      alert('이름과 슬러그는 필수입니다.');
      return;
    }

    try {
      if (editingId) {
        // 수정
        await updateCategory(editingId, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          display_order: formData.display_order,
        });
        alert('카테고리가 수정되었습니다.');
      } else {
        // 생성
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          type: formData.type,
          parent_id: formData.parent_id || undefined,
          display_order: formData.display_order,
        });
        alert('카테고리가 생성되었습니다.');
      }

      resetForm();
      await loadCategories();
    } catch (error: any) {
      console.error('카테고리 저장 실패:', error);
      alert(error.message || '카테고리 저장에 실패했습니다.');
    }
  }

  function handleEdit(category: Category) {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      type: category.type,
      parent_id: category.parent_id,
      display_order: category.display_order,
    });
    setEditingId(category.id);
    setShowAddForm(true);
  }

  async function handleDelete(categoryId: number, categoryName: string) {
    if (!confirm(`"${categoryName}" 카테고리를 삭제하시겠습니까?\n하위 카테고리도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      alert('카테고리가 삭제되었습니다.');
      await loadCategories();
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  }

  const menuCategories = categories.filter((c) => c.type === 'menu');
  const getCategoryLabel = (category: Category) => {
    if (category.parent_id) {
      const parent = categories.find((c) => c.id === category.parent_id);
      return `${parent?.name || ''} > ${category.name}`;
    }
    return category.name;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">카테고리 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          카테고리 관리 <span className="text-gray-500">({categories.length}개)</span>
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              취소
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              카테고리 추가
            </>
          )}
        </button>
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? '카테고리 수정' : '새 카테고리 추가'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="예: 야생화 일지"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                슬러그 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="예: wildflower"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="카테고리 설명"
              />
            </div>

            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'menu' | 'attribute' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="menu">메뉴 (상위 카테고리)</option>
                    <option value="attribute">속성 (하위 카테고리)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상위 카테고리</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={formData.type === 'menu'}
                  >
                    <option value="">없음 (최상위)</option>
                    {menuCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {editingId ? '수정' : '추가'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 카테고리 목록 */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              category.type === 'menu'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">{getCategoryLabel(category)}</h3>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    category.type === 'menu'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {category.type === 'menu' ? '메뉴' : '속성'}
                </span>
                <span className="text-sm text-gray-500">({category.slug})</span>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="수정"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id, category.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">등록된 카테고리가 없습니다.</div>
      )}
    </div>
  );
}
