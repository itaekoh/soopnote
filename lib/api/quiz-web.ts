// ============================================
// Web Quiz Data Fetching (Server-Side)
// ============================================

import { createClient } from '@/lib/supabase/server';

// ============================================
// Types
// ============================================

export interface WebQuizChoice {
  speciesId: string;
  nameKo: string;
}

export interface WebQuizQuestion {
  itemId: string;
  imageUrl: string;
  correctSpeciesId: string;
  correctNameKo: string;
  choices: WebQuizChoice[];
}

// ============================================
// Seeded Random (mulberry32)
// ============================================

/** Returns a deterministic PRNG function [0,1) from a 32-bit seed */
function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** KST 기준 오늘 날짜를 32-bit 해시 시드로 변환 */
function dateSeed(): number {
  const now = new Date();
  // UTC+9 (KST)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = `${kst.getUTCFullYear()}-${kst.getUTCMonth()}-${kst.getUTCDate()}`;
  // Simple string hash (djb2)
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

// ============================================
// Helpers
// ============================================

/** Fisher-Yates shuffle using a seeded random function */
function shuffle<T>(array: T[], random: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============================================
// Main Function
// ============================================

export async function fetchWebQuizSet(count: number = 5): Promise<WebQuizQuestion[]> {
  try {
    const supabase = await createClient();
    const random = createSeededRandom(dateSeed());

    // 1. Fetch published quiz items
    const { data: items, error: itemsError } = await supabase
      .from('quiz_items')
      .select('id, species_id, image_path')
      .eq('status', 'published');

    if (itemsError) {
      console.error('Failed to fetch quiz items:', itemsError);
      return [];
    }

    if (!items || items.length === 0) {
      return [];
    }

    // 2. Fetch active species
    const { data: species, error: speciesError } = await supabase
      .from('quiz_species')
      .select('id, name_ko, group_id')
      .eq('is_active', true);

    if (speciesError) {
      console.error('Failed to fetch quiz species:', speciesError);
      return [];
    }

    if (!species || species.length === 0) {
      return [];
    }

    // Build species lookup map
    const speciesMap = new Map(species.map((s) => [s.id, s]));

    // 3. Pick items deterministically (seeded shuffle)
    const selectedItems = shuffle([...items], random).slice(0, count);

    // 4. Build questions
    const questions: WebQuizQuestion[] = [];

    for (const item of selectedItems) {
      const correctSpecies = speciesMap.get(item.species_id);
      if (!correctSpecies) {
        console.error(`Species not found for item ${item.id}, species_id: ${item.species_id}`);
        continue;
      }

      // Find distractors
      const distractors = pickDistractors(correctSpecies, species, 3, random);

      // Build choices: correct + 3 distractors, then shuffle
      const choices: WebQuizChoice[] = shuffle([
        { speciesId: correctSpecies.id, nameKo: correctSpecies.name_ko },
        ...distractors.map((d) => ({ speciesId: d.id, nameKo: d.name_ko })),
      ], random);

      questions.push({
        itemId: item.id,
        imageUrl: `/api/quiz/image/${item.id}`,
        correctSpeciesId: correctSpecies.id,
        correctNameKo: correctSpecies.name_ko,
        choices,
      });
    }

    return questions;
  } catch (error) {
    console.error('Failed to fetch web quiz set:', error);
    return [];
  }
}

/**
 * Pick N distractor species for a question.
 * Prefers species from the same group_id, fills remaining from other species.
 */
function pickDistractors(
  correctSpecies: { id: string; name_ko: string; group_id: string | null },
  allSpecies: { id: string; name_ko: string; group_id: string | null }[],
  count: number,
  random: () => number
): { id: string; name_ko: string; group_id: string | null }[] {
  const distractors: { id: string; name_ko: string; group_id: string | null }[] = [];
  const usedIds = new Set<string>([correctSpecies.id]);

  // First: try same group_id species
  if (correctSpecies.group_id) {
    const sameGroup = shuffle(
      allSpecies.filter(
        (s) => s.group_id === correctSpecies.group_id && s.id !== correctSpecies.id
      ),
      random
    );
    for (const s of sameGroup) {
      if (distractors.length >= count) break;
      if (!usedIds.has(s.id)) {
        distractors.push(s);
        usedIds.add(s.id);
      }
    }
  }

  // Second: fill remaining from other species
  if (distractors.length < count) {
    const others = shuffle(
      allSpecies.filter((s) => !usedIds.has(s.id)),
      random
    );
    for (const s of others) {
      if (distractors.length >= count) break;
      distractors.push(s);
      usedIds.add(s.id);
    }
  }

  return distractors;
}
