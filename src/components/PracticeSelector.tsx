import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowRight, X, Check, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, FilterOption } from '@/lib/questionUtils';
import { Difficulty } from '@/lib/difficultyData';

interface PracticeSelectorProps {
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
}

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

  const filteredQuestions = useMemo(() => {
    const activeDifficulties = Object.entries(selectedDifficulties)
      .filter(([_, selected]) => selected)
      .map(([diff]) => diff as Difficulty);
    if (activeDifficulties.length === 0) return [];
    if (activeDifficulties.length === 3) return questions;
    return questions.filter(q => q.difficulty && activeDifficulties.includes(q.difficulty));
  }, [questions, selectedDifficulties]);

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
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleDifficulty = (difficulty: keyof DifficultyFilter) => {
    setSelectedDifficulties(prev => ({ ...prev, [difficulty]: !prev[difficulty] }));
  };

  const startPractice = (filter: Partial<FilterOption>) => {
    const practiceConfig = { filter, difficulties: selectedDifficulties };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    navigate('/quiz');
  };

  const DifficultyPill = ({ difficulty }: { difficulty: keyof DifficultyFilter }) => {
    const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    const active = selectedDifficulties[difficulty];
    return (
      <button
        onClick={() => toggleDifficulty(difficulty)}
        className={cn(
          'px-4 py-2 text-xs font-medium tracking-widest uppercase transition-all duration-300 border',
          active
            ? 'bg-foreground text-background border-foreground'
            : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40'
        )}
      >
        {active && <Check className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />}
        {labels[difficulty]}
      </button>
    );
  };

  const renderTopicItem = (label: string, count: number, onClick: () => void, isSubTopic = false) => {
    const disabled = count === 0;
    return (
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between py-2.5 px-3 transition-all duration-200 group',
          'border-b border-border/50 last:border-b-0',
          disabled
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-muted/60 hover:pl-5',
          isSubTopic ? 'ml-4 border-l border-border pl-4' : ''
        )}
      >
        <span className={cn(
          'text-sm transition-colors duration-200',
          isSubTopic ? 'text-muted-foreground group-hover:text-foreground' : 'text-foreground'
        )}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground font-mono">{count}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </button>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string, mainSection: string) => {
    return Object.keys(subTopics).map(subTopic => {
      const count = getCount(subSection, parentTopic, subTopic);
      return (
        <div key={subTopic}>
          {renderTopicItem(subTopic, count, () => startPractice({
            section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
            subSection, topic: parentTopic, subTopic,
          }), true)}
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
              className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-muted/40 transition-all duration-200"
            >
              <span className="text-sm font-medium text-foreground">{topic}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground font-mono">{count}</span>
                <motion.div
                  animate={{ rotate: expandedSections.includes(topic) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {expandedSections.includes(topic) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {renderSubTopics(topic, subTopics, subSection, mainSection)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      return (
        <div key={topic}>
          {renderTopicItem(topic, count, () => startPractice({
            section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
            subSection, topic,
          }))}
        </div>
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>, mainSection: string) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <div key={subSection} className="mb-1">
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/40 transition-all duration-200 border-b border-border"
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-foreground">{subSection}</span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">{count}</span>
              <motion.div
                animate={{ rotate: expandedSections.includes(subSection) ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
            </div>
          </button>
          <AnimatePresence>
            {expandedSections.includes(subSection) && hasTopics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden pl-2"
              >
                {renderTopics(subSection, topics, mainSection)}
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-xl sm:max-h-[85vh] bg-background border border-border flex flex-col overflow-hidden"
          >
            {/* Header — editorial style */}
            <div className="px-8 pt-8 pb-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground mb-2">Practice Mode</p>
                  <h2 className="text-2xl font-serif font-semibold text-foreground tracking-tight">
                    Choose Your Focus
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 -mt-2 hover:bg-muted transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Difficulty filters */}
              <div className="mt-5 flex items-center gap-2">
                <DifficultyPill difficulty="easy" />
                <DifficultyPill difficulty="medium" />
                <DifficultyPill difficulty="hard" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Practice All — hero button */}
              <div className="px-8 py-6 border-b border-border">
                <button
                  onClick={() => startPractice({})}
                  className="w-full flex items-center justify-between py-4 px-5 border border-foreground bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-5 h-5" />
                    <div className="text-left">
                      <span className="text-sm font-medium tracking-wide">Practice All Questions</span>
                      <p className="text-[11px] opacity-60 font-mono mt-0.5">{filteredQuestions.length} questions</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Topic sections */}
              <div className="px-8 py-4">
                {Object.entries(FILTER_STRUCTURE).map(([section, subSections]) => (
                  <div key={section} className="mb-6 last:mb-2">
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full flex items-center justify-between pb-3 mb-2 border-b-2 border-foreground transition-all duration-200"
                    >
                      <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground">
                        {section}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {section === 'English Reading & Writing'
                            ? filteredQuestions.filter(q => q.section === 'English').length
                            : filteredQuestions.filter(q => q.section === 'Math').length}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedSections.includes(section) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSections.includes(section) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          {renderSubSections(subSections, section)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground tracking-wide text-center font-mono">
                {filteredQuestions.length} questions match your filters
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
