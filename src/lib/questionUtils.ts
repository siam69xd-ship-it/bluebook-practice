import { Difficulty, getQuestionDifficulty } from './difficultyData';

export interface Question {
  id: number;
  sourceId: string; // Original ID from JSON (e.g., GAP_001, UP_001, GRA_001)
  section: string; // "English" or "Math"
  subSection: string;
  topic: string;
  subTopic?: string;
  passage: string; // Passage text only
  questionPrompt: string; // Question text only
  questionText: string; // Combined for backward compatibility
  options: { [key: string]: string };
  correctAnswer: string;
  explanation: string;
  difficulty?: Difficulty;
  isGridIn?: boolean; // For math grid-in questions
  hasLatex?: boolean; // For math questions with LaTeX
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
function splitTopLevelJsonValues(raw: string): string[] {
  const values: string[] = [];
  const s = raw.trim();

  let inString = false;
  let escape = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (start === -1) {
      // look for start of next JSON value
      if (ch === '{' || ch === '[') {
        start = i;
        depth = 1;
      }
      continue;
    }

    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') depth--;

    if (depth === 0 && start !== -1) {
      values.push(s.slice(start, i + 1));
      start = -1;
    }
  }

  return values;
}

// Clean malformed JSON by fixing common issues before parsing
function cleanMalformedJson(raw: string): string {
  let cleaned = raw.trim();
  
  // Fix }{ -> },{  (concatenated objects without comma)
  cleaned = cleaned.replace(/\}\s*\{/g, '},{');
  
  // Fix ][ -> ],[  (concatenated arrays without comma)
  cleaned = cleaned.replace(/\]\s*\[/g, '],[');
  
  // Fix ]{ -> ],{  (array followed by object)
  cleaned = cleaned.replace(/\]\s*\{/g, '],{');
  
  // Fix trailing garbage like }    }   ] after a proper object
  // Remove duplicate closing braces/brackets that break parsing
  cleaned = cleaned.replace(/\}\s*\}\s*\]/g, '}]');
  cleaned = cleaned.replace(/\}\s*\}\s*\{/g, '},{');
  
  // Remove trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*\]/g, ']');
  cleaned = cleaned.replace(/,\s*\}/g, '}');
  
  // Fix unescaped backslashes that aren't LaTeX commands
  // Keep common LaTeX sequences: \frac, \sqrt, \implies, \le, \ge, \times, \div, etc.
  // cleaned = cleaned.replace(/\\(?![frac|sqrt|implies|le|ge|times|div|ne|pm|mp|approx|cdot|ldots|Rightarrow|rightarrow|Leftarrow|leftarrow|infty|pi|alpha|beta|gamma|theta|lambda|mu|sigma|delta|epsilon|phi|omega|neq|leq|geq|n"])/g, '\\\\');
  
  return cleaned;
}

// Extract math questions from raw JSON using regex (simpler format than new format)
function extractMathQuestionsFromRaw(raw: string): any[] {
  const questions: any[] = [];
  
  // Match simpler math question format: {"id": X, "question": "...", "options": [...], "answer": "...", "explanation": "..."}
  const questionBlocks = raw.split(/\{\s*"id"\s*:\s*\d+/).slice(1); // Split at each question start
  
  for (let i = 0; i < questionBlocks.length; i++) {
    const block = '{"id": ' + (i + 1) + questionBlocks[i];
    try {
      // Find the end of this question object
      let depth = 0;
      let endIndex = -1;
      for (let j = 0; j < block.length; j++) {
        if (block[j] === '{') depth++;
        if (block[j] === '}') depth--;
        if (depth === 0 && j > 0) {
          endIndex = j + 1;
          break;
        }
      }
      
      if (endIndex > 0) {
        const questionStr = block.slice(0, endIndex);
        try {
          const q = JSON.parse(questionStr);
          if (q.id && q.question) {
            questions.push(q);
          }
        } catch {
          // Try to extract fields manually
          const idMatch = questionStr.match(/"id"\s*:\s*(\d+)/);
          const questionMatch = questionStr.match(/"question"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const answerMatch = questionStr.match(/"answer"\s*:\s*"([^"]+)"/);
          const explanationMatch = questionStr.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const optionsMatch = questionStr.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
          
          if (idMatch && questionMatch && answerMatch) {
            const options: string[] = [];
            if (optionsMatch) {
              const optStrings = optionsMatch[1].match(/"([^"]+)"/g);
              if (optStrings) {
                optStrings.forEach(s => options.push(s.replace(/^"|"$/g, '')));
              }
            }
            
            questions.push({
              id: parseInt(idMatch[1]),
              question: questionMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
              options: options,
              answer: answerMatch[1],
              explanation: explanationMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''
            });
          }
        }
      }
    } catch {
      // Skip unparseable block
    }
  }
  
  return questions;
}

