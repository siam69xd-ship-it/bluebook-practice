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
  correct_answer: string;
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
let vocabMapPromise: Promise<Map<string, VocabEntry>> | null = null;
let readingCache: ReadingSet[] | null = null;
let readingPromise: Promise<ReadingSet[]> | null = null;

export async function loadVocabulary(): Promise<VocabEntry[]> {
  if (vocabCache) return vocabCache;
  const res = await fetch('/data/reading/vocabulary.json');
  const data = await res.json();
  vocabCache = Array.isArray(data) ? data : data.words || [];
  return vocabCache!;
}

/**
 * Cached, promise-deduped vocab map (lowercase word -> entry).
 * Repeated callers share the same Map instance.
 */
export function loadVocabMap(): Promise<Map<string, VocabEntry>> {
  if (vocabMapCache) return Promise.resolve(vocabMapCache);
  if (vocabMapPromise) return vocabMapPromise;
  vocabMapPromise = loadVocabulary().then((words) => {
    const map = new Map<string, VocabEntry>();
    for (let i = 0; i < words.length; i++) {
      const w = words[i].word;
      if (!w) continue;
      map.set(w.toLowerCase().trim(), words[i]);
    }
    vocabMapCache = map;
    return map;
  });
  return vocabMapPromise;
}

export function loadReadingSets(): Promise<ReadingSet[]> {
  if (readingCache) return Promise.resolve(readingCache);
  if (readingPromise) return readingPromise;
  readingPromise = fetch('/data/reading/reading_practices.json')
    .then((r) => r.json())
    .then((data) => {
      readingCache = Array.isArray(data) ? data : data.sets || [];
      return readingCache!;
    });
  return readingPromise;
}

export type PassageToken =
  | { type: 'text'; value: string }
  | { type: 'vocab'; value: string; key: string; entry: VocabEntry };

// Precompiled once — reused across all calls.
const WORD_RE = /[A-Za-z\u00C0-\u024F']+/g;
const HTML_RE = /<[^>]+>/g;

/**
 * Single-pass tokenizer: O(n) over the passage with O(1) Map lookups.
 * Avoids the split-array-then-classify overhead by walking regex matches
 * and emitting only three token types: literal text spans, vocab matches,
 * and interstitial non-word runs.
 */
export function tokenizePassage(passage: string, vocabMap: Map<string, VocabEntry>): PassageToken[] {
  const cleaned = passage.replace(HTML_RE, '');
  const tokens: PassageToken[] = [];
  let last = 0;
  WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WORD_RE.exec(cleaned)) !== null) {
    const word = m[0];
    const start = m.index;
    if (start > last) {
      tokens.push({ type: 'text', value: cleaned.slice(last, start) });
    }
    const key = word.toLowerCase();
    const entry = vocabMap.get(key);
    if (entry) {
      tokens.push({ type: 'vocab', value: word, key, entry });
    } else {
      tokens.push({ type: 'text', value: word });
    }
    last = start + word.length;
  }
  if (last < cleaned.length) {
    tokens.push({ type: 'text', value: cleaned.slice(last) });
  }
  return tokens;
}
