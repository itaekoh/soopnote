// ============================================
// Quiz Admin API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';

// ============================================
// Types
// ============================================

export type QuizItemStatus = 'draft' | 'review' | 'published' | 'archived';

export interface QuizSpecies {
  id: string;
  name_ko: string;
  name_latin: string | null;
  group_id: string | null;
  aliases: string[];
  is_active: boolean;
  created_at: string;
}

export interface QuizSpeciesWithGroup extends QuizSpecies {
  quiz_groups: { name: string } | null;
  item_count?: number;
}

export interface QuizItem {
  id: string;
  species_id: string;
  status: QuizItemStatus;
  photo_type: string;
  image_path: string;
  caption: string | null;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
}

export interface QuizItemWithSpecies extends QuizItem {
  quiz_species: { name_ko: string } | null;
}

export interface QuizGroup {
  id: string;
  name: string;
  created_at: string;
  species_count?: number;
}

export interface QuizGroupSimilarity {
  group_id: string;
  similar_group_id: string;
  weight: number;
  created_at: string;
  similar_group?: { name: string };
}

export interface QuizStats {
  totalSpecies: number;
  activeSpecies: number;
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  reviewItems: number;
  archivedItems: number;
  totalAttempts: number;
  uniqueUsers: number;
}

// ============================================
// 수종 관리
// ============================================