// Extract all question-like objects from raw JSON text using regex
function extractQuestionsFromRaw(raw: string): any[] {
  const questions: any[] = [];
  
  // Match question objects with id, content, and solution
  const questionPattern = /\{\s*"id"\s*:\s*"([^"]+)"[^}]*"content"\s*:\s*\{[^}]*"passage"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"question"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"options"\s*:\s*\[([\s\S]*?)\][^}]*\}[^}]*"solution"\s*:\s*\{[^}]*"answer"\s*:\s*"([^"]+)"[^}]*"explanation"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[^}]*\}/g;
  
  // Simpler approach: split by question id pattern and reconstruct
  const idMatches = raw.matchAll(/"id"\s*:\s*"([A-Z]+_\d+)"/g);
  const ids = Array.from(idMatches).map(m => m[1]);
  
  if (ids.length > 0) {
    // Split raw text at each question boundary
    for (let i = 0; i < ids.length; i++) {
      const currentId = ids[i];
      const nextId = ids[i + 1];
      
      // Find the start of this question
      const startPattern = new RegExp(`\\{\\s*"id"\\s*:\\s*"${currentId}"`);
      const startMatch = raw.match(startPattern);
      if (!startMatch) continue;
      
      const startIndex = raw.indexOf(startMatch[0]);
      let endIndex: number;
      
      if (nextId) {
        const nextPattern = new RegExp(`\\{\\s*"id"\\s*:\\s*"${nextId}"`);
        const nextMatch = raw.slice(startIndex + 1).match(nextPattern);
        if (nextMatch) {
          endIndex = startIndex + 1 + raw.slice(startIndex + 1).indexOf(nextMatch[0]);
        } else {
          endIndex = raw.length;
        }
      } else {
        endIndex = raw.length;
      }
      
      // Extract the question substring
      let questionStr = raw.slice(startIndex, endIndex).trim();
      
      // Clean up trailing characters
      questionStr = questionStr.replace(/,\s*$/, '').replace(/\}\s*\]\s*\}\s*$/, '}]}');
      
      // Ensure it ends with proper closing
      const openBraces = (questionStr.match(/\{/g) || []).length;
      const closeBraces = (questionStr.match(/\}/g) || []).length;
      
      // Add missing closing braces
      if (openBraces > closeBraces) {
        questionStr += '}'.repeat(openBraces - closeBraces);
      }
      
      try {
        const parsed = JSON.parse(questionStr);
        if (parsed.id && parsed.content && parsed.solution) {
          questions.push(parsed);
        }
      } catch {
        // Try to extract fields manually
        try {
          const idMatch = questionStr.match(/"id"\s*:\s*"([^"]+)"/);
          const passageMatch = questionStr.match(/"passage"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const questionMatch = questionStr.match(/"question"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const answerMatch = questionStr.match(/"answer"\s*:\s*"([^"]+)"/);
          const explanationMatch = questionStr.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          const difficultyMatch = questionStr.match(/"difficulty"\s*:\s*"([^"]+)"/);
          const optionsMatch = questionStr.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
          
          if (idMatch && questionMatch && answerMatch) {
            const options: string[] = [];
            if (optionsMatch) {
              const optionsStr = optionsMatch[1];
              const optionMatches = optionsStr.matchAll(/"([^"]+)"/g);
              for (const opt of optionMatches) {
                options.push(opt[1]);
              }
            }
            
            questions.push({
              id: idMatch[1],
              difficulty: difficultyMatch?.[1] || 'Medium',
              content: {
                passage: passageMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
                question: questionMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                options: options
              },
              solution: {
                answer: answerMatch[1],
                explanation: explanationMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''
              }
            });
          }
        } catch {
          // Skip unparseable question
        }
      }
    }
  }
  
  return questions;
}

