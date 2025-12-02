export interface Question {
  id: number;
  section: string;
  subSection: string;
  topic: string;
  subTopic?: string;
  questionText: string;
  options: { [key: string]: string };
  correctAnswer: string;
  explanation: string;
}

export interface TextHighlight {
  start: number;
  end: number;
  color: string;
}

export interface QuestionState {
  userAnswer: string | null;
  markedForReview: boolean;
  eliminatedOptions: string[];
  highlights: TextHighlight[];
  checked: boolean;
  checkedOptions: string[]; // Individually checked options
}

export interface FilterOption {
  section: string;
  subSection: string;
  topic: string;
  subTopic?: string;
}

interface RawQuestion {
  id: number;
  question: string;
  answer: string;
  explanation: string;
}

// Parse question text to extract options
function parseQuestion(rawQuestion: string): { questionText: string; options: { [key: string]: string } } {
  const options: { [key: string]: string } = {};
  let questionText = rawQuestion;
  
  // Extract options A, B, C, D with different patterns
  const patterns = [
    /A\)\s*([^B]+?)(?=B\)|$)/s,
    /B\)\s*([^C]+?)(?=C\)|$)/s,
    /C\)\s*([^D]+?)(?=D\)|$)/s,
    /D\)\s*(.+)$/s,
  ];
  
  const letters = ['A', 'B', 'C', 'D'];
  
  letters.forEach((letter, index) => {
    const match = rawQuestion.match(patterns[index]);
    if (match) {
      options[letter] = match[1].trim().replace(/\n/g, ' ');
    }
  });
  
  // Remove options from question text
  const firstOptionIndex = rawQuestion.search(/A\)/);
  if (firstOptionIndex !== -1) {
    questionText = rawQuestion.substring(0, firstOptionIndex).trim();
  }
  
  // Remove "Which choice..." line
  questionText = questionText.replace(/\n\nWhich choice completes the text so that it conforms to the conventions of Standard English\?$/i, '');
  
  return { questionText, options };
}

// Load questions from JSON files dynamically
async function loadJsonFile(path: string): Promise<any> {
  try {
    const response = await fetch(path);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${path}:`, error);
    return null;
  }
}

let cachedQuestions: Question[] | null = null;

// Clear cache (useful for reloading questions)
export function clearQuestionCache() {
  cachedQuestions = null;
}

// Get all questions
export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;
  
  const questions: Question[] = [];
  let globalId = 1;
  
  try {
    // Load all JSON files
    const [boundariesData, verbsData, pronounData, modifiersData] = await Promise.all([
      loadJsonFile('/data/boundaries.json'),
      loadJsonFile('/data/verbs.json'),
      loadJsonFile('/data/pronoun.json'),
      loadJsonFile('/data/modifiers.json'),
    ]);
    
    // Process Boundaries
    const boundariesQuestions = boundariesData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Boundaries"] || [];
    boundariesQuestions.forEach((q: RawQuestion) => {
      const { questionText, options } = parseQuestion(q.question);
      questions.push({
        id: globalId++,
        section: "English",
        subSection: "Standard English Conventions",
        topic: "Boundaries",
        questionText,
        options,
        correctAnswer: q.answer,
        explanation: q.explanation,
      });
    });
    
    // Process Verbs
    const verbsFormStructure = verbsData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (verbsFormStructure) {
      // Subject-Verb Agreement
      (verbsFormStructure["Subject-Verb Agreement"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Subject-Verb Agreement",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Verb Tenses
      (verbsFormStructure["Verb Tenses"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Verb Tenses",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Verb Forms
      (verbsFormStructure["Verb Forms"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Verb Forms",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Process Pronouns
    const pronounFormStructure = pronounData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (pronounFormStructure) {
      (pronounFormStructure["Pronouns"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Pronouns",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Process Modifiers
    const modifiersFormStructure = modifiersData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (modifiersFormStructure) {
      // Modifiers
      (modifiersFormStructure["Modifiers"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Modifiers",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Parallel Structure
      (modifiersFormStructure["Parallel Structure"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Parallel Structure",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Other Topics
      (modifiersFormStructure["Other Topics"] || []).forEach((q: RawQuestion) => {
        const { questionText, options } = parseQuestion(q.question);
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Standard English Conventions",
          topic: "Form, Structure, and Sense",
          subTopic: "Miscellaneous Topics",
          questionText,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
  } catch (error) {
    console.error('Error loading questions:', error);
  }
  
  cachedQuestions = questions;
  return questions;
}

// Sync version for initial render (returns empty array, use async version for actual data)
export function getAllQuestions(): Question[] {
  return cachedQuestions || [];
}

// Get topic counts
export function getTopicCounts(questions: Question[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  
  questions.forEach(q => {
    const key = q.subTopic || q.topic;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return counts;
}

// Filter questions
export function filterQuestions(
  questions: Question[],
  filter: Partial<FilterOption>
): Question[] {
  return questions.filter(q => {
    if (filter.section && q.section !== filter.section) return false;
    if (filter.subSection && q.subSection !== filter.subSection) return false;
    if (filter.topic && q.topic !== filter.topic) return false;
    if (filter.subTopic && q.subTopic !== filter.subTopic) return false;
    return true;
  });
}

// Storage keys
const STORAGE_KEY = 'nextprep_progress';

// Save progress
export function saveProgress(
  questionStates: { [key: number]: QuestionState },
  currentIndex: number,
  filter: Partial<FilterOption>
) {
  const data = {
    questionStates,
    currentIndex,
    filter,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load progress
export function loadProgress(): {
  questionStates: { [key: number]: QuestionState };
  currentIndex: number;
  filter: Partial<FilterOption>;
} | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Clear progress
export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

// Get initial question state
export function getInitialQuestionState(): QuestionState {
  return {
    userAnswer: null,
    markedForReview: false,
    eliminatedOptions: [],
    highlights: [],
    checked: false,
    checkedOptions: [],
  };
}
