import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, FilterOption, getAllQuestionsAsync, clearQuestionCache } from '@/lib/questionUtils';
import { Difficulty } from '@/lib/difficultyData';

const FILTER_STRUCTURE = {
  'English Reading & Writing': {
    'Craft and Structure': {
      'Cross-Text Connections': null,
      'Text Structure and Purpose': {
        'Main Purpose': null,
        'Overall Structure': null,
        'Underlined Purpose': null,
      },
      'Words in Context': {
        'Gap Fillings': null,
        'Synonyms': null,
      },
    },
    'Expression of Ideas': {
      'Rhetorical Synthesis': null,
      'Transitions': null,
    },
    'Information and Ideas': {
      'Central Ideas and Details': {
        'Main Ideas': null,
        'Detail Questions': null,
      },
      'Command of Evidence': {
        'Support': null,
        'Weaken': null,
        'Quotation': null,
        'Graphs': null,
      },
      'Inferences': null,
    },
    'Standard English Conventions': {
      'Boundaries': null,
      'Form, Structure, and Sense': {
        'Subject-Verb Agreement': null,
        'Verb Tenses': null,
        'Verb Forms': null,
        'Pronouns': null,
        'Modifiers': null,
        'Parallel Structure': null,
        'Miscellaneous Topics': null,
      },
    },
  },
  'Math': {
    'Algebra': {
      'Expressions': null,
      'Linear Equations': null,
      'Linear System of Equations': null,
      'Linear Functions': null,
      'Linear Inequalities': null,
    },
    'Advanced Math': {
      'Polynomials': null,
      'Exponents & Radicals': null,
      'Functions & Function Notation': null,
      'Exponential Functions': null,
      'Quadratics': null,
    },
    'Problem Solving': {
      'Percent; Ratio & Proportion': null,
      'Unit Conversion': null,
      'Probability': null,
      'Mean/Median/Mode/Range': null,
      'Scatterplots': null,
      'Research Organizing': null,
    },
    'Geometry and Trigonometry': {
      'Lines & Angles': null,
      'Triangles': null,
      'Trigonometry': null,
      'Circles': null,
      'Areas & Volumes': null,
    },
  },
};

type DifficultyFilter = {
  easy: boolean;
  medium: boolean;
  hard: boolean;
};

