// utils.ts

export interface Question {
  id: number;
  passage?: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export function normalizeQuestions(questions: Question[]): Question[] {
  return questions.map(q => ({
    ...q,
    passage: q.passage || "" // if passage is missing, add empty string
  }));
}
