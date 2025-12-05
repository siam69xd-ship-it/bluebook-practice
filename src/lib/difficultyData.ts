// Difficulty mapping based on question ID within each topic/subtopic
// Format: { topic: { subtopic?: { easy: number[], medium: number[], hard: number[] } } }

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyMapping {
  [topic: string]: {
    [subtopic: string]: {
      easy: number[];
      medium: number[];
      hard: number[];
    };
  } | {
    easy: number[];
    medium: number[];
    hard: number[];
  };
}

// Subject-Verb Agreement difficulty
const subjectVerbAgreement = {
  easy: [2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 16, 18, 19, 25, 26, 27, 30, 34, 41, 46, 47],
  medium: [1, 8, 12, 14, 15, 17, 20, 21, 23, 28, 29, 31, 32, 33, 35, 36, 37, 38, 39, 40, 43, 44, 45, 48, 49, 51, 52, 53, 54, 55, 57, 58, 59, 60, 61, 62, 63],
  hard: [22, 24, 31, 38, 42, 48, 50, 52, 53, 56, 57, 59, 60, 61, 62, 63],
};

// Verb Tenses difficulty
const verbTenses = {
  easy: [1, 2, 3, 4, 6, 9, 11, 15, 17, 18, 20, 21, 22, 25, 27],
  medium: [5, 7, 8, 10, 12, 14, 16, 19, 23, 24, 26],
  hard: [13],
};

// Verb Forms difficulty
const verbForms = {
  easy: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45],
  medium: [15],
  hard: [25, 38, 39],
};

// Pronouns difficulty
const pronouns = {
  easy: [1, 3, 8, 9, 15, 16, 17, 18, 21, 22, 23, 24, 25, 27, 28, 30, 31, 32, 33, 34, 36, 50],
  medium: [2, 4, 5, 7, 10, 11, 12, 14, 20, 26, 29, 35, 37, 38, 40, 41, 42, 43, 45, 46, 47, 48, 49, 51],
  hard: [6, 13, 19, 39, 44],
};

// Modifiers difficulty
const modifiers = {
  easy: [2, 4, 5, 6, 8, 10, 12, 15, 16],
  medium: [1, 3, 7, 9, 11, 13, 14],
  hard: [],
};

// Parallel Structure difficulty
const parallelStructure = {
  easy: [1, 2, 3, 4, 6, 7, 8, 11, 13, 15, 17, 22],
  medium: [5, 9, 10, 12, 14, 16, 18, 19, 20, 21, 23, 24, 25],
  hard: [],
};

// Miscellaneous Topics difficulty
const miscellaneousTopics = {
  easy: [1, 2, 4, 5, 7, 8, 11],
  medium: [3, 6, 9, 10, 12, 13, 14],
  hard: [],
};

// Boundaries difficulty
const boundaries = {
  easy: [1, 2, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16, 19, 22, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 37, 38, 41, 44, 45, 46, 47, 48, 49, 55, 56, 59, 61, 63, 64, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 80, 82, 83, 84, 85, 87, 88, 89, 91, 92, 93, 95, 96, 97, 98, 99, 100, 101, 102, 103, 106, 107, 110, 111, 113, 114, 116, 118, 119, 120, 121, 123, 124, 125, 127, 128, 131, 132, 135, 137, 138, 139, 140, 145, 147, 148, 150, 152, 155, 156, 157, 159, 162, 163, 165, 169, 170, 171, 172, 173, 174, 175, 176, 178, 181, 182, 183, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194, 195, 199, 200, 201, 204, 205, 206, 207, 211, 213, 214, 215, 216, 217, 218, 219, 221, 222, 224, 225, 226, 229, 230, 231, 232, 233, 235, 236, 237, 238, 239, 242, 243, 246, 247, 248, 249],
  medium: [3, 9, 11, 17, 18, 20, 21, 23, 32, 35, 36, 39, 40, 42, 43, 50, 51, 52, 53, 54, 57, 58, 60, 62, 65, 74, 79, 81, 86, 90, 94, 104, 105, 108, 112, 115, 117, 122, 126, 129, 130, 133, 134, 136, 141, 143, 144, 146, 151, 153, 154, 158, 160, 161, 164, 167, 168, 179, 180, 186, 196, 197, 198, 202, 208, 209, 212, 220, 223, 227, 228, 234, 240, 241, 244, 245, 250],
  hard: [39, 50, 51, 109, 117, 149, 166, 179, 203, 210, 234, 240],
};

// Central Ideas and Details difficulty
const centralIdeasAndDetails = {
  easy: [1, 2, 4, 6, 7, 9, 10, 13, 18, 21, 27, 28, 30, 35, 36, 40, 42, 43, 45, 46, 56, 68, 69, 72, 76],
  medium: [3, 5, 8, 11, 12, 14, 15, 17, 19, 20, 22, 23, 24, 25, 26, 29, 31, 32, 33, 34, 37, 38, 39, 41, 44, 47, 48, 49, 50, 51, 54, 55, 57, 58, 61, 62, 63, 64, 65, 66, 67, 70, 71, 73, 74, 75, 77, 78, 79, 80, 81, 83, 84, 85, 87, 88, 89, 90, 94, 95, 96],
  hard: [16, 37, 52, 53, 59, 60, 73, 82, 86, 91, 92, 93, 97, 98, 99],
};

