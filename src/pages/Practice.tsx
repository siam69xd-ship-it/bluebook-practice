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
        initial={{ opacity: 0, y: 4, filter: 'blur(4px)', scale: 0.95 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.18, delay: index * 0.025, ease: [0.4, 0, 0.2, 1] }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { x: 3, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
        whileTap={disabled ? {} : { scale: 0.995 }}
        className={cn(
          'w-full flex items-center justify-between py-3.5 transition-colors duration-150 group border-b border-border/60 last:border-b-0',
          disabled ? 'opacity-30 cursor-not-allowed' : ''
        )}
        style={{ paddingLeft: `${depth * 20 + 20}px`, paddingRight: '20px' }}
      >
        <span className="text-[14px] text-foreground/80 group-hover:text-foreground transition-colors duration-150">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground tabular-nums group-hover:text-foreground/60 transition-colors duration-150">{count}</span>
          {!disabled && (
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
          )}
        </div>
      </motion.button>
    );
  };

  const ExpandableRow = ({ label, count, depth, children }: { label: string; count: number; depth: number; children: React.ReactNode }) => {
    const isOpen = expandedSections.includes(label);
    return (
      <div>
        <button
          onClick={() => toggleSection(label)}
          className={cn(
            'w-full flex items-center justify-between py-3.5 transition-colors duration-150 border-b border-border/60',
            'hover:bg-muted/40'
          )}
          style={{ paddingLeft: `${depth * 20 + 20}px`, paddingRight: '20px' }}
        >
          <span className={cn(
            'text-[14px] font-medium text-foreground',
            depth === 0 && 'font-semibold'
          )}>
            {label}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground tabular-nums">{count}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string, mainSection: string) => {
    return Object.keys(subTopics).map(subTopic => (
      <TopicLeaf
        key={subTopic}
        label={subTopic}
        count={getCount(subSection, parentTopic, subTopic)}
        depth={3}
        onClick={() => startPractice({
          section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
          subSection, topic: parentTopic, subTopic,
        })}
      />
    ));
  };

  const renderTopics = (subSection: string, topics: Record<string, any>, mainSection: string) => {
    return Object.entries(topics).map(([topic, subTopics]) => {
      const count = getCount(subSection, topic);
      const hasSubTopics = subTopics !== null && typeof subTopics === 'object';

      if (hasSubTopics) {
        return (
          <ExpandableRow key={topic} label={topic} count={count} depth={2}>
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
          onClick={() => startPractice({
            section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
            subSection, topic,
          })}
        />
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>, mainSection: string) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <div key={subSection} className="border border-border rounded-lg overflow-hidden bg-background">
          <ExpandableRow label={subSection} count={count} depth={0}>
            {hasTopics && renderTopics(subSection, topics, mainSection)}
          </ExpandableRow>
        </div>
      );
    });
  };

  const handleLoadingComplete = () => setShowContent(true);

  if (!showContent) {
    return (
      <>
        <LoadingProgressBar isLoading={isLoading} onLoadingComplete={handleLoadingComplete} />
        <PracticeSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Button>
            <span className="text-sm font-semibold tracking-tight text-foreground">NextPrep</span>
            <div className="w-[72px]" />
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="mb-10 sm:mb-14"
        >
          <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-foreground leading-tight mb-3">
            Choose a Practice Topic
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[540px]">
            Select a topic to begin practicing. The hierarchy is organized by subject and skill.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10 sm:space-y-14">
          {Object.entries(FILTER_STRUCTURE).map(([section, subSections], idx) => (
            <motion.section
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4 sm:mb-5">
                {section}
              </h2>
              <div className="space-y-3">
                {renderSubSections(subSections, section)}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="h-24" />
      </main>
    </div>
  );
}
