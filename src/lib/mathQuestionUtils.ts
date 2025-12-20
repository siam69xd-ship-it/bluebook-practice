export interface MathQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  isGridIn: boolean;
}

interface RawMathQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface MathDataFile {
  dataset_info: {
    title: string;
    total_questions: number;
  };
  questions: RawMathQuestion[];
}

// Topic mapping from file names to taxonomy topics
const TOPIC_MAPPING: Record<string, string> = {
  'expressions': 'Expressions',
  'linear_equations': 'Linear Equations',
  'linear_equations_system': 'Linear System of Equations',
  'linear_functions': 'Linear Functions',
  'linear_inequalities': 'Linear Inequalities',
  'polynomials': 'Polynomials',
  'exponents_radicals': 'Exponents & Radicals',
  'functions_function_notation': 'Functions & Function Notation',
};

const MATH_DATA_FILES = [
  { file: 'expressions.json', topic: 'Expressions' },
  { file: 'linear_equations.json', topic: 'Linear Equations' },
  { file: 'linear_equations_system.json', topic: 'Linear System of Equations' },
  { file: 'linear_functions.json', topic: 'Linear Functions' },
  { file: 'linear_inequalities.json', topic: 'Linear Inequalities' },
  { file: 'polynomials.json', topic: 'Polynomials' },
  { file: 'exponents_radicals.json', topic: 'Exponents & Radicals' },
  { file: 'functions_function_notation.json', topic: 'Functions & Function Notation' },
  { file: 'exponential_functions.json', topic: 'Exponential Functions' },
  { file: 'quadratics.json', topic: 'Quadratics' },
  { file: 'mean_median_mode_range.json', topic: 'Mean/Median/Mode/Range' },
  { file: 'research_organizing.json', topic: 'Research Organizing' },
  { file: 'percent_ratio_proportion.json', topic: 'Percent; Ratio & Proportion' },
  { file: 'probability.json', topic: 'Probability' },
  { file: 'unit_conversion.json', topic: 'Unit Conversion' },
  { file: 'scatterplots.json', topic: 'Scatterplots' },
  { file: 'lines_angles.json', topic: 'Lines & Angles' },
  { file: 'triangles.json', topic: 'Triangles' },
  { file: 'trigonometry.json', topic: 'Trigonometry' },
  { file: 'circles.json', topic: 'Circles' },
  { file: 'areas_volumes.json', topic: 'Areas & Volumes' },
];

export async function loadAllMathQuestions(): Promise<MathQuestion[]> {
  const allQuestions: MathQuestion[] = [];
  
  for (const { file, topic } of MATH_DATA_FILES) {
    try {
      const response = await fetch(`/data/math/${file}`);
      if (response.ok) {
        const data: MathDataFile = await response.json();
        const questionsWithTopic = data.questions.map((q, index) => {
          // Check if it's a grid-in question
          const isGridIn = q.options.length === 0 || 
            (q.options.length === 1 && q.options[0].toLowerCase().includes('grid-in'));
          return {
            ...q,
            id: allQuestions.length + index + 1,
            topic,
            isGridIn,
            options: isGridIn ? [] : q.options,
          };
        });
        allQuestions.push(...questionsWithTopic);
      }
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
    }
  }
  
  return allQuestions;
}

export function filterMathQuestions(
  questions: MathQuestion[],
  filter: { section?: string; topic?: string }
): MathQuestion[] {
  if (!filter.section && !filter.topic) {
    return questions;
  }
  
  if (filter.topic) {
    return questions.filter(q => q.topic === filter.topic);
  }
  
  // Filter by section
  const MATH_TAXONOMY: Record<string, string[]> = {
    'Algebra': [
      'Algebra Formulas',
      'Expressions',
      'Linear Equations',
      'Linear System of Equations',
      'Linear Functions',
      'Linear Inequalities'
    ],
    'Advanced Math': [
      'Advanced Math Formulas',
      'Polynomials',
      'Exponents & Radicals',
      'Functions & Function Notation',
      'Exponential Functions',
      'Quadratics'
    ],
    'Problem Solving': [
      'Problem Solving Formulas',
      'Percent; Ratio & Proportion',
      'Unit Conversion',
      'Probability',
      'Mean/Median/Mode/Range',
      'Scatterplots',
      'Research Organizing'
    ],
    'Geometry and Trigonometry': [
      'Geometry & Trigonometry Formulas',
      'Lines & Angles',
      'Triangles',
      'Trigonometry',
      'Circles',
      'Areas & Volumes'
    ]
  };
  
  const topics = MATH_TAXONOMY[filter.section!] || [];
  return questions.filter(q => topics.includes(q.topic));
}

export function parseOptionLabel(option: string): { label: string; text: string } {
  const match = option.match(/^([A-D])\)\s*(.*)$/);
  if (match) {
    return { label: match[1], text: match[2] };
  }
  return { label: '', text: option };
}
