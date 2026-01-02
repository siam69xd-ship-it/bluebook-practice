import { Difficulty } from '@/lib/difficultyData';

// =============
// TYPE DEFINITIONS
// =============

export interface Question {
  id: number;
  passage?: string;
  questionPrompt?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  section?: 'English' | 'Math';
  subSection?: string;
  topic?: string;
  subTopic?: string;
  difficulty?: Difficulty;
  isGridIn?: boolean;
}

export interface QuestionState {
  userAnswer: string | null;
  checked: boolean;
  checkedOptions?: string[];
  eliminatedOptions?: string[];
  markedForReview: boolean;
  highlights: TextHighlight[];
}

export interface TextHighlight {
  start: number;
  end: number;
  color: string;
}

export interface FilterOption {
  section?: 'English' | 'Math';
  subSection?: string;
  topic?: string;
  subTopic?: string;
}

// =============
// DATA FILES CONFIG
// =============

const ENGLISH_DATA_FILES = [
  { file: 'boundaries.json', subSection: 'Standard English Conventions', topic: 'Boundaries' },
  { file: 'cross_text_connections.json', subSection: 'Craft and Structure', topic: 'Cross-Text Connections' },
  { file: 'detailed_questions.json', subSection: 'Information and Ideas', topic: 'Central Ideas and Details', subTopic: 'Detail Questions' },
  { file: 'gap_fillings.json', subSection: 'Craft and Structure', topic: 'Words in Context', subTopic: 'Gap Fillings' },
  { file: 'graphs.json', subSection: 'Information and Ideas', topic: 'Command of Evidence', subTopic: 'Graphs' },
  { file: 'inference.json', subSection: 'Information and Ideas', topic: 'Inferences' },
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
];

const MATH_DATA_FILES = [
  { file: 'expressions.json', subSection: 'Algebra', topic: 'Expressions' },
  { file: 'linear_equations.json', subSection: 'Algebra', topic: 'Linear Equations' },
  { file: 'linear_equations_system.json', subSection: 'Algebra', topic: 'Linear System of Equations' },
  { file: 'linear_functions.json', subSection: 'Algebra', topic: 'Linear Functions' },
  { file: 'linear_inequalities.json', subSection: 'Algebra', topic: 'Linear Inequalities' },
  { file: 'polynomials.json', subSection: 'Advanced Math', topic: 'Polynomials' },
  { file: 'exponents_radicals.json', subSection: 'Advanced Math', topic: 'Exponents & Radicals' },
  { file: 'functions_function_notation.json', subSection: 'Advanced Math', topic: 'Functions & Function Notation' },
  { file: 'exponential_functions.json', subSection: 'Advanced Math', topic: 'Exponential Functions' },
  { file: 'quadratics.json', subSection: 'Advanced Math', topic: 'Quadratics' },
  { file: 'mean_median_mode_range.json', subSection: 'Problem Solving', topic: 'Mean/Median/Mode/Range' },
  { file: 'research_organizing.json', subSection: 'Problem Solving', topic: 'Research Organizing' },
  { file: 'percent_ratio_proportion.json', subSection: 'Problem Solving', topic: 'Percent; Ratio & Proportion' },
  { file: 'probability.json', subSection: 'Problem Solving', topic: 'Probability' },
  { file: 'unit_conversion.json', subSection: 'Problem Solving', topic: 'Unit Conversion' },
  { file: 'scatterplots.json', subSection: 'Problem Solving', topic: 'Scatterplots' },
  { file: 'lines_angles.json', subSection: 'Geometry and Trigonometry', topic: 'Lines & Angles' },
  { file: 'triangles.json', subSection: 'Geometry and Trigonometry', topic: 'Triangles' },
  { file: 'trigonometry.json', subSection: 'Geometry and Trigonometry', topic: 'Trigonometry' },
  { file: 'circles.json', subSection: 'Geometry and Trigonometry', topic: 'Circles' },
  { file: 'areas_volumes.json', subSection: 'Geometry and Trigonometry', topic: 'Areas & Volumes' },
];

// =============
// CACHE
// =============

let questionCache: Question[] | null = null;

export function clearQuestionCache() {
  questionCache = null;
}

// =============
// HELPER FUNCTIONS
// =============

function extractQuestionsFromText(text: string): any[] {
  const questions: any[] = [];
  const questionRegex = /\{\s*"id"\s*:\s*(\d+)\s*,\s*"question"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"options"\s*:\s*\[((?:[^\]]*?))\]\s*,\s*"answer"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/gs;
  
  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    try {
      const optionsStr = match[3].trim();
      let options: string[] = [];
      
      if (optionsStr) {
        const optionMatches = optionsStr.match(/"(?:[^"\\]|\\.)*"/g);
        if (optionMatches) {
          options = optionMatches.map(o => JSON.parse(o));
        }
      }
      
      questions.push({
        id: parseInt(match[1]),
        question: JSON.parse(`"${match[2]}"`),
        options,
        answer: JSON.parse(`"${match[4]}"`),
        explanation: JSON.parse(`"${match[5]}"`)
      });
    } catch (e) {
      // Skip malformed question
    }
  }
  
  return questions;
}

