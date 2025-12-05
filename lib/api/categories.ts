// ============================================
// Categories API Functions
// ============================================

import { supabase } from '@/lib/supabase/client';
import type { Category, CategoryWithParent } from '@/lib/types/database.types';

/**
 * 모든 카테고리 조회
 */
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * 메뉴 카테고리만 조회 (상위 카테고리)
 */
export async function getMenuCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .eq('type', 'menu')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 부모의 하위 카테고리 조회 (속성)
 */
export async function getCategoriesByParent(parentId: number): Promise<Category[]> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('type', 'attribute')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching child categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * slug로 카테고리 조회
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching category by slug:', error);
    throw error;
  }

  return data;
}

/**
 * 카테고리 ID로 조회
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching category by id:', error);
    throw error;
  }

  return data;
}

/**
 * 계층 구조로 카테고리 조회 (부모 정보 포함)
 */
export async function getCategoriesWithParent(): Promise<CategoryWithParent[]> {
  const { data, error } = await supabase
    .from('sn_categories_hierarchy')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories with parent:', error);
    throw error;
  }

  return data || [];
}

/**
 * 특정 메뉴의 모든 속성을 그룹화하여 조회
 * @returns { region: [...], month: [...], species: [...], ... }
 */
export async function getCategoryAttributesGrouped(
  menuSlug: string
): Promise<Record<string, Category[]>> {
  // 1. 메뉴 카테고리 조회
  const menu = await getCategoryBySlug(menuSlug);
  if (!menu) {
    throw new Error(`Menu category not found: ${menuSlug}`);
  }

  // 2. 해당 메뉴의 모든 속성 조회
  const attributes = await getCategoriesByParent(menu.id);

  // 3. slug 패턴에 따라 그룹화
  const grouped: Record<string, Category[]> = {};

  attributes.forEach((attr) => {
    // slug 패턴: "wildflower-seoul", "tree-pine", "pest-none" 등
    // 메뉴 slug 제거 후 그룹 추출
    const slugWithoutMenu = attr.slug.replace(`${menuSlug}-`, '');

    // 첫 번째 '-' 이전을 그룹명으로 사용
    let groupKey = 'default';

    if (menuSlug === 'wildflower') {
      // 지역: wildflower-seoul -> region
      // 월: wildflower-jan -> month
      if (['seoul', 'gyeonggi', 'gangwon', 'chungcheong', 'jeolla', 'gyeongsang', 'jeju'].includes(slugWithoutMenu)) {
        groupKey = 'region';
      } else if (['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(slugWithoutMenu)) {
        groupKey = 'month';
      }
    } else if (menuSlug === 'tree-diagnose') {
      // tree-pine -> species
      // pest-none -> pest
      // equipment-resistograph -> equipment
      // status-good -> status
      if (slugWithoutMenu.startsWith('tree-')) {
        groupKey = 'species';
      } else {
        const prefix = slugWithoutMenu.split('-')[0];
        groupKey = prefix; // pest, equipment, status
      }
    } else if (menuSlug === 'column') {
      // column-policy -> subcategory
      groupKey = 'subcategory';
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(attr);
  });

  return grouped;
}

/**
 * 여러 ID로 카테고리 조회
 */
export async function getCategoriesByIds(ids: number[]): Promise<Category[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('sn_categories')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching categories by ids:', error);
    throw error;
  }

  return data || [];
}
