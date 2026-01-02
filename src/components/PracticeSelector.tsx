import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Play, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, FilterOption } from '@/lib/questionUtils';
import { Difficulty } from '@/lib/difficultyData';

interface PracticeSelectorProps {
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
}

// Filter structure matching the topic hierarchy with subtopics
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
    },
  },
};

type DifficultyFilter = {
  easy: boolean;
  medium: boolean;
  hard: boolean;
};

export function PracticeSelector({ questions, isOpen, onClose }: PracticeSelectorProps) {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'English Reading & Writing',
    'Craft and Structure',
    'Words in Context',
    'Text Structure and Purpose',
    'Information and Ideas',
    'Central Ideas and Details',
    'Command of Evidence',
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyFilter>({
    easy: true,
    medium: true,
    hard: true,
  });

  // Filter questions based on difficulty selection
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

  // Count questions for each category with difficulty filter
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
    // Store difficulty filter and topic filter in sessionStorage
    const practiceConfig = {
      filter,
      difficulties: selectedDifficulties,
    };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    navigate('/quiz');
  };

  const DifficultyBadge = ({ difficulty, count }: { difficulty: keyof DifficultyFilter; count: number }) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-600 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      hard: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    
    const labels = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };

    return (
      <button
        onClick={() => toggleDifficulty(difficulty)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 flex items-center gap-2',
          selectedDifficulties[difficulty]
            ? colors[difficulty]
            : 'bg-muted/50 text-muted-foreground border-transparent opacity-50'
        )}
      >
        {selectedDifficulties[difficulty] && <Check className="w-3 h-3" />}
        {labels[difficulty]}
      </button>
    );
  };

  const renderTopicItem = (
    label: string,
    count: number,
    onClick: () => void,
    isSubTopic: boolean = false
  ) => {
    const disabled = count === 0;

    return (
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group',
          'border border-transparent',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primary/5 hover:border-primary/20',
          isSubTopic ? 'ml-4' : ''
        )}
      >
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{count} questions</span>
          <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
            true
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
          <div key={topic} className="space-y-1">
            <button
              onClick={() => toggleSection(topic)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-xl transition-all duration-200"
            >
              <span className="text-sm font-medium text-foreground">{topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{count} questions</span>
                {expandedSections.includes(topic) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {expandedSections.includes(topic) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pl-2">
                    {renderSubTopics(topic, subTopics, subSection, mainSection)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            })
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
        <div key={subSection} className="space-y-1">
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-xl transition-all duration-200"
          >
            <span className="text-sm font-semibold text-foreground">{subSection}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{count} questions</span>
              {expandedSections.includes(subSection) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedSections.includes(subSection) && hasTopics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pl-2">
                  {renderTopics(subSection, topics, mainSection)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-2xl sm:max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">Select Practice Mode</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose difficulty and topic</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Difficulty Selector */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-3">Filter by Difficulty</p>
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty="easy" count={questions.filter(q => q.difficulty === 'easy').length} />
                <DifficultyBadge difficulty="medium" count={questions.filter(q => q.difficulty === 'medium').length} />
                <DifficultyBadge difficulty="hard" count={questions.filter(q => q.difficulty === 'hard').length} />
              </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Practice All */}
              <button
                onClick={() => startPractice({})}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 mb-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-semibold text-foreground">Practice All Questions</span>
                    <p className="text-xs text-muted-foreground">{filteredQuestions.length} questions available</p>
                  </div>
                </div>
              </button>

              {/* Main Section */}
              {Object.entries(FILTER_STRUCTURE).map(([section, subSections]) => (
                <div key={section} className="space-y-1">
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-xl transition-all duration-200"
                  >
                    <span className="text-sm font-bold text-primary uppercase tracking-wide">
                      {section}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {filteredQuestions.length} questions
                      </span>
                      {expandedSections.includes(section) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-2">
                          {renderSubSections(subSections, section)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
