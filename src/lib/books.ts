export interface BookQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface BookChapter {
  id: string;
  title: string;
  passage: string;
  questions: BookQuestion[];
}

export interface Book {
  id: string;
  title: string;
  hasChapters: boolean;
  chapters: BookChapter[];
}

export interface BookLevelData {
  level: string;
  books: Book[];
}

export const BOOK_LEVELS = [
  { id: 'a1', label: 'A1', name: 'Beginner', available: true },
  { id: 'a2', label: 'A2', name: 'Elementary', available: true },
  { id: 'b1', label: 'B1', name: 'Intermediate', available: true },
  { id: 'b2', label: 'B2', name: 'Upper Intermediate', available: false },
  { id: 'c1', label: 'C1', name: 'Advanced', available: false },
  { id: 'c2', label: 'C2', name: 'Proficiency', available: false },
] as const;

const cache = new Map<string, Promise<BookLevelData>>();

export function loadBookLevel(level: string): Promise<BookLevelData> {
  const key = level.toLowerCase();
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/data/books/${key}.json`)
        .then((r) => {
          if (!r.ok) throw new Error('not found');
          return r.json();
        })
        .catch(() => ({ level: key.toUpperCase(), books: [] as Book[] }))
    );
  }
  return cache.get(key)!;
}

export function countQuestions(book: Book): number {
  return book.chapters.reduce((a, c) => a + c.questions.length, 0);
}