export async function getAllSpecies(): Promise<QuizSpeciesWithGroup[]> {
  const { data, error } = await supabase
    .from('quiz_species')
    .select('*, quiz_groups(name)')
    .order('name_ko', { ascending: true });

  if (error) {
    console.error('수종 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

export async function createSpecies(species: {
  name_ko: string;
  name_latin?: string;
  group_id?: string | null;
  aliases?: string[];
  is_active?: boolean;
}): Promise<QuizSpecies> {
  const { data, error } = await supabase
    .from('quiz_species')
    .insert({
      name_ko: species.name_ko,
      name_latin: species.name_latin || null,
      group_id: species.group_id || null,
      aliases: species.aliases || [],
      is_active: species.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('수종 생성 실패:', error);
    throw error;
  }

  return data;
}

export async function updateSpecies(
  speciesId: string,
  updates: {
    name_ko?: string;
    name_latin?: string | null;
    group_id?: string | null;
    aliases?: string[];
    is_active?: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from('quiz_species')
    .update(updates)
    .eq('id', speciesId);

  if (error) {
    console.error('수종 수정 실패:', error);
    throw error;
  }
}

export async function deleteSpecies(speciesId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_species')
    .delete()
    .eq('id', speciesId);

  if (error) {
    console.error('수종 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 문항 관리
// ============================================

export async function getAllItems(): Promise<QuizItemWithSpecies[]> {
  const { data, error } = await supabase
    .from('quiz_items')
    .select('*, quiz_species(name_ko)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('문항 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

export async function createItem(item: {
  species_id: string;
  photo_type: string;
  image_path: string;
  caption?: string;
  status?: QuizItemStatus;
}): Promise<QuizItem> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('quiz_items')
    .insert({
      species_id: item.species_id,
      photo_type: item.photo_type,
      image_path: item.image_path,
      caption: item.caption || null,
      status: item.status || 'draft',
      created_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('문항 생성 실패:', error);
    throw error;
  }

  return data;
}

export async function updateItem(
  itemId: string,
  updates: {
    species_id?: string;
    photo_type?: string;
    image_path?: string;
    caption?: string | null;
    status?: QuizItemStatus;
  }
): Promise<void> {
  // published_at 자동 설정
  const updateData: Record<string, unknown> = { ...updates };
  if (updates.status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('quiz_items')
    .update(updateData)
    .eq('id', itemId);

  if (error) {
    console.error('문항 수정 실패:', error);
    throw error;
  }
}

export async function updateItemStatus(
  itemId: string,
  status: QuizItemStatus
): Promise<void> {
  await updateItem(itemId, { status });
}

export async function bulkUpdateStatus(
  itemIds: string[],
  status: QuizItemStatus
): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('quiz_items')
    .update(updateData)
    .in('id', itemIds);

  if (error) {
    console.error('일괄 상태 변경 실패:', error);
    throw error;
  }
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('문항 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 혼동그룹 관리
// ============================================

export async function getAllGroups(): Promise<QuizGroup[]> {
  const { data, error } = await supabase
    .from('quiz_groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('그룹 목록 조회 실패:', error);
    throw error;
  }

  return data || [];
}

export async function createGroup(name: string): Promise<QuizGroup> {
  const { data, error } = await supabase
    .from('quiz_groups')
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error('그룹 생성 실패:', error);
    throw error;
  }

  return data;
}

export async function updateGroup(groupId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_groups')
    .update({ name })
    .eq('id', groupId);

  if (error) {
    console.error('그룹 수정 실패:', error);
    throw error;
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    console.error('그룹 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 유사도 관리
// ============================================

export async function getGroupSimilarities(groupId: string): Promise<QuizGroupSimilarity[]> {
  const { data, error } = await supabase
    .from('quiz_group_similarities')
    .select('*, similar_group:quiz_groups!quiz_group_similarities_similar_group_id_fkey(name)')
    .eq('group_id', groupId)
    .order('weight', { ascending: false });

  if (error) {
    console.error('유사도 조회 실패:', error);
    throw error;
  }

  return (data || []).map((d: any) => ({
    ...d,
    similar_group: d.similar_group,
  }));
}

export async function upsertSimilarity(
  groupId: string,
  similarGroupId: string,
  weight: number
): Promise<void> {
  const { error } = await supabase
    .from('quiz_group_similarities')
    .upsert({
      group_id: groupId,
      similar_group_id: similarGroupId,
      weight,
    });

  if (error) {
    console.error('유사도 저장 실패:', error);
    throw error;
  }
}

export async function deleteSimilarity(
  groupId: string,
  similarGroupId: string
): Promise<void> {
  const { error } = await supabase
    .from('quiz_group_similarities')
    .delete()
    .eq('group_id', groupId)
    .eq('similar_group_id', similarGroupId);

  if (error) {
    console.error('유사도 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 통계
// ============================================

export async function getQuizStats(): Promise<QuizStats> {
  // 수종 통계
  const { data: speciesData, error: speciesError } = await supabase
    .from('quiz_species')
    .select('is_active');

  if (speciesError) throw speciesError;

  const totalSpecies = speciesData?.length || 0;
  const activeSpecies = speciesData?.filter(s => s.is_active).length || 0;

  // 문항 통계
  const { data: itemsData, error: itemsError } = await supabase
    .from('quiz_items')
    .select('status');

  if (itemsError) throw itemsError;

  const totalItems = itemsData?.length || 0;
  const publishedItems = itemsData?.filter(i => i.status === 'published').length || 0;
  const draftItems = itemsData?.filter(i => i.status === 'draft').length || 0;
  const reviewItems = itemsData?.filter(i => i.status === 'review').length || 0;
  const archivedItems = itemsData?.filter(i => i.status === 'archived').length || 0;

  // 시도 통계
  const { count: totalAttempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true });

  if (attemptsError) throw attemptsError;

  // 고유 사용자 수 (user_id가 null이 아닌 것만)
  const { data: usersData, error: usersError } = await supabase
    .from('quiz_attempts')
    .select('user_id')
    .not('user_id', 'is', null);

  if (usersError) throw usersError;

  const uniqueUsers = new Set(usersData?.map(u => u.user_id)).size;

  return {
    totalSpecies,
    activeSpecies,
    totalItems,
    publishedItems,
    draftItems,
    reviewItems,
    archivedItems,
    totalAttempts: totalAttempts || 0,
    uniqueUsers,
  };
}

// ============================================
// 이미지 URL 헬퍼
// ============================================

export function getQuizImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const { data } = supabase.storage.from('quiz_public').getPublicUrl(imagePath);
  return data?.publicUrl || null;
}