async function loadJsonFile(path: string): Promise<any> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
      return null;
    }

    const raw = await response.text();
    
    // First, try direct parse
    try {
      const data = JSON.parse(raw);
      console.log(`Loaded ${path}:`, data ? 'success' : 'empty');
      return data;
    } catch {
      // Try with cleaned JSON
    }
    
    // Clean and retry
    const cleaned = cleanMalformedJson(raw);
    try {
      const data = JSON.parse(cleaned);
      console.warn(`Loaded ${path} after cleaning:`, data ? 'success' : 'empty');
      return data;
    } catch {
      // Continue to chunked recovery
    }

    // Attempt to parse multiple top-level JSON values and merge their question arrays
    const trimmed = raw.trim();
    let chunks = splitTopLevelJsonValues(trimmed);

    // Special-case: files wrapped in a broken array like: [ {..}, [ {..}, ... ] ]
    if (chunks.length === 0 && trimmed.startsWith('[')) {
      const inner = trimmed.slice(1, -1).trim(); // Remove outer [ and ]
      chunks = splitTopLevelJsonValues(inner);
    }

    const parsed: any[] = [];
    for (const c of chunks) {
      try {
        parsed.push(JSON.parse(c));
      } catch {
        // Try cleaning individual chunk
        try {
          const cleanedChunk = cleanMalformedJson(c);
          parsed.push(JSON.parse(cleanedChunk));
        } catch {
          // Skip unparseable chunk
        }
      }
    }

    // Collect all questions from all chunks
    const allQuestions: any[] = [];
    let baseMetadata: any = null;
    
    for (const p of parsed) {
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        if (Array.isArray(p.questions)) {
          allQuestions.push(...p.questions);
          if (!baseMetadata && p.test_metadata) {
            baseMetadata = p.test_metadata;
          }
        }
      } else if (Array.isArray(p)) {
        // It's an array of question objects
        const validQuestions = p.filter((q: any) => q && typeof q === 'object' && q.id && q.content && q.solution);
        allQuestions.push(...validQuestions);
      }
    }

    if (allQuestions.length > 0) {
      const recovered = { test_metadata: baseMetadata, questions: allQuestions };
      console.warn(`Recovered concatenated JSON for ${path}:`, allQuestions.length, 'questions');
      return recovered;
    }
    
    // Last resort: extract questions using regex
    const extractedQuestions = extractQuestionsFromRaw(raw);
    if (extractedQuestions.length > 0) {
      console.warn(`Extracted ${extractedQuestions.length} questions from malformed ${path} using regex`);
      return { questions: extractedQuestions };
    }
    
    // Try extracting math questions (simpler format)
    const mathQuestions = extractMathQuestionsFromRaw(raw);
    if (mathQuestions.length > 0) {
      console.warn(`Extracted ${mathQuestions.length} math questions from ${path} using regex`);
      return { questions: mathQuestions };
    }

    console.error(`Failed to parse ${path} even after recovery`);
    return null;
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

// Helper to create question with all required fields
function createQuestion(
  globalId: number,
  sourceId: string,
  section: string,
  subSection: string,
  topic: string,
  subTopic: string | undefined,
  passage: string,
  questionPrompt: string,
  options: { [key: string]: string },
  correctAnswer: string,
  explanation: string,
  difficulty: Difficulty
): Question {
  return {
    id: globalId,
    sourceId,
    section,
    subSection,
    topic,
    subTopic,
    passage,
    questionPrompt,
    questionText: passage ? `${passage}\n\n${questionPrompt}` : questionPrompt,
    options,
    correctAnswer,
    explanation,
    difficulty,
  };
}

