import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { Question, FilterOption, getAllQuestionsAsync, clearProgress } from '@/lib/questionUtils';

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

export default function Practice() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
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

  useEffect(() => {
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

  const getCount = (subSection?: string, topic?: string, subTopic?: string): number => {
    return questions.filter((q) => {
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

  const startPractice = (filter: Partial<FilterOption>) => {
    const practiceConfig = { filter, difficulties: { easy: true, medium: true, hard: true } };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    clearProgress();
    navigate('/quiz');
  };

  const TopicLeaf = ({ label, count, onClick, depth, index = 0 }: { label: string; count: number; onClick: () => void; depth: number; index?: number }) => {
    const disabled = count === 0;
    return (
      <motion.button
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between py-3 transition-all duration-150 group border-b border-border/40 last:border-b-0',
          disabled
            ? 'opacity-25 cursor-not-allowed'
            : 'hover:bg-muted/40'
        )}
        style={{ paddingLeft: `${depth * 24 + 24}px`, paddingRight: '24px' }}
      >
        <span className={cn(
          'text-[13px] text-foreground/75 transition-colors duration-150',
          !disabled && 'group-hover:text-foreground'
        )}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground/60 tabular-nums font-mono tracking-tight">
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
        transition={{ duration: 0.2, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => toggleSection(label)}
          className={cn(
            'w-full flex items-center justify-between py-3 transition-all duration-150 border-b border-border/40 hover:bg-muted/30',
          )}
          style={{ paddingLeft: `${depth * 24 + 24}px`, paddingRight: '24px' }}
        >
          <span className={cn(
            'text-[13px] font-medium text-foreground transition-colors',
            depth === 0 && 'text-[14px] font-semibold tracking-[-0.01em]'
          )}>
            {label}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground/60 tabular-nums font-mono tracking-tight">
              {count}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
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
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
    <>
      <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
      {!showContent ? (
        <PracticeSkeleton />
      ) : (
    <div className="min-h-screen bg-background animate-[skeleton-reveal_0.3s_ease-out_forwards]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8">
          <nav className="flex items-center justify-between h-14">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-3 h-8 px-3 text-[13px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              NextPrep
            </span>
            <div className="w-[72px]" />
          </nav>
        </div>
      </header>

      <main className="pt-14">
        {/* Hero area */}
        <div className="border-b border-border">
          <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground border border-border px-4 py-1.5 mb-6">
                Topic Selection
              </span>
              <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.03em] text-foreground leading-[1.15] mb-3">
                Choose a Practice Topic
              </h1>
              <p className="text-[15px] text-muted-foreground leading-[1.6] max-w-[480px]">
                Select a subject area and topic to begin a focused practice session.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  onClick={() => navigate('/reading-practice')}
                  className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase text-foreground border-b border-foreground/40 hover:border-foreground pb-0.5 transition-colors"
                >
                  Try Reading Practice
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate('/sat-suite')}
                  className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase text-foreground border-b border-foreground/40 hover:border-foreground pb-0.5 transition-colors"
                >
                  SAT Suite Question Bank
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="space-y-14 sm:space-y-18">
            {Object.entries(FILTER_STRUCTURE).map(([section, subSections], idx) => (
              <motion.section
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] whitespace-nowrap">
                    {section}
                  </h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {renderSubSections(subSections, section)}
                </div>
              </motion.section>
            ))}
          </div>

          <div className="h-20" />
        </div>
      </main>
    </div>
      )}
    </>
  );
}
