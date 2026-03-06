import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { PracticeSkeleton } from '@/components/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { Question, FilterOption, getAllQuestionsAsync } from '@/lib/questionUtils';

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
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const startPractice = (filter: Partial<FilterOption>) => {
    const practiceConfig = {
      filter,
      difficulties: { easy: true, medium: true, hard: true },
    };
    sessionStorage.setItem('practiceConfig', JSON.stringify(practiceConfig));
    navigate('/quiz');
  };

  const renderTopicRow = (
    label: string,
    count: number,
    onClick: () => void,
    depth: number = 0
  ) => {
    const disabled = count === 0;
    return (
      <button
        key={label}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-150 group',
          disabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'hover:bg-muted/60'
        )}
        style={{ paddingLeft: `${(depth + 1) * 16 + 16}px` }}
      >
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{count}</span>
          {!disabled && (
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          )}
        </div>
      </button>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string, mainSection: string) => {
    return Object.keys(subTopics).map(subTopic => {
      const count = getCount(subSection, parentTopic, subTopic);
      return renderTopicRow(
        subTopic,
        count,
        () => startPractice({
          section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
          subSection,
          topic: parentTopic,
          subTopic,
        }),
        2
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
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-lg transition-all duration-150"
              style={{ paddingLeft: '32px' }}
            >
              <span className="text-sm font-medium text-foreground">{topic}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{count}</span>
                {expandedSections.includes(topic) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {expandedSections.includes(topic) && (
              <div className="space-y-0.5">
                {renderSubTopics(topic, subTopics, subSection, mainSection)}
              </div>
            )}
          </div>
        );
      }

      return renderTopicRow(
        topic,
        count,
        () => startPractice({
          section: mainSection === 'English Reading & Writing' ? 'English' : 'Math',
          subSection,
          topic,
        }),
        1
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>, mainSection: string) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <div key={subSection} className="border border-border rounded-lg bg-background overflow-hidden">
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-all duration-150"
          >
            <span className="font-medium text-foreground">{subSection}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{count} questions</span>
              {expandedSections.includes(subSection) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedSections.includes(subSection) && hasTopics && (
            <div className="border-t border-border">
              <div className="py-1">
                {renderTopics(subSection, topics, mainSection)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  if (!showContent) {
    return (
      <>
        <LoadingProgressBar 
          isLoading={isLoading} 
          onLoadingComplete={handleLoadingComplete}
        />
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
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <span className="font-semibold text-foreground">NextPrep</span>
            <div className="w-[60px]" />
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Choose a Practice Topic
          </h1>
          <p className="text-muted-foreground mb-10">
            Select a topic to begin practicing. The hierarchy is organized by subject and skill.
          </p>
        </motion.div>

        <div className="space-y-10">
          {Object.entries(FILTER_STRUCTURE).map(([section, subSections], sectionIdx) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIdx * 0.08 }}
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                {section}
              </h2>
              <div className="space-y-3">
                {renderSubSections(subSections, section)}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="h-20" />
      </main>
    </div>
  );
}
