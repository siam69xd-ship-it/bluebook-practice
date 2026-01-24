#!/usr/bin/env node
/**
 * Converts nested JSON format to standardized flat format
 * 
 * Usage: node scripts/convert-json-format.js
 * 
 * This script converts:
 * - boundaries.json (250 questions) 
 * - transitions.json (202 questions)
 * - inference.json (149 questions)
 * 
 * From nested format to flat standardized format with test_metadata + questions array
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');

// Assign difficulty based on index position (thirds distribution)
function getDifficulty(index, total) {
  const ratio = index / total;
  if (ratio < 0.33) return 'Easy';
  if (ratio < 0.66) return 'Medium';
  return 'Hard';
}

// Parse options from Boundaries question text (format: A)text\nB)text...)
function parseBoundaryOptions(questionText) {
  const options = [];
  // Match options like A)text, B)text, etc.
  const optionPattern = /([A-D])\)([^\n]+)/g;
  let match;
  while ((match = optionPattern.exec(questionText)) !== null) {
    options.push(`${match[1]}) ${match[2].trim()}`);
  }
  return options;
}

// Convert boundaries.json
function convertBoundaries() {
  const filePath = path.join(dataDir, 'boundaries.json');
  console.log(`Reading ${filePath}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Check if already converted
  if (data.test_metadata && data.questions) {
    console.log('  ⏭️  boundaries.json is already in flat format, skipping...');
    return data.questions.length;
  }
  
  const questions = data["English Reading & Writing"]?.["Standard English Conventions"]?.["Boundaries"] || [];
  
  if (questions.length === 0) {
    console.log('  ⚠️  No questions found in boundaries.json');
    return 0;
  }
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Standard English Conventions",
      skill: "Boundaries"
    },
    questions: questions.map((q, i) => ({
      id: `BND_${String(i + 1).padStart(3, '0')}`,
      difficulty: getDifficulty(i, questions.length),
      content: {
        question: q.question,
        options: parseBoundaryOptions(q.question)
      },
      solution: {
        answer: q.answer,
        explanation: q.explanation
      }
    }))
  };
  
  fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
  console.log(`  ✅ Converted boundaries.json: ${converted.questions.length} questions`);
  return converted.questions.length;
}

// Convert transitions.json  
function convertTransitions() {
  const filePath = path.join(dataDir, 'transitions.json');
  console.log(`Reading ${filePath}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Check if already converted
  if (data.test_metadata && data.questions) {
    console.log('  ⏭️  transitions.json is already in flat format, skipping...');
    return data.questions.length;
  }
  
  const questions = data["English Reading & Writing"]?.["Expression of Ideas"]?.["Transitions"] || [];
  
  if (questions.length === 0) {
    console.log('  ⚠️  No questions found in transitions.json');
    return 0;
  }
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Expression of Ideas",
      skill: "Transitions"
    },
    questions: questions.map((q, i) => ({
      id: `TRN_${String(i + 1).padStart(3, '0')}`,
      difficulty: getDifficulty(i, questions.length),
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
  
  fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
  console.log(`  ✅ Converted transitions.json: ${converted.questions.length} questions`);
  return converted.questions.length;
}

// Convert inference.json
function convertInference() {
  const filePath = path.join(dataDir, 'inference.json');
  console.log(`Reading ${filePath}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Check if already converted
  if (data.test_metadata && data.questions) {
    console.log('  ⏭️  inference.json is already in flat format, skipping...');
    return data.questions.length;
  }
  
  const questions = data["English Reading & Writing"]?.["Information and Ideas"]?.["Inferences"] || [];
  
  if (questions.length === 0) {
    console.log('  ⚠️  No questions found in inference.json');
    return 0;
  }
  
  const converted = {
    test_metadata: {
      subject: "English Reading & Writing",
      category: "Information and Ideas",
      skill: "Inferences"
    },
    questions: questions.map((q, i) => ({
      id: `INF_${String(i + 1).padStart(3, '0')}`,
      difficulty: getDifficulty(i, questions.length),
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
  
  fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
  console.log(`  ✅ Converted inference.json: ${converted.questions.length} questions`);
  return converted.questions.length;
}

// Run all conversions
console.log('\n🔄 Converting JSON files to standardized flat format...\n');

try {
  const boundariesCount = convertBoundaries();
  const transitionsCount = convertTransitions();
  const inferenceCount = convertInference();
  
  const total = boundariesCount + transitionsCount + inferenceCount;
  console.log(`\n✅ Conversion complete! Total: ${total} questions`);
  console.log(`   - Boundaries: ${boundariesCount}`);
  console.log(`   - Transitions: ${transitionsCount}`);
  console.log(`   - Inferences: ${inferenceCount}\n`);
} catch (error) {
  console.error('\n❌ Conversion failed:', error.message);
  process.exit(1);
}
