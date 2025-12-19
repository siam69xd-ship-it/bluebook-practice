import { Difficulty, getQuestionDifficulty } from './difficultyData';

export interface Question {
  id: number;
  sourceId: string; // Original ID from JSON (e.g., GAP_001, UP_001, GRA_001)
  section: string;
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
  
  // Fix trailing garbage like }    }   ] after a proper object
  // Remove duplicate closing braces/brackets that break parsing
  cleaned = cleaned.replace(/\}\s*\}\s*\]/g, '}]');
  
  return cleaned;
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
