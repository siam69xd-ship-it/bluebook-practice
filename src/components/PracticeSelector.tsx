import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, X, Check } from 'lucide-react';
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
          'h-8 px-4 text-[11px] font-medium tracking-[0.1em] uppercase transition-all duration-200 border flex items-center gap-1.5',
          active
            ? 'bg-foreground text-background border-foreground'
            : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
        )}
      >
        {active && <Check className="w-3 h-3" />}
        {labels[difficulty]}
      </button>
    );
  };

  const TopicLeaf = ({ label, count, onClick, depth, index = 0 }: { label: string; count: number; onClick: () => void; depth: number; index?: number }) => {
    const disabled = count === 0;
    return (
      <motion.button
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between py-2.5 transition-all duration-150 group border-b border-border/30 last:border-b-0',
          disabled
            ? 'opacity-20 cursor-not-allowed'
            : 'hover:bg-muted/40'
        )}
        style={{ paddingLeft: `${depth * 20 + 20}px`, paddingRight: '20px' }}
      >
        <span className={cn(
          'text-[13px] text-foreground/70 transition-colors duration-150',
          !disabled && 'group-hover:text-foreground'
        )}>
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-muted-foreground/50 tabular-nums font-mono">
            {count}
          </span>
          {!disabled && (
            <ArrowRight className="w-3 h-3 text-transparent group-hover:text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5" />
          )}
        </div>
      </motion.button>
    );
  };

  const ExpandableRow = ({ label, count, depth, children, index = 0 }: { label: string; count: number; depth: number; children: React.ReactNode; index?: number }) => {
    const isOpen = expandedSections.includes(label);
    return (
      <motion.div
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => toggleSection(label)}
          className="w-full flex items-center justify-between py-2.5 transition-all duration-150 border-b border-border/30 hover:bg-muted/30"
          style={{ paddingLeft: `${depth * 20 + 20}px`, paddingRight: '20px' }}
        >
          <span className={cn(
            'text-[13px] font-medium text-foreground',
            depth === 0 && 'text-[13px] font-semibold tracking-[-0.01em]'
          )}>
            {label}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-muted-foreground/50 tabular-nums font-mono">
              {count}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
            </motion.div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string, mainSection: string) => {
    return Object.keys(subTopics).map((subTopic, i) => (
      <TopicLeaf
        key={subTopic}
        label={subTopic}
        count={getCount(subSection, parentTopic, subTopic)}
        depth={3}
        index={i}
        onClick={() => startPractice({
          section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
          subSection, topic: parentTopic, subTopic,
        })}
      />
    ));
  };

  const renderTopics = (subSection: string, topics: Record<string, any>, mainSection: string) => {
    return Object.entries(topics).map(([topic, subTopics], i) => {
      const count = getCount(subSection, topic);
      const hasSubTopics = subTopics !== null && typeof subTopics === 'object';

      if (hasSubTopics) {
        return (
          <ExpandableRow key={topic} label={topic} count={count} depth={2} index={i}>
            {renderSubTopics(topic, subTopics, subSection, mainSection)}
          </ExpandableRow>
        );
      }

      return (
        <TopicLeaf
          key={topic}
          label={topic}
          count={count}
          depth={2}
          index={i}
          onClick={() => startPractice({
            section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
            subSection, topic,
          })}
        />
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>, mainSection: string) => {
    return Object.entries(subSections).map(([subSection, topics], i) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <motion.div
          key={subSection}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="border border-border overflow-hidden bg-background"
        >
          <ExpandableRow label={subSection} count={count} depth={0}>
            {hasTopics && renderTopics(subSection, topics, mainSection)}
          </ExpandableRow>
        </motion.div>
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-[540px] sm:max-h-[80vh] bg-background border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-border">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground block mb-2">
                    Practice Mode
                  </span>
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                    Choose Your Focus
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 -mr-1.5 -mt-1 hover:bg-muted transition-colors duration-150"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Difficulty filters */}
              <div className="flex items-center gap-1.5">
                <DifficultyPill difficulty="easy" />
                <DifficultyPill difficulty="medium" />
                <DifficultyPill difficulty="hard" />
              </div>
            </div>

            {/* Practice All */}
            <div className="px-6 py-4 border-b border-border">
              <button
                onClick={() => startPractice({})}
                className="w-full flex items-center justify-between py-3 px-4 bg-foreground text-background transition-all duration-200 hover:bg-foreground/90 group active:scale-[0.99]"
              >
                <div>
                  <span className="text-[13px] font-medium tracking-wide block">
                    Practice All Questions
                  </span>
                  <span className="text-[11px] opacity-50 font-mono">
                    {filteredQuestions.length} questions
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>

            {/* Topics */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {Object.entries(FILTER_STRUCTURE).map(([section, subSections], idx) => (
                  <div key={section}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                        {section}
                      </h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-1.5">
                      {renderSubSections(subSections, section)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground/50 text-center font-mono tracking-wide">
                {filteredQuestions.length} questions available
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
