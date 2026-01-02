import { Difficulty } from './difficultyData';

// Types
export interface Question {
  id: number;
  passage?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  section?: string;
  subSection?: string;
  topic?: string;
  subTopic?: string;
  difficulty?: Difficulty;
  correctAnswer?: string;
  isGridIn?: boolean;
}

export interface QuestionState {
  userAnswer: string | null;
  checked: boolean;
  checkedOptions: string[];
  eliminatedOptions: string[];
  markedForReview: boolean;
  highlights: TextHighlight[];
}

export interface TextHighlight {
  start: number;
  end: number;
  color: string;
}

export interface FilterOption {
  section?: string;
  subSection?: string;
  topic?: string;
  subTopic?: string;
  difficulty?: Difficulty;
}

// Data files mapping
const DATA_FILES = [
  { file: 'boundaries.json', subSection: 'Standard English Conventions', topic: 'Boundaries' },
  { file: 'cross_text_connections.json', subSection: 'Craft and Structure', topic: 'Cross-Text Connections' },
  { file: 'detailed_questions.json', subSection: 'Information and Ideas', topic: 'Detail Questions', parentTopic: 'Central Ideas and Details' },
  { file: 'gap_fillings.json', subSection: 'Craft and Structure', topic: 'Words in Context', subTopic: 'Gap Fillings' },
  { file: 'graphs.json', subSection: 'Information and Ideas', topic: 'Command of Evidence', subTopic: 'Graphs' },
  { file: 'main_ideas.json', subSection: 'Information and Ideas', topic: 'Central Ideas and Details', subTopic: 'Main Ideas' },
  { file: 'main_purpose.json', subSection: 'Craft and Structure', topic: 'Text Structure and Purpose', subTopic: 'Main Purpose' },
  { file: 'modifiers.json', subSection: 'Standard English Conventions', topic: 'Form, Structure, and Sense', subTopic: 'Modifiers' },
  { file: 'overall_structure.json', subSection: 'Craft and Structure', topic: 'Text Structure and Purpose', subTopic: 'Overall Structure' },
  { file: 'pronoun.json', subSection: 'Standard English Conventions', topic: 'Form, Structure, and Sense', subTopic: 'Pronouns' },
  { file: 'quotation.json', subSection: 'Information and Ideas', topic: 'Command of Evidence', subTopic: 'Quotation' },
  { file: 'rhetorical_synthesis.json', subSection: 'Expression of Ideas', topic: 'Rhetorical Synthesis' },
  { file: 'support.json', subSection: 'Information and Ideas', topic: 'Command of Evidence', subTopic: 'Support' },
  { file: 'synonyms.json', subSection: 'Craft and Structure', topic: 'Words in Context', subTopic: 'Synonyms' },
  { file: 'transitions.json', subSection: 'Expression of Ideas', topic: 'Transitions' },
  { file: 'underlined_purpose.json', subSection: 'Craft and Structure', topic: 'Text Structure and Purpose', subTopic: 'Underlined Purpose' },
  { file: 'verbs.json', subSection: 'Standard English Conventions', topic: 'Form, Structure, and Sense', subTopic: 'Verb Tenses' },
  { file: 'weaken.json', subSection: 'Information and Ideas', topic: 'Command of Evidence', subTopic: 'Weaken' },
  { file: 'inference.json', subSection: 'Information and Ideas', topic: 'Inferences' },
];

// Cache for loaded questions
let questionsCache: Question[] | null = null;

export function clearQuestionCache(): void {
  questionsCache = null;
}

export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (questionsCache) {
    return questionsCache;
  }

  const allQuestions: Question[] = [];

  const loadPromises = DATA_FILES.map(async ({ file, subSection, topic, subTopic, parentTopic }) => {
    try {
      const response = await fetch(`/data/${file}`);
      if (!response.ok) return [];

      const data = await response.json();
      const questions = data.questions || [];

      return questions.map((q: any, index: number) => ({
        id: index + 1,
        passage: q.passage || '',
        question: q.question || '',
        options: q.options || [],
        answer: q.answer || q.correctAnswer || '',
        explanation: q.explanation || '',
        section: 'English',
        subSection,
        topic: parentTopic || topic,
        subTopic: parentTopic ? topic : subTopic,
        difficulty: q.difficulty || 'medium',
        correctAnswer: q.answer || q.correctAnswer || '',
      }));
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
      return [];
    }
  });

  const results = await Promise.all(loadPromises);

  // Flatten and reassign IDs
  let idCounter = 1;
  for (const questions of results) {
    for (const q of questions) {
      q.id = idCounter++;
      allQuestions.push(q);
    }
  }

  questionsCache = allQuestions;
  console.log(`Loaded ${allQuestions.length} questions`);
  return allQuestions;
}

export function filterQuestions(
  questions: Question[],
  filter: Partial<FilterOption>
): Question[] {
  if (!filter || Object.keys(filter).length === 0) {
    return questions;
  }

  return questions.filter(q => {
    if (filter.section && q.section !== filter.section) return false;
    if (filter.subSection && q.subSection !== filter.subSection) return false;
    if (filter.topic && q.topic !== filter.topic) return false;
    if (filter.subTopic && q.subTopic !== filter.subTopic) return false;
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
    return true;
  });
}

export function getInitialQuestionState(): QuestionState {
  return {
    userAnswer: null,
    checked: false,
    checkedOptions: [],
    eliminatedOptions: [],
    markedForReview: false,
    highlights: [],
  };
}

// Progress storage
const PROGRESS_KEY = 'sat_practice_progress';

interface SavedProgress {
  questionStates: { [key: number]: QuestionState };
  currentIndex: number;
  filter: Partial<FilterOption>;
}

export function saveProgress(
  questionStates: { [key: number]: QuestionState },
  currentIndex: number,
  filter: Partial<FilterOption>
): void {
  const progress: SavedProgress = {
    questionStates,
    currentIndex,
    filter,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadProgress(): SavedProgress | null {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load progress:', error);
  }
  return null;
}

export function getTopicCounts(questions: Question[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const q of questions) {
    const topic = q.subTopic || q.topic || 'Other';
    counts[topic] = (counts[topic] || 0) + 1;
  }
  
  return counts;
}
