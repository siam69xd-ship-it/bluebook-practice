/**
 * Script to convert nested JSON format to standardized flat format
 * Run with: node scripts/convert-nested-to-flat.js
 * 
 * This script converts:
 * - boundaries.json (250 questions)
 * - transitions.json (202 questions)  
 * - inference.json (149 questions)
 * 
 * From nested format:
 * {
 *   "English Reading & Writing": {
 *     "Standard English Conventions": {
 *       "Boundaries": [{ id, question, answer, explanation }, ...]
 *     }
 *   }
 * }
 * 
 * To flat format:
 * {
 *   "test_metadata": { subject, category, skill },
 *   "questions": [{ id, difficulty, content: { question, options }, solution: { answer, explanation } }, ...]
 * }
 */

const fs = require('fs');
const path = require('path');

// Parse question text to extract options
function parseQuestionOptions(rawQuestion) {
  const options = [];
  
  // Match option patterns like A)..., B)..., C)..., D)...
  const optionPatterns = rawQuestion.match(/([A-D])\)([^A-D\)]+?)(?=[A-D]\)|$)/g);
  
  if (optionPatterns) {
    optionPatterns.forEach(match => {
      const cleaned = match.trim();
      if (cleaned) {
        options.push(cleaned);
      }
    });
  }
  
  return options;
}

// Get question text without options
function getQuestionWithoutOptions(rawQuestion) {
  // Find where options start
  const optionStart = rawQuestion.search(/\n[A-D]\)/);
  if (optionStart !== -1) {
    return rawQuestion.substring(0, optionStart).trim();
  }
  return rawQuestion;
}

// Assign difficulty based on index (simple heuristic)
function assignDifficulty(index, total) {
  const ratio = index / total;
  if (ratio < 0.33) return 'Easy';
  if (ratio < 0.66) return 'Medium';
  return 'Hard';
}

// Convert boundaries.json
function convertBoundaries() {
  const inputPath = path.join(__dirname, '../public/data/boundaries.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const questions = data["English Reading & Writing"]["Standard English Conventions"]["Boundaries"];
  const total = questions.length;
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Standard English Conventions",
      skill: "Boundaries"
    },
    questions: questions.map((q, index) => ({
      id: `BND_${String(index + 1).padStart(3, '0')}`,
      difficulty: assignDifficulty(index, total),
      content: {
        question: q.question,
        options: parseQuestionOptions(q.question)
      },
      solution: {
        answer: q.answer,
        explanation: q.explanation
      }
    }))
  };
  
  fs.writeFileSync(inputPath, JSON.stringify(converted, null, 2));
  console.log(`Converted boundaries.json: ${converted.questions.length} questions`);
}

// Convert transitions.json
function convertTransitions() {
  const inputPath = path.join(__dirname, '../public/data/transitions.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const questions = data["English Reading & Writing"]["Expression of Ideas"]["Transitions"];
  const total = questions.length;
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Expression of Ideas",
      skill: "Transitions"
    },
    questions: questions.map((q, index) => ({
      id: `TRN_${String(index + 1).padStart(3, '0')}`,
      difficulty: assignDifficulty(index, total),
      content: {
        passage: q.passage || '',
        question: q.question,
        options: q.options || []
      },
      solution: {
        answer: q.answer,
        explanation: q.explanation
      }
    }))
  };
  
  fs.writeFileSync(inputPath, JSON.stringify(converted, null, 2));
  console.log(`Converted transitions.json: ${converted.questions.length} questions`);
}

// Convert inference.json
function convertInference() {
  const inputPath = path.join(__dirname, '../public/data/inference.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const questions = data["English Reading & Writing"]["Information and Ideas"]["Inferences"];
  const total = questions.length;
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Information and Ideas",
      skill: "Inferences"
    },
    questions: questions.map((q, index) => ({
      id: `INF_${String(index + 1).padStart(3, '0')}`,
      difficulty: assignDifficulty(index, total),
      content: {
        passage: q.passage || '',
        question: q.question,
        options: q.options || []
      },
      solution: {
        answer: q.answer,
        explanation: q.explanation
      }
    }))
  };
  
  fs.writeFileSync(inputPath, JSON.stringify(converted, null, 2));
  console.log(`Converted inference.json: ${converted.questions.length} questions`);
}

// Run conversions
try {
  convertBoundaries();
  convertTransitions();
  convertInference();
  console.log('All conversions complete!');
} catch (error) {
  console.error('Conversion failed:', error);
}
