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

// Complete filter structure with all topics
const ENGLISH_FILTER_STRUCTURE = {
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
};

const MATH_FILTER_STRUCTURE = {
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
};

type DifficultyFilter = {
  easy: boolean;
  medium: boolean;
  hard: boolean;
};

type SectionType = 'English' | 'Math' | null;

export function PracticeSelector({ questions, isOpen, onClose }: PracticeSelectorProps) {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionType>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyFilter>({
    easy: true,
    medium: true,
    hard: true,
  });

  // Separate questions by section
  const englishQuestions = useMemo(() => 
    questions.filter(q => q.section === 'English'), [questions]);
  const mathQuestions = useMemo(() => 
    questions.filter(q => q.section === 'Math'), [questions]);

  // Filter questions based on difficulty and selected section
  const filteredQuestions = useMemo(() => {
    const activeDifficulties = Object.entries(selectedDifficulties)
      .filter(([_, selected]) => selected)
      .map(([diff]) => diff as Difficulty);
    
    let baseQuestions = questions;
    if (selectedSection === 'English') {
      baseQuestions = englishQuestions;
    } else if (selectedSection === 'Math') {
      baseQuestions = mathQuestions;
    }
    
    if (activeDifficulties.length === 0) return [];
    if (activeDifficulties.length === 3) return baseQuestions;
    
    return baseQuestions.filter(q => 
      q.difficulty && activeDifficulties.includes(q.difficulty)
    );
  }, [questions, selectedDifficulties, selectedSection, englishQuestions, mathQuestions]);

  // Count questions for each category
  const getCount = (section: SectionType, subSection?: string, topic?: string, subTopic?: string): number => {
    let baseQuestions = filteredQuestions;
    if (section) {
      baseQuestions = baseQuestions.filter(q => q.section === section);
    }
    
    return baseQuestions.filter((q) => {
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

  const selectMainSection = (section: SectionType) => {
    setSelectedSection(section);
    // Expand the first subsection when selecting
    if (section === 'English') {
      setExpandedSections(['Craft and Structure']);
    } else if (section === 'Math') {
      setExpandedSections(['Algebra']);
    } else {
      setExpandedSections([]);
    }
  };

  const startPractice = (filter: Partial<FilterOption>) => {
    const practiceConfig = {
      filter,
      difficulties: selectedDifficulties,
    };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    navigate('/quiz');
  };

  const DifficultyBadge = ({ difficulty }: { difficulty: keyof DifficultyFilter }) => {
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
    section: SectionType,
    subSection: string,
    topic: string,
    subTopic?: string,
    isNested: boolean = false
  ) => {
    const count = getCount(section, subSection, topic, subTopic);
    const disabled = count === 0;
    const label = subTopic || topic;

    return (
      <button
        key={label}
        onClick={disabled ? undefined : () => startPractice({
          section: section!,
          subSection,
          topic,
          subTopic,
        })}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group',
          'border border-transparent',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primary/5 hover:border-primary/20',
          isNested ? 'ml-4' : ''
        )}
      >
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{count} questions</span>
          {!disabled && <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </button>
    );
  };

  const renderSubTopics = (section: SectionType, subSection: string, parentTopic: string, subTopics: Record<string, null>) => {
    return Object.keys(subTopics).map(subTopic => (
      <div key={subTopic}>
        {renderTopicItem(section, subSection, parentTopic, subTopic, true)}
      </div>
    ));
  };

  const renderTopics = (section: SectionType, subSection: string, topics: Record<string, any>) => {
    return Object.entries(topics).map(([topic, subTopics]) => {
      const count = getCount(section, subSection, topic);
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
                    {renderSubTopics(section, subSection, topic, subTopics)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      return (
        <div key={topic}>
          {renderTopicItem(section, subSection, topic)}
        </div>
      );
    });
  };

  const renderSubSections = (section: SectionType, subSections: Record<string, any>) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(section, subSection);
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
                  {renderTopics(section, subSection, topics)}
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
                <DifficultyBadge difficulty="easy" />
                <DifficultyBadge difficulty="medium" />
                <DifficultyBadge difficulty="hard" />
              </div>
            </div>

            {/* Section Selection (MUTUALLY EXCLUSIVE) */}
            <div className="px-6 py-4 border-b border-border">
              <p className="text-sm font-medium text-foreground mb-3">Choose Section</p>
              <div className="flex gap-3">
                <button
                  onClick={() => selectMainSection('English')}
                  className={cn(
                    'flex-1 py-4 px-4 rounded-xl border-2 transition-all duration-200 text-center',
                    selectedSection === 'English'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                      : 'border-border hover:border-blue-300 hover:bg-blue-50/50'
                  )}
                >
                  <div className="font-semibold">English</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {englishQuestions.length} questions
                  </div>
                </button>
                <button
                  onClick={() => selectMainSection('Math')}
                  className={cn(
                    'flex-1 py-4 px-4 rounded-xl border-2 transition-all duration-200 text-center',
                    selectedSection === 'Math'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                      : 'border-border hover:border-purple-300 hover:bg-purple-50/50'
                  )}
                >
                  <div className="font-semibold">Math</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {mathQuestions.length} questions
                  </div>
                </button>
              </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedSection && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Select a section above</p>
                  <p className="text-sm">Choose English or Math to see available topics</p>
                </div>
              )}

              {selectedSection && (
                <>
                  {/* Practice All in Section */}
                  <button
                    onClick={() => startPractice({ section: selectedSection })}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 mb-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">
                          Practice All {selectedSection}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {getCount(selectedSection)} questions available
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* SubSections */}
                  {selectedSection === 'English' && (
                    <div className="space-y-1">
                      {renderSubSections('English', ENGLISH_FILTER_STRUCTURE)}
                    </div>
                  )}

                  {selectedSection === 'Math' && (
                    <div className="space-y-1">
                      {renderSubSections('Math', MATH_FILTER_STRUCTURE)}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
