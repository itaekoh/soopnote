'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageModal } from '@/components/ImageModal';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase/client';
import {
  getAllItems,
  getAllSpecies,
  createItem,
  updateItem,
  deleteItem,
  deleteStorageFile,
  moveStorageFile,
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
  const [photoTypeFilter, setPhotoTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuizItemWithSpecies | null>(null);

  // 이미지 확대 모달
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

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

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsData, speciesData] = await Promise.all([getAllItems(), getAllSpecies()]);
      setItems(itemsData);
      setSpecies(speciesData);
    } catch {
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
    setEditingItem(null);
  }

  function openAdd() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(item: QuizItemWithSpecies) {
    setEditingItem(item);
    setFormSpeciesId(item.species_id);
    setFormPhotoType(item.photo_type);
    setFormCaption(item.caption || '');
    setFormStatus(item.status);
    setFormImagePath(item.image_path);
    setFormImagePreview(getQuizImageUrl(item.image_path));
    setSpeciesSearch('');
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
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

    if (!formSpeciesId) { alert('수종을 선택해주세요.'); return; }
    if (!editingItem && !formImagePath) { alert('이미지를 업로드해주세요.'); return; }

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
        if (imageChanged) {
          deleteStorageFile(editingItem.image_path);
        }
      } else {
        const newItem = await createItem({
          species_id: formSpeciesId,
          photo_type: formPhotoType,
          image_path: formImagePath,
          caption: formCaption || undefined,
          status: formStatus,
        });
        // pending/ → quiz/{item_id}/ 로 이동
        if (formImagePath.startsWith('pending/')) {
          const fileName = formImagePath.split('/').pop()!;
          const newPath = `quiz/${newItem.id}/${fileName}`;
          try {
            await moveStorageFile(formImagePath, newPath);
            await updateItem(newItem.id, { image_path: newPath });
          } catch {
            console.error('파일 이동 실패 — pending 경로 유지');
          }
        }
      }
      closeDrawer();
      await loadData();
    } catch (error: any) {
      alert(error.message || '문항 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('이 문항을 삭제하시겠습니까?')) return;
    try {
      await deleteItem(itemId);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
      await loadData();
    } catch {
      alert('문항 삭제에 실패했습니다.');
    }
  }

  // 개별 상태 변경
  async function handleStatusChange(itemId: string, newStatus: QuizItemStatus) {
    try {
      await updateItem(itemId, { status: newStatus });
      await loadData();
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  }

  // 일괄 상태 변경
  async function handleBulkStatus(status: QuizItemStatus) {
    if (selectedIds.size === 0) { alert('문항을 선택해주세요.'); return; }
    if (!confirm(`선택한 ${selectedIds.size}개 문항의 상태를 "${status}"로 변경하시겠습니까?`)) return;
    try {
      await bulkUpdateStatus(Array.from(selectedIds), status);
      setSelectedIds(new Set());
      await loadData();
    } catch {
      alert('일괄 상태 변경에 실패했습니다.');
    }
  }

  // 체크박스
  function toggleSelect(itemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) { next.delete(itemId); } else { next.add(itemId); }
      return next;
    });
  }

  function toggleSelectAll() {
    const allPageSelected = pagedItems.length > 0 && pagedItems.every((i) => selectedIds.has(i.id));
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedItems.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedItems.forEach((i) => next.add(i.id));
        return next;
      });
    }
  }

  // 필터
  const filteredItems = useMemo(() => items.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (photoTypeFilter !== 'all' && i.photo_type !== photoTypeFilter) return false;
    if (searchQuery && !i.quiz_species?.name_ko?.includes(searchQuery)) return false;
    return true;
  }), [items, statusFilter, photoTypeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // 필터 변경 시 1페이지로 리셋
  useEffect(() => { setCurrentPage(1); }, [statusFilter, photoTypeFilter, searchQuery]);

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
    <div className="relative">
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
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />문항 추가
          </button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* 유형 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setPhotoTypeFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            photoTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체 유형
        </button>
        {PHOTO_TYPES.map((pt) => {
          const count = items.filter((i) => i.photo_type === pt && (statusFilter === 'all' || i.status === statusFilter)).length;
          return (
            <button
              key={pt}
              onClick={() => setPhotoTypeFilter(pt)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                photoTypeFilter === pt ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pt} ({count})
            </button>
          );
        })}
      </div>

      {/* 수종명 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="수종명 검색..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* 문항 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={pagedItems.length > 0 && pagedItems.every((i) => selectedIds.has(i.id))}
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
            {pagedItems.map((item) => {
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
                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        loading="lazy"
                        onClick={() => setZoomImageUrl(imageUrl)}
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
                        onClick={() => openEdit(item)}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                page === safePage
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {statusFilter === 'all' ? '등록된 문항이 없습니다.' : `${statusFilter} 상태의 문항이 없습니다.`}
        </div>
      )}

      {/* 드로어 오버레이 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* 배경 딤 */}
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          {/* 패널 */}
          <div className="relative z-50 w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-y-auto">
            {/* 드로어 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                {editingItem ? '문항 수정' : '새 문항 추가'}
              </h3>
              <button
                onClick={closeDrawer}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 flex flex-col gap-4">

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
                    <img src={formImagePreview} alt="미리보기" className="max-h-40 mx-auto rounded" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">캡션 (선택)</label>
                <input
                  type="text"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="이미지에 대한 설명"
                />
              </div>

              {/* 하단 버튼 */}
              <div className="mt-auto pt-4 flex gap-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={uploading || saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? '저장 중...' : editingItem ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomImageUrl && (
        <ImageModal imageUrl={zoomImageUrl} onClose={() => setZoomImageUrl(null)} />
      )}
    </div>
  );
}
