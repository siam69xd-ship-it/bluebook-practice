// Vocabulary + Reading Practice data loader.
// Fully data-driven: reads from /data/reading/*.json at runtime.

export interface VocabEntry {
  id: number;
  word: string;
  definition?: string;
  example?: string;
  antonym?: string;
  synonym?: string;
  set?: string;
  [key: string]: unknown;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  correct_answer: string; // "A" | "B" | "C" | "D"
  explanation?: string;
}

export interface ReadingSet {
  id: number | string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

let vocabCache: VocabEntry[] | null = null;
let vocabMapCache: Map<string, VocabEntry> | null = null;
let readingCache: ReadingSet[] | null = null;

export async function loadVocabulary(): Promise<VocabEntry[]> {
  if (vocabCache) return vocabCache;
  const res = await fetch('/data/reading/vocabulary.json');
  const data = await res.json();
  vocabCache = Array.isArray(data) ? data : data.words || [];
  return vocabCache!;
}

export async function loadVocabMap(): Promise<Map<string, VocabEntry>> {
  if (vocabMapCache) return vocabMapCache;
  const words = await loadVocabulary();
  const map = new Map<string, VocabEntry>();
  for (const entry of words) {
    if (!entry.word) continue;
    map.set(entry.word.toLowerCase().trim(), entry);
  }
  vocabMapCache = map;
  return map;
}

export async function loadReadingSets(): Promise<ReadingSet[]> {
  if (readingCache) return readingCache;
  const res = await fetch('/data/reading/reading_practices.json');
  const data = await res.json();
  readingCache = Array.isArray(data) ? data : data.sets || [];
  return readingCache!;
}

/**
 * Tokenize a passage into an array of segments where each segment is
 * either a plain-text run or a vocabulary match.
 * Uses a Unicode-aware word boundary split.
 */
export type PassageToken =
  | { type: 'text'; value: string }
  | { type: 'vocab'; value: string; entry: VocabEntry };

export function tokenizePassage(passage: string, vocabMap: Map<string, VocabEntry>): PassageToken[] {
  // Strip stray HTML tags that appear as formatting noise in the source JSON
  // (e.g. <b>h</b> mid-word). Preserve line breaks.
  const cleaned = passage.replace(/<[^>]+>/g, '');

  // Split preserving separators. \p{L} matches any Unicode letter.
  const parts = cleaned.split(/([A-Za-z\u00C0-\u024F']+)/g);
  const tokens: PassageToken[] = [];
  for (const part of parts) {
    if (!part) continue;
    const isWord = /^[A-Za-z\u00C0-\u024F']+$/.test(part);
    if (isWord) {
      const entry = vocabMap.get(part.toLowerCase());
      if (entry) {
        tokens.push({ type: 'vocab', value: part, entry });
        continue;
      }
    }
    tokens.push({ type: 'text', value: part });
  }
  return tokens;
}
