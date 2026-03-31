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
// Helpers
// ============================================

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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

    // 3. Randomly pick items (up to count)
    const selectedItems = shuffle([...items]).slice(0, count);

    // 4. Build questions
    const questions: WebQuizQuestion[] = [];

    for (const item of selectedItems) {
      const correctSpecies = speciesMap.get(item.species_id);
      if (!correctSpecies) {
        console.error(`Species not found for item ${item.id}, species_id: ${item.species_id}`);
        continue;
      }

      // Find distractors
      const distractors = pickDistractors(correctSpecies, species, 3);

      // Build choices: correct + 3 distractors, then shuffle
      const choices: WebQuizChoice[] = shuffle([
        { speciesId: correctSpecies.id, nameKo: correctSpecies.name_ko },
        ...distractors.map((d) => ({ speciesId: d.id, nameKo: d.name_ko })),
      ]);

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
  count: number
): { id: string; name_ko: string; group_id: string | null }[] {
  const distractors: { id: string; name_ko: string; group_id: string | null }[] = [];
  const usedIds = new Set<string>([correctSpecies.id]);

  // First: try same group_id species
  if (correctSpecies.group_id) {
    const sameGroup = shuffle(
      allSpecies.filter(
        (s) => s.group_id === correctSpecies.group_id && s.id !== correctSpecies.id
      )
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
      allSpecies.filter((s) => !usedIds.has(s.id))
    );
    for (const s of others) {
      if (distractors.length >= count) break;
      distractors.push(s);
      usedIds.add(s.id);
    }
  }

  return distractors;
}
