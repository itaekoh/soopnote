'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase/client';
import {
  getAllItems,
  getAllSpecies,
  createItem,
  updateItem,
  deleteItem,
  deleteStorageFile,
  bulkUpdateStatus,
  getQuizImageUrl,
  type QuizItemWithSpecies,
  type QuizSpeciesWithGroup,
  type QuizItemStatus,
} from '@/lib/api/quiz-admin';

const PHOTO_TYPES = ['전경', '부분', '수피', '나뭇잎', '동아', '꽃', '열매(구과)'] as const;
const STATUS_OPTIONS: QuizItemStatus[] = ['draft', 'review', 'published', 'archived'];

function getStatusBadge(status: QuizItemStatus) {
  const map: Record<QuizItemStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    review: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function ItemManagement() {
  const [items, setItems] = useState<QuizItemWithSpecies[]>([]);
  const [species, setSpecies] = useState<QuizSpeciesWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QuizItemStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<QuizItemWithSpecies | null>(null);

  // 일괄 선택
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 폼 상태
  const [formSpeciesId, setFormSpeciesId] = useState('');
  const [formPhotoType, setFormPhotoType] = useState<string>(PHOTO_TYPES[0]);
  const [formCaption, setFormCaption] = useState('');
  const [formStatus, setFormStatus] = useState<QuizItemStatus>('draft');
  const [formImagePath, setFormImagePath] = useState('');
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수종 검색
  const [speciesSearch, setSpeciesSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsData, speciesData] = await Promise.all([
        getAllItems(),
        getAllSpecies(),
      ]);
      setItems(itemsData);
      setSpecies(speciesData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormSpeciesId('');
    setFormPhotoType(PHOTO_TYPES[0]);
    setFormCaption('');
    setFormStatus('draft');
    setFormImagePath('');
    setFormImagePreview(null);
    setSpeciesSearch('');
    setShowAddForm(false);
    setEditingItem(null);
  }

  // 이미지 업로드
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => setFormImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      setUploading(true);

      // 이미지 압축
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const formData = new FormData();
      formData.append('file', compressed, file.name);
      if (editingItem) {
        formData.append('item_id', editingItem.id);
      }

      const res = await fetch('/api/quiz/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '업로드 실패');
      }

      const { path } = await res.json();
      setFormImagePath(path);
    } catch (error: any) {
      console.error('업로드 실패:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
      setFormImagePreview(null);
    } finally {
      setUploading(false);
      // 같은 파일 재선택 허용
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // 문항 저장
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formSpeciesId) {
      alert('수종을 선택해주세요.');
      return;
    }
    if (!editingItem && !formImagePath) {
      alert('이미지를 업로드해주세요.');
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        const imageChanged = formImagePath && formImagePath !== editingItem.image_path;
        await updateItem(editingItem.id, {
          species_id: formSpeciesId,
          photo_type: formPhotoType,
          caption: formCaption || null,
          status: formStatus,
          ...(imageChanged ? { image_path: formImagePath } : {}),
        });
        // 이미지가 교체된 경우 기존 Storage 파일 삭제
        if (imageChanged) {
          deleteStorageFile(editingItem.image_path);
        }
        alert('문항이 수정되었습니다.');
      } else {
        await createItem({
          species_id: formSpeciesId,
          photo_type: formPhotoType,
          image_path: formImagePath,
          caption: formCaption || undefined,
          status: formStatus,
        });
        alert('문항이 생성되었습니다.');
      }
      resetForm();
      await loadData();
    } catch (error: any) {
      alert(error.message || '문항 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: QuizItemWithSpecies) {
    setEditingItem(item);
    setFormSpeciesId(item.species_id);
    setFormPhotoType(item.photo_type);
    setFormCaption(item.caption || '');
    setFormStatus(item.status);
    setFormImagePath(item.image_path);
    setFormImagePreview(getQuizImageUrl(item.image_path));
    setShowAddForm(true);
  }

  async function handleDelete(itemId: string) {
    if (!confirm('이 문항을 삭제하시겠습니까?')) return;

    try {
      await deleteItem(itemId);
      alert('문항이 삭제되었습니다.');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      await loadData();
    } catch (error) {
      alert('문항 삭제에 실패했습니다.');
    }
  }

  // 개별 상태 변경
  async function handleStatusChange(itemId: string, newStatus: QuizItemStatus) {
    try {
      await updateItem(itemId, { status: newStatus });
      await loadData();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  }

  // 일괄 상태 변경
  async function handleBulkStatus(status: QuizItemStatus) {
    if (selectedIds.size === 0) {
      alert('문항을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.size}개 문항의 상태를 "${status}"로 변경하시겠습니까?`)) return;

    try {
      await bulkUpdateStatus(Array.from(selectedIds), status);
      setSelectedIds(new Set());
      alert('상태가 변경되었습니다.');
      await loadData();
    } catch (error) {
      alert('일괄 상태 변경에 실패했습니다.');
    }
  }

  // 체크박스
  function toggleSelect(itemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  }

  // 필터
  const filteredItems = statusFilter === 'all'
    ? items
    : items.filter((i) => i.status === statusFilter);

  // 수종 필터 (폼용)
  const filteredSpecies = speciesSearch
    ? species.filter(
        (s) =>
          s.name_ko.includes(speciesSearch) ||
          (s.name_latin && s.name_latin.toLowerCase().includes(speciesSearch.toLowerCase()))
      )
    : species;

  if (loading) {
    return <div className="text-center py-8 text-gray-600">문항 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          문항 관리 <span className="text-gray-500">({filteredItems.length}개)</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* 일괄 상태 변경 */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">{selectedIds.size}개 선택</span>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleBulkStatus(s)}
                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => { showAddForm ? resetForm() : setShowAddForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showAddForm ? (
              <><X className="w-4 h-4" />취소</>
            ) : (
              <><Plus className="w-4 h-4" />문항 추가</>
            )}
          </button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            statusFilter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체 ({items.length})
        </button>
        {STATUS_OPTIONS.map((s) => {
          const count = items.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingItem ? '문항 수정' : '새 문항 추가'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 수종 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수종 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
                placeholder="수종 검색..."
                className="w-full px-3 py-2 mb-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <select
                value={formSpeciesId}
                onChange={(e) => setFormSpeciesId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                size={5}
                required
              >
                <option value="">선택...</option>
                {filteredSpecies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_ko} {s.name_latin ? `(${s.name_latin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 {!editingItem && <span className="text-red-500">*</span>}
              </label>
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  uploading
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                {formImagePreview ? (
                  <img
                    src={formImagePreview}
                    alt="미리보기"
                    className="max-h-32 mx-auto rounded"
                  />
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {uploading ? '업로드 중...' : '클릭하여 이미지 선택'}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {formImagePath && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 업로드 완료
                </p>
              )}
            </div>

            {/* 사진 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사진 유형</label>
              <select
                value={formPhotoType}
                onChange={(e) => setFormPhotoType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {PHOTO_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as QuizItemStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 캡션 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">캡션 (선택)</label>
              <input
                type="text"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="이미지에 대한 설명"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={uploading || saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '저장 중...' : editingItem ? '수정' : '추가'}
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

      {/* 문항 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이미지</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">수종명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const imageUrl = getQuizImageUrl(item.image_path);
              return (
                <tr key={item.id} className={selectedIds.has(item.id) ? 'bg-red-50' : ''}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.quiz_species?.name_ko || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.photo_type}</td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as QuizItemStatus)}
                      className={`px-2 py-0.5 text-xs rounded-full border-0 cursor-pointer ${getStatusBadge(item.status)}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {statusFilter === 'all' ? '등록된 문항이 없습니다.' : `${statusFilter} 상태의 문항이 없습니다.`}
        </div>
      )}
    </div>
  );
}