// =============
// LOAD ENGLISH QUESTIONS
// =============

async function loadEnglishQuestions(): Promise<Question[]> {
  const allQuestions: Question[] = [];
  
  const loadPromises = ENGLISH_DATA_FILES.map(async ({ file, subSection, topic, subTopic }) => {
    try {
      const response = await fetch(`/data/${file}`);
      if (!response.ok) return [];
      
      const text = await response.text();
      let rawQuestions: any[] = [];
      
      try {
        const data = JSON.parse(text);
        rawQuestions = data.questions || [];
      } catch (parseError) {
        console.warn(`Fallback extraction for ${file}`);
        rawQuestions = extractQuestionsFromText(text);
      }
      
      return rawQuestions.map((q, index) => ({
        id: index + 1,
        passage: q.passage || '',
        questionPrompt: q.questionPrompt || q.question || '',
        question: q.questionPrompt || q.question || '',
        options: q.options || [],
        correctAnswer: q.answer || q.correctAnswer || '',
        explanation: q.explanation || '',
        section: 'English' as const,
        subSection,
        topic,
        subTopic,
        difficulty: q.difficulty as Difficulty | undefined,
      }));
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
      return [];
    }
  });
  
  const results = await Promise.all(loadPromises);
  let idCounter = 1;
  
  for (const questions of results) {
    for (const q of questions) {
      q.id = idCounter++;
      allQuestions.push(q);
    }
  }
  
  return allQuestions;
}

// =============
// LOAD MATH QUESTIONS
// =============

async function loadMathQuestions(): Promise<Question[]> {
  const allQuestions: Question[] = [];
  
  const loadPromises = MATH_DATA_FILES.map(async ({ file, subSection, topic }) => {
    try {
      const response = await fetch(`/data/math/${file}`);
      if (!response.ok) return [];
      
      const text = await response.text();
      let rawQuestions: any[] = [];
      
      try {
        const data = JSON.parse(text);
        rawQuestions = data.questions || [];
      } catch (parseError) {
        console.warn(`Fallback extraction for ${file}`);
        rawQuestions = extractQuestionsFromText(text);
      }
      
      return rawQuestions.map((q, index) => {
        const isGridIn = !q.options || q.options.length === 0 || 
          (q.options.length === 1 && q.options[0].toLowerCase().includes('grid-in'));
        
        return {
          id: index + 1,
          passage: '',
          questionPrompt: q.question || '',
          question: q.question || '',
          options: isGridIn ? [] : (q.options || []),
          correctAnswer: q.answer || '',
          explanation: q.explanation || '',
          section: 'Math' as const,
          subSection,
          topic,
          difficulty: q.difficulty as Difficulty | undefined,
          isGridIn,
        };
      });
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
      return [];
    }
  });
  
  const results = await Promise.all(loadPromises);
  let idCounter = 10000; // Start Math IDs at 10000 to avoid conflicts
  
  for (const questions of results) {
    for (const q of questions) {
      q.id = idCounter++;
      allQuestions.push(q);
    }
  }
  
  return allQuestions;
}

// =============
// MAIN LOADER
// =============

export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (questionCache) {
    return questionCache;
  }
  
  const [englishQuestions, mathQuestions] = await Promise.all([
    loadEnglishQuestions(),
    loadMathQuestions()
  ]);
  
  questionCache = [...englishQuestions, ...mathQuestions];
  console.log(`Loaded ${englishQuestions.length} English questions and ${mathQuestions.length} Math questions`);
  return questionCache;
}

// =============
// FILTER QUESTIONS
// =============

export function filterQuestions(questions: Question[], filter: Partial<FilterOption>): Question[] {
  if (!filter || Object.keys(filter).length === 0) {
    return questions;
  }
  
  return questions.filter(q => {
    if (filter.section && q.section !== filter.section) return false;
    if (filter.subSection && q.subSection !== filter.subSection) return false;
    if (filter.topic && q.topic !== filter.topic) return false;
    if (filter.subTopic && q.subTopic !== filter.subTopic) return false;
    return true;
  });
}

// =============
// TOPIC COUNTS
// =============

export function getTopicCounts(questions: Question[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  questions.forEach(q => {
    if (q.topic) {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    }
    if (q.subSection) {
      counts[q.subSection] = (counts[q.subSection] || 0) + 1;
    }
  });
  
  return counts;
}

// =============
// QUESTION STATE
// =============

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

// =============
// PROGRESS PERSISTENCE
// =============

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
  try {
    const data: SavedProgress = { questionStates, currentIndex, filter };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

export function loadProgress(): SavedProgress | null {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return null;
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.warn('Failed to clear progress:', e);
  }
}
