import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuestionsAsync, Question } from '@/lib/questionUtils';
import { PracticeSelector } from '@/components/PracticeSelector';

export default function Practice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showSelector, setShowSelector] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const data = await getAllQuestionsAsync();
        setQuestions(data);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg font-medium text-slate-600">Loading Questions...</span>
      </div>
    );
  }

  return (
    <PracticeSelector 
      questions={questions} 
      isOpen={showSelector} 
      onClose={() => navigate('/')} 
    />
  );
}