// Extract question prompt from combined text
function extractQuestionPrompt(text: string): string {
  const patterns = [
    /Which choice[^?]+\?/i,
    /Which [^?]+\?/i,
    /What [^?]+\?/i,
    /Based on [^?]+\?/i,
    /According to [^?]+\?/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  if (text.includes('\n\n')) {
    return text.split('\n\n').pop() || text;
  }
  return text;
}

// Get all questions
export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;
  
  const questions: Question[] = [];
  const seenSourceIds = new Set<string>();
  let globalId = 1;
  
  // Helper to add question with deduplication
  const addQuestion = (q: Question) => {
    if (q.sourceId && seenSourceIds.has(q.sourceId)) {
      return; // Skip duplicate
    }
    if (q.sourceId) {
      seenSourceIds.add(q.sourceId);
    }
    questions.push(q);
  };
  
  try {
    // Load all JSON files
    const [
      boundariesData, verbsData, pronounData, modifiersData,
      transitionsData, inferenceData,
      crossTextData, mainPurposeData, overallStructureData, underlinedPurposeData,
      gapFillingsData, synonymsData, supportData, weakenData, quotationData, graphsData,
      mainIdeasData, detailedQuestionsData, rhetoricalSynthesisData
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
      loadJsonFile('/data/rhetorical_synthesis.json'),
    ]);
    
    // Process Boundaries
    const boundariesQuestions = boundariesData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Boundaries"] || [];
    boundariesQuestions.forEach((q: RawQuestion, index: number) => {
      const { questionText, options } = parseQuestion(q.question);
      const prompt = extractQuestionPrompt(questionText);
      const passage = questionText.replace(prompt, '').trim();
      addQuestion(createQuestion(
        globalId++,
        `BND_${String(index + 1).padStart(3, '0')}`,
        "English",
        "Standard English Conventions",
        "Boundaries",
        undefined,
        passage,
        prompt,
        options,
        q.answer,
        q.explanation,
        getQuestionDifficulty("Boundaries", undefined, index),
      ));
    });
    
    // Process Verbs
    const verbsFormStructure = verbsData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (verbsFormStructure) {
      // Subject-Verb Agreement
      (verbsFormStructure["Subject-Verb Agreement"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `SVA_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Subject-Verb Agreement",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Subject-Verb Agreement", index),
        ));
      });
      
      // Verb Tenses
      (verbsFormStructure["Verb Tenses"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `VT_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Verb Tenses",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Verb Tenses", index),
        ));
      });
      
      // Verb Forms
      (verbsFormStructure["Verb Forms"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `VF_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Verb Forms",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Verb Forms", index),
        ));
      });
    }
    
    // Process Pronouns
    const pronounFormStructure = pronounData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (pronounFormStructure) {
      (pronounFormStructure["Pronouns"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `PRO_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Pronouns",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Pronouns", index),
        ));
      });
    }
    
    // Process Modifiers
    const modifiersFormStructure = modifiersData?.["English Reading & Writing"]?.["Standard English Conventions"]?.["Form, Structure, and Sense"];
    if (modifiersFormStructure) {
      // Modifiers
      (modifiersFormStructure["Modifiers"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `MOD_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Modifiers",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Modifiers", index),
        ));
      });
      
      // Parallel Structure
      (modifiersFormStructure["Parallel Structure"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `PS_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Parallel Structure",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Parallel Structure", index),
        ));
      });
      
      // Miscellaneous Topics / Other Topics
      (modifiersFormStructure["Miscellaneous Topics"] || modifiersFormStructure["Other Topics"] || []).forEach((q: RawQuestion, index: number) => {
        const { questionText, options } = parseQuestion(q.question);
        const prompt = extractQuestionPrompt(questionText);
        const passage = questionText.replace(prompt, '').trim();
        addQuestion(createQuestion(
          globalId++,
          `MISC_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Standard English Conventions",
          "Form, Structure, and Sense",
          "Miscellaneous Topics",
          passage,
          prompt,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Form, Structure, and Sense", "Miscellaneous Topics", index),
        ));
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
        addQuestion(createQuestion(
          globalId++,
          `TRN_${String(transitionsIndex + 1).padStart(3, '0')}`,
          "English",
          "Expression of Ideas",
          "Transitions",
          undefined,
          q.passage || '',
          q.question,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Transitions", undefined, transitionsIndex++),
        ));
      });
      
      // Rhetorical Synthesis
      (expressionOfIdeas["Rhetorical Synthesis"] || []).forEach((q: CentralIdeaQuestion) => {
        const options = parseNewFormatOptions(q.options);
        addQuestion(createQuestion(
          globalId++,
          `RS_${String(rhetoricalSynthesisIndex + 1).padStart(3, '0')}`,
          "English",
          "Expression of Ideas",
          "Rhetorical Synthesis",
          undefined,
          q.passage || '',
          q.question,
          options,
          q.answer,
          q.explanation,
          getQuestionDifficulty("Rhetorical Synthesis", undefined, rhetoricalSynthesisIndex++),
        ));
      });
    }
    
    // Process inference.json - contains Transitions and Inferences
    if (inferenceData) {
      // Transitions from inference.json
      const inferenceExpressionOfIdeas = inferenceData?.["English Reading & Writing"]?.["Expression of Ideas"];
      if (inferenceExpressionOfIdeas) {
        (inferenceExpressionOfIdeas["Transitions"] || []).forEach((q: CentralIdeaQuestion) => {
          const options = parseNewFormatOptions(q.options);
          addQuestion(createQuestion(
            globalId++,
            `TRNI_${String(transitionsIndex + 1).padStart(3, '0')}`,
            "English",
            "Expression of Ideas",
            "Transitions",
            undefined,
            q.passage || '',
            q.question,
            options,
            q.answer,
            q.explanation,
            getQuestionDifficulty("Transitions", undefined, transitionsIndex++),
          ));
        });
      }
      
      // Inferences from inference.json
      const inferenceInfoAndIdeas = inferenceData?.["English Reading & Writing"]?.["Information and Ideas"];
      if (inferenceInfoAndIdeas) {
        (inferenceInfoAndIdeas["Inferences"] || []).forEach((q: CentralIdeaQuestion) => {
          const options = parseNewFormatOptions(q.options);
          addQuestion(createQuestion(
            globalId++,
            `INF_${String(inferencesIndex + 1).padStart(3, '0')}`,
            "English",
            "Information and Ideas",
            "Inferences",
            undefined,
            q.passage || '',
            q.question,
            options,
            q.answer,
            q.explanation,
            getQuestionDifficulty("Inferences", undefined, inferencesIndex++),
          ));
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
        addQuestion(createQuestion(
          globalId++,
          q.id || `CTC_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Craft and Structure",
          "Cross-Text Connections",
          undefined,
          passage,
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Cross-Text Connections", undefined, index),
        ));
      });
    }
    
    // Process Main Purpose (new format with subtopic)
    if (mainPurposeData?.questions) {
      mainPurposeData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `MP_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Craft and Structure",
          "Text Structure and Purpose",
          "Main Purpose",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Main Purpose", index),
        ));
      });
    }
    
    // Process Overall Structure (new format with subtopic)
    if (overallStructureData?.questions) {
      overallStructureData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `OS_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Craft and Structure",
          "Text Structure and Purpose",
          "Overall Structure",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Overall Structure", index),
        ));
      });
    }
    
    // Process Underlined Purpose (new format with subtopic)
    // Handle array format (starts with [) - merge ALL chunks, not just first
    let underlinedQuestions: NewFormatQuestion[] = [];
    if (Array.isArray(underlinedPurposeData)) {
      // Merge questions from all array elements
      underlinedQuestions = underlinedPurposeData.flatMap((item: any) => item?.questions || []);
    } else if (underlinedPurposeData?.questions) {
      underlinedQuestions = underlinedPurposeData.questions;
    }
    
    underlinedQuestions.forEach((q: NewFormatQuestion, index: number) => {
      const options = parseNewFormatOptions(q.content.options);
      addQuestion(createQuestion(
        globalId++,
        q.id || `UP_${String(index + 1).padStart(3, '0')}`,
        "English",
        "Craft and Structure",
        "Text Structure and Purpose",
        "Underlined Purpose",
        q.content.passage || '',
        q.content.question,
        options,
        q.solution.answer,
        q.solution.explanation,
        (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Text Structure and Purpose", "Underlined Purpose", index),
      ));
    });
    
    // Process Gap Fillings (new format with subtopic)
    if (gapFillingsData?.questions) {
      gapFillingsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `GAP_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Craft and Structure",
          "Words in Context",
          "Gap Fillings",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Words in Context", "Gap Fillings", index),
        ));
      });
    }
    
    // Process Synonyms (new format with subtopic)
    if (synonymsData?.questions) {
      synonymsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `SYN_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Craft and Structure",
          "Words in Context",
          "Synonyms",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Words in Context", "Synonyms", index),
        ));
      });
    }
    
    // Process Support (new format with subtopic)
    if (supportData?.questions) {
      supportData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `SUP_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Command of Evidence",
          "Support",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Support", index),
        ));
      });
    }
    
    // Process Weaken (new format with subtopic)
    if (weakenData?.questions) {
      weakenData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `WKN_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Command of Evidence",
          "Weaken",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Weaken", index),
        ));
      });
    }
    
    // Process Main Ideas (new format with subtopic)
    if (mainIdeasData?.questions) {
      mainIdeasData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `MI_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Central Ideas and Details",
          "Main Ideas",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Central Ideas and Details", "Main Ideas", index),
        ));
      });
    }
    
    // Process Detailed Questions (new format with subtopic)
    if (detailedQuestionsData?.questions) {
      detailedQuestionsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `DQ_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Central Ideas and Details",
          "Detail Questions",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Central Ideas and Details", "Detail Questions", index),
        ));
      });
    }
    
    // Process Rhetorical Synthesis (new format from rhetorical_synthesis.json)
    if (rhetoricalSynthesisData?.questions) {
      rhetoricalSynthesisData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `RS_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Expression of Ideas",
          "Rhetorical Synthesis",
          undefined,
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Rhetorical Synthesis", undefined, index),
        ));
      });
    }
    
    // Process Quotation (new format with subtopic)
    if (quotationData?.questions) {
      quotationData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `QUO_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Command of Evidence",
          "Quotation",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Quotation", index),
        ));
      });
    }
    
    // Process Graphs (new format with subtopic)
    if (graphsData?.questions) {
      graphsData.questions.forEach((q: NewFormatQuestion, index: number) => {
        const options = parseNewFormatOptions(q.content.options);
        addQuestion(createQuestion(
          globalId++,
          q.id || `GRA_${String(index + 1).padStart(3, '0')}`,
          "English",
          "Information and Ideas",
          "Command of Evidence",
          "Graphs",
          q.content.passage || '',
          q.content.question,
          options,
          q.solution.answer,
          q.solution.explanation,
          (q.difficulty?.toLowerCase() as Difficulty) || getQuestionDifficulty("Command of Evidence", "Graphs", index),
        ));
      });
    }
    
    // ==================== MATH QUESTIONS ====================
    // Load all math JSON files
    const mathFiles = [
      { file: 'expressions.json', topic: 'Expressions', subSection: 'Algebra' },
      { file: 'linear_equations.json', topic: 'Linear Equations', subSection: 'Algebra' },
      { file: 'linear_equations_system.json', topic: 'Linear System of Equations', subSection: 'Algebra' },
      { file: 'linear_functions.json', topic: 'Linear Functions', subSection: 'Algebra' },
      { file: 'linear_inequalities.json', topic: 'Linear Inequalities', subSection: 'Algebra' },
      { file: 'polynomials.json', topic: 'Polynomials', subSection: 'Advanced Math' },
      { file: 'exponents_radicals.json', topic: 'Exponents & Radicals', subSection: 'Advanced Math' },
      { file: 'functions_function_notation.json', topic: 'Functions & Function Notation', subSection: 'Advanced Math' },

      // Problem Solving
      { file: 'percent_ratio_proportion.json', topic: 'Percent; Ratio & Proportion', subSection: 'Problem Solving' },
      { file: 'unit_conversion.json', topic: 'Unit Conversion', subSection: 'Problem Solving' },
      { file: 'probability.json', topic: 'Probability', subSection: 'Problem Solving' },
      { file: 'mean_median_mode_range.json', topic: 'Mean/Median/Mode/Range', subSection: 'Problem Solving' },
      { file: 'research_organizing.json', topic: 'Research Organizing', subSection: 'Problem Solving' },
    ];
    
    for (const { file, topic, subSection } of mathFiles) {
      try {
        // Use loadJsonFile which handles concatenated JSON objects
        const data = await loadJsonFile(`/data/math/${file}`);
        if (data && data.questions && Array.isArray(data.questions)) {
          data.questions.forEach((q: any, index: number) => {
            // Parse options from array format to object format
            const options: { [key: string]: string } = {};
            let isGridIn = true;
            
            if (q.options && Array.isArray(q.options) && q.options.length > 0) {
              // Check if it's a Student Grid-In placeholder
              const isPlaceholderGridIn = q.options.length === 1 && 
                (q.options[0] === 'Student Grid-In' || q.options[0].toLowerCase().includes('grid'));
              
              if (!isPlaceholderGridIn) {
                isGridIn = false;
                q.options.forEach((opt: string) => {
                  const match = opt.match(/^([A-D])\)\s*(.+)$/s);
                  if (match) {
                    options[match[1]] = match[2].trim();
                  }
                });
              }
            }
            
            // Check for LaTeX in question
            const hasLatex = /\$.*?\$|\\frac|\\sqrt|\\times|\\div|\^/.test(q.question || '');
            
            addQuestion({
              id: globalId++,
              sourceId: `MATH_${subSection.toUpperCase().replace(/\s+/g, '_')}_${topic.toUpperCase().replace(/\s+/g, '_')}_${String(index + 1).padStart(3, '0')}`,
              section: 'Math',
              subSection,
              topic,
              subTopic: undefined,
              passage: '', // Math questions typically don't have passages
              questionPrompt: q.question || '',
              questionText: q.question || '',
              options,
              correctAnswer: q.answer || '',
              explanation: q.explanation || '',
              difficulty: 'medium' as Difficulty, // Will be updated later
              isGridIn,
              hasLatex,
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to load math file ${file}:`, error);
      }
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
