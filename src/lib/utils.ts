import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