// Text Structure and Purpose difficulty
const textStructureAndPurpose = {
  easy: [1, 3, 8, 9, 10, 22, 23, 25, 34, 43, 44, 49, 57, 60, 71],
  medium: [2, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 26, 27, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 45, 46, 47, 48, 50, 51, 52, 53, 54, 55, 56, 58, 59, 61, 62, 64, 65, 66, 67, 68, 69, 70, 72, 73, 74, 75, 76, 77, 79, 80],
  hard: [21, 28, 46, 48, 63, 66, 68, 70, 78, 81],
};

// Words in Context difficulty
const wordsInContext = {
  easy: [1, 2, 3, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 36, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 52, 53, 55, 56, 57, 59, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 113, 114, 115, 116, 117, 118, 120, 122, 123, 126, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248],
  medium: [4, 11, 12, 22, 26, 31, 37, 39, 49, 51, 54, 58, 61, 77, 80, 95, 110, 119, 121, 124, 125, 132, 162, 182, 183, 206, 234],
  hard: [],
};

// Transitions difficulty
const transitions = {
  easy: [1, 2, 6, 8, 9, 13, 16, 18, 19, 20, 21, 26, 30, 32, 40, 41, 46, 47, 48, 50, 52, 56, 59, 60, 62, 69, 70, 71, 72, 76, 77, 78, 79, 82, 83, 87, 88, 90, 93, 94, 99, 107, 108, 109, 111, 112, 114, 118, 119, 120, 122, 130, 140, 150, 160],
  medium: [3, 4, 7, 10, 12, 14, 15, 17, 22, 23, 24, 25, 27, 28, 29, 31, 33, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45, 49, 51, 53, 54, 55, 57, 58, 61, 63, 64, 65, 66, 68, 73, 74, 75, 80, 81, 84, 85, 86, 89, 91, 92, 95, 96, 100, 101, 102, 103, 104, 105, 106, 113, 115, 116, 117, 121, 123, 124, 125, 126, 127, 128, 129],
  hard: [5, 11, 67, 97, 110, 131, 132, 133, 134, 135, 136, 137, 138, 139, 141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 152, 153, 154, 155, 156, 157, 158, 159, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202],
};

// Inferences difficulty - categorized based on reasoning complexity
const inferences = {
  easy: [2, 3, 4, 7, 9, 10, 13, 15, 16, 23, 27, 30, 33, 40, 45, 46, 48, 56, 59, 62, 65, 78, 82, 88, 93, 105, 106, 108, 109, 110, 113, 120, 126, 127, 140, 148, 149],
  medium: [1, 5, 8, 12, 14, 17, 19, 20, 22, 24, 25, 28, 29, 31, 32, 34, 38, 41, 44, 47, 49, 52, 53, 57, 58, 60, 61, 63, 66, 67, 69, 71, 73, 75, 77, 79, 83, 84, 85, 89, 90, 91, 92, 94, 95, 96, 97, 99, 100, 102, 104, 107, 111, 112, 114, 115, 117, 119, 121, 129, 130, 132, 134, 135, 136, 137, 139, 141, 142, 147],
  hard: [6, 11, 18, 21, 26, 35, 36, 37, 39, 42, 43, 50, 51, 54, 55, 64, 68, 70, 72, 74, 76, 80, 81, 86, 87, 98, 101, 103, 116, 118, 123, 124, 125, 128, 131, 133, 138, 143, 144, 145, 146],
};

// Cross-Text Connections - default to medium
const crossTextConnections = {
  easy: [],
  medium: Array.from({ length: 100 }, (_, i) => i + 1),
  hard: [],
};

// Command of Evidence - default to medium
const commandOfEvidence = {
  easy: [],
  medium: Array.from({ length: 100 }, (_, i) => i + 1),
  hard: [],
};

// Rhetorical Synthesis - default to medium
const rhetoricalSynthesis = {
  easy: [],
  medium: Array.from({ length: 200 }, (_, i) => i + 1),
  hard: [],
};

// Export all difficulty mappings
export const DIFFICULTY_DATA: { [key: string]: { easy: number[]; medium: number[]; hard: number[] } } = {
  // Form, Structure, and Sense subtopics
  'Subject-Verb Agreement': subjectVerbAgreement,
  'Verb Tenses': verbTenses,
  'Verb Forms': verbForms,
  'Pronouns': pronouns,
  'Modifiers': modifiers,
  'Parallel Structure': parallelStructure,
  'Miscellaneous Topics': miscellaneousTopics,
  
  // Other topics
  'Boundaries': boundaries,
  'Central Ideas and Details': centralIdeasAndDetails,
  'Text Structure and Purpose': textStructureAndPurpose,
  'Words in Context': wordsInContext,
  'Transitions': transitions,
  'Inferences': inferences,
  'Cross-Text Connections': crossTextConnections,
  'Command of Evidence': commandOfEvidence,
  'Rhetorical Synthesis': rhetoricalSynthesis,
};

// Get difficulty for a question based on its topic/subtopic and original ID in that category
export function getQuestionDifficulty(topic: string, subTopic: string | undefined, indexInCategory: number): Difficulty {
  const key = subTopic || topic;
  const difficultyMap = DIFFICULTY_DATA[key];
  
  if (!difficultyMap) {
    return 'medium'; // Default to medium if no mapping found
  }
  
  const questionNum = indexInCategory + 1; // Convert 0-indexed to 1-indexed
  
  if (difficultyMap.hard.includes(questionNum)) return 'hard';
  if (difficultyMap.easy.includes(questionNum)) return 'easy';
  if (difficultyMap.medium.includes(questionNum)) return 'medium';
  
  // Default based on what arrays have content
  if (difficultyMap.medium.length > 0) return 'medium';
  if (difficultyMap.easy.length > 0) return 'easy';
  
  return 'medium';
}
