import { Difficulty, getQuestionDifficulty } from './difficultyData';

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
  difficulty?: Difficulty;
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

// New format question structure
interface NewFormatQuestion {
  id: string;
  difficulty?: string;
  content: {
    passage?: string;
    passage_1?: string;
    passage_2?: string;
    question: string;
    options: string[];
  };
  solution: {
    answer: string;
    explanation: string;
  };
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

// Parse new format options
function parseNewFormatOptions(optionStrings: string[]): { [key: string]: string } {
  const options: { [key: string]: string } = {};
  optionStrings.forEach((opt: string) => {
    const match = opt.match(/^([A-D])\)\s*(.+)$/s);
    if (match) {
      options[match[1]] = match[2].trim();
    }
  });
  return options;
}

// Load questions from JSON files dynamically
async function loadJsonFile(path: string): Promise<any> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    console.log(`Loaded ${path}:`, data ? 'success' : 'empty');
    return data;
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
    const [
      boundariesData, verbsData, pronounData, modifiersData,
      transitionsData, inferenceData,
      crossTextData, mainPurposeData, overallStructureData, underlinedPurposeData,
      gapFillingsData, synonymsData, supportData, weakenData, quotationData, graphsData,
      mainIdeasData, detailedQuestionsData
    ] = await Promise.all([
      loadJsonFile('/data/boundaries.json'),
      loadJsonFile('/data/verbs.json'),
      loadJsonFile('/data/pronoun.json'),
      loadJsonFile('/data/modifiers.json'),
      loadJsonFile('/data/transitions.json'),
      loadJsonFile('/data/inference.json'),
      loadJsonFile('/data/cross_text_connections.json'),
      loadJsonFile('/data/main_purpose.json'),
      loadJsonFile('/data/overall_structure.json'),
      loadJsonFile('/data/underlined_purpose.json'),
      loadJsonFile('/data/gap_fillings.json'),
      loadJsonFile('/data/synonyms.json'),
      loadJsonFile('/data/support.json'),
      loadJsonFile('/data/weaken.json'),
      loadJsonFile('/data/quotation.json'),
      loadJsonFile('/data/graphs.json'),
      loadJsonFile('/data/main_ideas.json'),
      loadJsonFile('/data/detailed_questions.json'),
    ]);
    
    // Process Boundaries
    const boundariesQuestions = boundariesData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Boundaries"] || [];
    boundariesQuestions.forEach((q: RawQuestion, index: number) => {
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
        difficulty: getQuestionDifficulty("Boundaries", undefined, index),
      });
    });
    
    // Process Verbs
    const verbsFormStructure = verbsData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (verbsFormStructure) {
      // Subject-Verb Agreement
      (verbsFormStructure["Subject-Verb Agreement"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Subject-Verb Agreement", index),
        });
      });
      
      // Verb Tenses
      (verbsFormStructure["Verb Tenses"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Verb Tenses", index),
        });
      });
      
      // Verb Forms
      (verbsFormStructure["Verb Forms"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Verb Forms", index),
        });
      });
    }
    
    // Process Pronouns
    const pronounFormStructure = pronounData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (pronounFormStructure) {
      (pronounFormStructure["Pronouns"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Pronouns", index),
        });
      });
    }
    
    // Process Modifiers
    const modifiersFormStructure = modifiersData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (modifiersFormStructure) {
      // Modifiers
      (modifiersFormStructure["Modifiers"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Modifiers", index),
        });
      });
      
      // Parallel Structure
      (modifiersFormStructure["Parallel Structure"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Parallel Structure", index),
        });
      });
      
      // Miscellaneous Topics / Other Topics
      (modifiersFormStructure["Miscellaneous Topics"] || modifiersFormStructure["Other Topics"] || []).forEach((q: RawQuestion, index: number) => {
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
          difficulty: getQuestionDifficulty("Form, Structure, and Sense", "Miscellaneous Topics", index),
        });
      });
    }
    
    // Track indices for difficulty assignment
    let transitionsIndex = 0;
    let inferencesIndex = 0;
    let rhetoricalSynthesisIndex = 0;
    
    // Process Transitions questions
    const expressionOfIdeas = transitionsData?.["English Reading & Writing"]?.["Expression of Ideas"];
    
    if (expressionOfIdeas) {
      const transitionsArray = expressionOfIdeas["Transitions"] || [];
      
      transitionsArray.forEach((q: CentralIdeaQuestion) => {
        const options = parseNewFormatOptions(q.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Expression of Ideas",
          topic: "Transitions",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
          difficulty: getQuestionDifficulty("Transitions", undefined, transitionsIndex++),
        });
      });
      
      // Rhetorical Synthesis
      (expressionOfIdeas["Rhetorical Synthesis"] || []).forEach((q: CentralIdeaQuestion) => {
        const options = parseNewFormatOptions(q.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Expression of Ideas",
          topic: "Rhetorical Synthesis",
          questionText: `${q.passage}\n\n${q.question}`,
          options,
          correctAnswer: q.answer,
          explanation: q.explanation,
          difficulty: getQuestionDifficulty("Rhetorical Synthesis", undefined, rhetoricalSynthesisIndex++),
        });
      });
    }
    
    // Process inference.json - contains Transitions and Inferences
    if (inferenceData) {
      // Transitions from inference.json
      const inferenceExpressionOfIdeas = inferenceData?.["English Reading & Writing"]?.["Expression of Ideas"];
      if (inferenceExpressionOfIdeas) {
        (inferenceExpressionOfIdeas["Transitions"] || []).forEach((q: CentralIdeaQuestion) => {
          const options = parseNewFormatOptions(q.options);
          
          questions.push({
            id: globalId++,
            section: "English",
            subSection: "Expression of Ideas",
            topic: "Transitions",
            questionText: `${q.passage}\n\n${q.question}`,
            options,
            correctAnswer: q.answer,
            explanation: q.explanation,
            difficulty: getQuestionDifficulty("Transitions", undefined, transitionsIndex++),
          });
        });
      }
      
      // Inferences from inference.json
      const inferenceInfoAndIdeas = inferenceData?.["English Reading & Writing"]?.["Information and Ideas"];
      if (inferenceInfoAndIdeas) {
        (inferenceInfoAndIdeas["Inferences"] || []).forEach((q: CentralIdeaQuestion) => {
          const options = parseNewFormatOptions(q.options);
          
          questions.push({
            id: globalId++,
            section: "English",
            subSection: "Information and Ideas",
            topic: "Inferences",
            questionText: `${q.passage}\n\n${q.question}`,
            options,
            correctAnswer: q.answer,
            explanation: q.explanation,
            difficulty: getQuestionDifficulty("Inferences", undefined, inferencesIndex++),
          });
        });
      }
    }
    
    // ==================== NEW JSON FILES ====================
    
    // Process Cross-Text Connections (new format)
    if (crossTextData?.questions) {
      crossTextData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const passage = q.content.passage_1 && q.content.passage_2 
          ? `Text 1:\n${q.content.passage_1}\n\nText 2:\n${q.content.passage_2}`
          : q.content.passage || '';
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Cross-Text Connections",
          questionText: `${passage}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Cross-Text Connections", undefined, index),
        });
      });
    }
    
    // Process Main Purpose (new format with subtopic)
    if (mainPurposeData?.questions) {
      mainPurposeData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Text Structure and Purpose",
          subTopic: "Main Purpose",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Main Purpose", index),
        });
      });
    }
    
    // Process Overall Structure (new format with subtopic)
    if (overallStructureData?.questions) {
      overallStructureData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Text Structure and Purpose",
          subTopic: "Overall Structure",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Overall Structure", index),
        });
      });
    }
    
    // Process Underlined Purpose (new format with subtopic)
    // Handle array format (starts with [)
    const underlinedQuestions = Array.isArray(underlinedPurposeData) 
      ? underlinedPurposeData[0]?.questions || []
      : underlinedPurposeData?.questions || [];
    
    underlinedQuestions.forEach((q: NewFormatQuestion, index: number) => {
      const options = parseNewFormatOptions(q.content.options);
      
      questions.push({
        id: globalId++,
        section: "English",
        subSection: "Craft and Structure",
        topic: "Text Structure and Purpose",
        subTopic: "Underlined Purpose",
        questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
        options,
        correctAnswer: q.solution.answer,
        explanation: q.solution.explanation,
        difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Underlined Purpose", index),
      });
    });
    
    // Process Gap Fillings (new format with subtopic)
    if (gapFillingsData?.questions) {
      gapFillingsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Words in Context",
          subTopic: "Gap Fillings",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Words in Context", "Gap Fillings", index),
        });
      });
    }
    
    // Process Synonyms (new format with subtopic)
    if (synonymsData?.questions) {
      synonymsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Craft and Structure",
          topic: "Words in Context",
          subTopic: "Synonyms",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Words in Context", "Synonyms", index),
        });
      });
    }
    
    // Process Support (new format with subtopic)
    if (supportData?.questions) {
      supportData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Command of Evidence",
          subTopic: "Support",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Support", index),
        });
      });
    }
    
    // Process Weaken (new format with subtopic)
    if (weakenData?.questions) {
      weakenData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Command of Evidence",
          subTopic: "Weaken",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Weaken", index),
        });
      });
    }
    
    // Process Main Ideas (new format with subtopic)
    if (mainIdeasData?.questions) {
      mainIdeasData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Central Ideas and Details",
          subTopic: "Main Ideas",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Central Ideas and Details", "Main Ideas", index),
        });
      });
    }
    
    // Process Detailed Questions (new format with subtopic)
    if (detailedQuestionsData?.questions) {
      detailedQuestionsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Central Ideas and Details",
          subTopic: "Detail Questions",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Central Ideas and Details", "Detail Questions", index),
        });
      });
    }
    
    // Process Quotation (new format with subtopic)
    if (quotationData?.questions) {
      quotationData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Command of Evidence",
          subTopic: "Quotation",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Quotation", index),
        });
      });
    }
    
    // Process Graphs (new format with subtopic)
    if (graphsData?.questions) {
      graphsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        
        questions.push({
          id: globalId++,
          section: "English",
          subSection: "Information and Ideas",
          topic: "Command of Evidence",
          subTopic: "Graphs",
          questionText: `${q.content.passage || ''}\n\n${q.content.question}`,
          options,
          correctAnswer: q.solution.answer,
          explanation: q.solution.explanation,
          difficulty: (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Graphs", index),
        });
      });
    }
    
  } catch (error) {
    console.error('Error loading questions:', error);
  }
  
  console.log('Total questions loaded:', questions.length);
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
