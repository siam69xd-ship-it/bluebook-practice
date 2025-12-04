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

interface CentralIdeaQuestion {
  id: number;
  passage: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// Parse question text to extract options
function parseQuestion(rawQuestion: string): { questionText: string; options: { [key: string]: string } } {
  const options: { [key: string]: string } = {};
  let questionText = rawQuestion;
  
  // Find where options start - look for A) at the beginning of a line or after newline/space
  const optionsStartMatch = rawQuestion.match(/(?:^|\n)\s*A\)\s*/);
  if (optionsStartMatch && optionsStartMatch.index !== undefined) {
    const optionsStartIndex = optionsStartMatch.index;
    questionText = rawQuestion.substring(0, optionsStartIndex).trim();
    const optionsText = rawQuestion.substring(optionsStartIndex);
    
    // Split options by looking for letter patterns at start of line or after newline
    const optionMatches = optionsText.match(/([A-D])\)\s*([^\n]+?)(?=\n[A-D]\)|$)/gs);
    
    if (optionMatches) {
      optionMatches.forEach(match => {
        const letterMatch = match.match(/^([A-D])\)\s*(.+)$/s);
        if (letterMatch) {
          options[letterMatch[1]] = letterMatch[2].trim().replace(/\n/g, ' ');
        }
      });
    }
    
    // Fallback: try parsing with line-based approach if regex didn't capture all 4
    if (Object.keys(options).length < 4) {
      const lines = optionsText.split('\n');
      lines.forEach(line => {
        const lineMatch = line.match(/^\s*([A-D])\)\s*(.+)$/);
        if (lineMatch && !options[lineMatch[1]]) {
          options[lineMatch[1]] = lineMatch[2].trim();
        }
      });
    }
  }
  
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
    const [boundariesData, verbsData, pronounData, modifiersData, centralIdeaData, textStructureData, wordsInContextData, transitionsData] = await Promise.all([
      loadJsonFile('/data/boundaries.json'),
      loadJsonFile('/data/verbs.json'),
      loadJsonFile('/data/pronoun.json'),
      loadJsonFile('/data/modifiers.json'),
      loadJsonFile('/data/central_idea_and_details.json'),
      loadJsonFile('/data/text_structure_and_purpose.json'),
      loadJsonFile('/data/words_in_context.json'),
      loadJsonFile('/data/transitions.json'),
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
      
      // Miscellaneous Topics / Other Topics
      (modifiersFormStructure["Miscellaneous Topics"] || modifiersFormStructure["Other Topics"] || []).forEach((q: RawQuestion) => {
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
    
    // Process Central Ideas and Details (99 questions)
    const informationAndIdeas = centralIdeaData?.["English Reading & Writing"]?.["Information and Ideas"];
    if (informationAndIdeas) {
      // Central Ideas and Details
      (informationAndIdeas["Central Ideas and Details"] || []).forEach((q: CentralIdeaQuestion) => {
        // Parse options from array format ["A) ...", "B) ...", etc.]
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Central Ideas and Details",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Command of Evidence
      (informationAndIdeas["Command of Evidence"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Command of Evidence",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Inferences
      (informationAndIdeas["Inferences"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Inferences",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Process Text Structure and Purpose (81 questions)
    const craftAndStructure = textStructureData?.["English Reading & Writing"]?.["Craft and Structure"];
    if (craftAndStructure) {
      // Text Structure and Purpose
      (craftAndStructure["Text Structure and Purpose"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Text Structure and Purpose",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Cross-Text Connections
      (craftAndStructure["Cross-Text Connections"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Cross-Text Connections",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Process Words in Context questions
    const wordsInContextCraftStructure = wordsInContextData?.["English Reading & Writing"]?.["Craft and Structure"];
    if (wordsInContextCraftStructure) {
      (wordsInContextCraftStructure["Words in Context"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Words in Context",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Process Transitions questions
    const expressionOfIdeas = transitionsData?.["English Reading & Writing"]?.["Expression of Ideas"];
    if (expressionOfIdeas) {
      (expressionOfIdeas["Transitions"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Expression of Ideas",
          topic: "Transitions",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
      
      // Rhetorical Synthesis
      (expressionOfIdeas["Rhetorical Synthesis"] || []).forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Expression of Ideas",
          topic: "Rhetorical Synthesis",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
      });
    }
    
    // Also check if transitions is just an array (simpler format)
    if (Array.isArray(transitionsData)) {
      transitionsData.forEach((q: CentralIdeaQuestion) => {
        const options: { [key: string]: string } = {};
        q.options.forEach((opt: string) => {
          const match = opt.match(/^([A-D])\)\s*(.+)$/s);
          if (match) {
            options[match[1]] = match[2].trim();
          }
        });
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Expression of Ideas",
          topic: "Transitions",
          questionText: `${q.passage}\n\n${q.question}`,
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
