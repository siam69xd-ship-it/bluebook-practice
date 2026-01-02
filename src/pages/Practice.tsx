import { useState } from 'react';
import { getMathQuestions } from '@/lib/mathQuestionUtils';
// ... other imports

export default function Practice() {
  const [loading, setLoading] = useState(false); // Add loading state
  const [questions, setQuestions] = useState([]);

  const handleStart = async (topicId: string) => {
    setLoading(true); // Start loading
    try {
      // await the async function
      const data = await getMathQuestions(topicId);
      setQuestions(data);
      // Navigate to question view or set mode to 'started'
    } catch (error) {
      console.error("Failed to start:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg font-medium text-slate-600">Loading Questions...</span>
      </div>
    );
  }

  // ... rest of your component (PracticeSelector, etc.)
}
