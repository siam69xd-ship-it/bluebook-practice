// REMOVE top-level imports like:
// import quadratics from '../../public/data/math/quadratics.json'; // DELETE THIS
// import linear from '../../public/data/math/linear_equations.json'; // DELETE THIS

// ADD this helper function to load files dynamically
const loadMathCategory = async (category: string) => {
  try {
    // This assumes your files are in public/data/math/
    // If they are in src/data, use: await import(`../data/math/${category}.json`)
    
    // Using fetch for public folder (Better for performance as it doesn't bundle the JSON)
    const response = await fetch(`/data/math/${category}.json`);
    if (!response.ok) throw new Error(`Failed to load ${category}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading category ${category}:`, error);
    return [];
  }
};

// Update your main getQuestions function to be ASYNC
export const getMathQuestions = async (topicId?: string) => {
  let questions: any[] = [];

  // Only load the specific topic requested, not everything
  if (topicId === 'quadratics') {
    questions = await loadMathCategory('quadratics');
  } else if (topicId === 'linear_equations') {
    questions = await loadMathCategory('linear_equations');
  } else if (topicId === 'geometry') {
    questions = await loadMathCategory('triangles'); // Example mapping
  } else {
    // If no specific topic, load a default set or all (lazily)
    const q1 = await loadMathCategory('quadratics');
    const q2 = await loadMathCategory('linear_equations');
    questions = [...q1, ...q2];
  }

  return questions;
};