export default function Practice() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'English Reading & Writing',
    'Craft and Structure',
    'Words in Context',
    'Text Structure and Purpose',
    'Expression of Ideas',
    'Information and Ideas',
    'Central Ideas and Details',
    'Command of Evidence',
    'Standard English Conventions',
    'Form, Structure, and Sense',
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyFilter>({
    easy: true,
    medium: true,
    hard: true,
  });

  useEffect(() => {
    clearQuestionCache();
    getAllQuestionsAsync()
      .then(q => {
        setQuestions(q);
        setIsLoading(false);
      })
      .catch(() => {
        setQuestions([]);
        setIsLoading(false);
      });
  }, []);

  const filteredQuestions = useMemo(() => {
    const activeDifficulties = Object.entries(selectedDifficulties)
      .filter(([_, selected]) => selected)
      .map(([diff]) => diff as Difficulty);
    
    if (activeDifficulties.length === 0) return [];
    if (activeDifficulties.length === 3) return questions;
    
    return questions.filter(q => 
      q.difficulty && activeDifficulties.includes(q.difficulty)
    );
  }, [questions, selectedDifficulties]);

  const getDifficultyCounts = useMemo(() => {
    return {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    };
  }, [questions]);

  const getCount = (subSection?: string, topic?: string, subTopic?: string): number => {
    return filteredQuestions.filter((q) => {
      if (subSection && q.subSection !== subSection) return false;
      if (topic && q.topic !== topic) return false;
      if (subTopic && q.subTopic !== subTopic) return false;
      return true;
    }).length;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleDifficulty = (difficulty: keyof DifficultyFilter) => {
    setSelectedDifficulties(prev => ({
      ...prev,
      [difficulty]: !prev[difficulty],
    }));
  };

  const startPractice = (filter: Partial<FilterOption>) => {
    const practiceConfig = {
      filter,
      difficulties: selectedDifficulties,
    };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    navigate('/quiz');
  };

  const DifficultyToggle = ({ difficulty, label }: { difficulty: keyof DifficultyFilter; label: string }) => {
    const isSelected = selectedDifficulties[difficulty];
    const count = getDifficultyCounts[difficulty];

    return (
      <button
        onClick={() => toggleDifficulty(difficulty)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border transition-colors text-sm',
          isSelected
            ? 'border-black bg-black text-white'
            : 'border-[#ddd] bg-white text-[#555] hover:border-[#999]'
        )}
      >
        {isSelected && <Check className="w-3 h-3" />}
        <span>{label}</span>
        <span className={cn('text-xs', isSelected ? 'text-white/70' : 'text-[#999]')}>({count})</span>
      </button>
    );
  };

  const renderTopicItem = (
    label: string,
    count: number,
    onClick: () => void,
    depth: number = 0
  ) => {
    const disabled = count === 0;

    return (
      <button
        onClick={disabled ? undefined : onClick}
        style={{ paddingLeft: `${(depth + 1) * 20}px` }}
        className={cn(
          "w-full flex items-center justify-between pr-4 py-2.5 transition-colors group text-left",
          disabled 
            ? "opacity-40 cursor-not-allowed" 
            : "hover:bg-[#f5f5f5]"
        )}
        disabled={disabled}
      >
        <span className="text-[15px] text-[#222]">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#888]">{count}</span>
          {!disabled && (
            <ArrowRight className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </button>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string, mainSection: string) => {
    return Object.keys(subTopics).map(subTopic => {
      const count = getCount(subSection, parentTopic, subTopic);
      return (
        <div key={subTopic}>
          {renderTopicItem(
            subTopic,
            count,
            () => startPractice({
              section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
              subSection,
              topic: parentTopic,
              subTopic,
            }),
            2
          )}
        </div>
      );
    });
  };

  const renderTopics = (subSection: string, topics: Record<string, any>, mainSection: string) => {
    return Object.entries(topics).map(([topic, subTopics]) => {
      const count = getCount(subSection, topic);
      const hasSubTopics = subTopics !== null && typeof subTopics === 'object';

      if (hasSubTopics) {
        return (
          <div key={topic}>
            <button
              onClick={() => toggleSection(topic)}
              className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[#f5f5f5] transition-colors"
            >
              <span className="text-[15px] text-[#222]">{topic}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#888]">{count}</span>
                {expandedSections.includes(topic) ? (
                  <ChevronDown className="w-4 h-4 text-[#888]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#888]" />
                )}
              </div>
            </button>

            {expandedSections.includes(topic) && (
              <div className="border-l border-[#eee] ml-5">
                {renderSubTopics(topic, subTopics, subSection, mainSection)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={topic}>
          {renderTopicItem(
            topic,
            count,
            () => startPractice({
              section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
              subSection,
              topic,
            }),
            1
          )}
        </div>
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>, mainSection: string) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <div key={subSection} className="border-b border-[#eee] last:border-b-0">
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors"
          >
            <span className="text-[15px] font-medium text-black">{subSection}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#555]">{count} questions</span>
              {expandedSections.includes(subSection) ? (
                <ChevronDown className="w-4 h-4 text-[#888]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#888]" />
              )}
            </div>
          </button>

          {expandedSections.includes(subSection) && hasTopics && (
            <div className="border-l border-[#eee] ml-4 mb-2">
              {renderTopics(subSection, topics, mainSection)}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#222]">Loading questions...</p>
          <p className="text-sm text-[#555] mt-1">Preparing your practice session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#ddd]">
        <div className="max-w-[960px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-[#555] hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="font-academic text-xl text-black tracking-tight">Nextprep</span>
            <div className="w-[60px]" />
          </div>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.12em] text-[#555] mb-3">
            Practice Selection
          </p>
          <h1 className="font-academic text-[32px] md:text-[38px] font-medium text-black leading-tight mb-4">
            Choose Your Focus
          </h1>
          <p className="text-base text-[#222] max-w-[600px]">
            Select difficulty level and topic to begin a focused practice session.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-10">
          <p className="text-sm text-[#555] mb-4">Filter by Difficulty</p>
          <div className="flex flex-wrap gap-3">
            <DifficultyToggle difficulty="easy" label="Easy" />
            <DifficultyToggle difficulty="medium" label="Medium" />
            <DifficultyToggle difficulty="hard" label="Hard" />
          </div>
        </div>

        <hr className="border-t border-[#ddd] mb-10" />

        {/* Practice All */}
        <button
          onClick={() => startPractice({})}
          className="w-full flex items-center justify-between px-5 py-4 border border-black hover:bg-black hover:text-white transition-colors group mb-10"
        >
          <div className="text-left">
            <span className="text-base font-medium">Practice All Questions</span>
            <p className="text-sm text-[#555] group-hover:text-white/70 mt-0.5">
              {filteredQuestions.length} questions available
            </p>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Topics */}
        <div className="mb-6">
          <h2 className="font-academic text-xl font-normal text-black mb-2">Topics</h2>
          <hr className="border-t border-black w-12 mb-6" />
        </div>

        {Object.entries(FILTER_STRUCTURE).map(([section, subSections]) => (
          <div key={section} className="mb-8">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between py-3 border-b border-[#ddd] mb-2"
            >
              <span className="text-xs uppercase tracking-[0.1em] font-medium text-[#555]">
                {section}
              </span>
              {expandedSections.includes(section) ? (
                <ChevronDown className="w-4 h-4 text-[#888]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#888]" />
              )}
            </button>

            {/* SubSections */}
            {expandedSections.includes(section) && (
              <div className="border border-[#eee]">
                {renderSubSections(subSections, section)}
              </div>
            )}
          </div>
        ))}

        <div className="h-20" />
      </main>

      {/* Footer */}
      <footer className="bg-[#fafafa] border-t border-[#ddd]">
        <div className="max-w-[960px] mx-auto px-6 py-8 text-center">
          <p className="text-[13px] text-[#555]">
            © 2026 — Independent Academic SAT Preparation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
