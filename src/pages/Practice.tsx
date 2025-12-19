import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Filter,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question, FilterOption, getAllQuestionsAsync } from '@/lib/questionUtils';
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
};

type DifficultyFilter = {
  easy: boolean;
  medium: boolean;
  hard: boolean;
};

const difficultyConfig = {
  easy: {
    label: 'Easy',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-600',
    description: 'Great for building confidence'
  },
  medium: {
    label: 'Medium',
    icon: Target,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-600',
    description: 'Perfect for steady progress'
  },
  hard: {
    label: 'Hard',
    icon: Zap,
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-600',
    description: 'Challenge yourself'
  }
};

export default function Practice() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'English Reading & Writing',
    'Information and Ideas',
    'Standard English Conventions',
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyFilter>({
    easy: true,
    medium: true,
    hard: true,
  });

  useEffect(() => {
    getAllQuestionsAsync().then(q => {
      setQuestions(q);
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
    return filteredQuestions.filter(q => {
      if (subTopic) return q.subTopic === subTopic;
      if (topic) return q.topic === topic;
      if (subSection) return q.subSection === subSection;
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

  const DifficultyCard = ({ difficulty }: { difficulty: keyof DifficultyFilter }) => {
    const config = difficultyConfig[difficulty];
    const count = getDifficultyCounts[difficulty];
    const isSelected = selectedDifficulties[difficulty];
    const Icon = config.icon;

    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => toggleDifficulty(difficulty)}
        className={cn(
          'relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group',
          isSelected 
            ? `${config.bgColor} ${config.borderColor}` 
            : 'bg-muted/30 border-transparent opacity-50 hover:opacity-70'
        )}
      >
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3"
          >
            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', config.bgColor, config.borderColor, 'border')}>
              <Check className="w-3 h-3 text-current" />
            </div>
          </motion.div>
        )}
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br',
          config.color
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className={cn('font-semibold text-lg', isSelected ? config.textColor : 'text-muted-foreground')}>
          {config.label}
        </span>
        <span className={cn('text-2xl font-bold mt-1', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
          {count}
        </span>
        <span className="text-xs text-muted-foreground mt-1">{config.description}</span>
      </motion.button>
    );
  };

  const CategoryCard = ({ 
    title, 
    count, 
    icon: Icon,
    onClick,
    gradient = 'from-primary to-accent'
  }: { 
    title: string; 
    count: number; 
    icon: React.ElementType;
    onClick: () => void;
    gradient?: string;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={count === 0}
      className={cn(
        'relative w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group overflow-hidden',
        count > 0 
          ? 'bg-card border border-border hover:border-primary/30 hover:shadow-lg cursor-pointer' 
          : 'bg-muted/30 border border-transparent cursor-not-allowed opacity-50'
      )}
    >
      <div className="flex items-center gap-4 z-10">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
          gradient
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <span className="font-semibold text-foreground block">{title}</span>
          <span className="text-sm text-muted-foreground">{count} questions</span>
        </div>
      </div>
      {count > 0 && (
        <motion.div
          initial={{ x: 10, opacity: 0 }}
          whileHover={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 text-primary"
        >
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Start
          </span>
          <Play className="w-5 h-5 fill-primary" />
        </motion.div>
      )}
    </motion.button>
  );

  const renderTopicItem = (
    label: string,
    count: number,
    onClick: () => void,
    depth: number = 0
  ) => {
    if (count === 0) return null;
    
    return (
      <motion.button
        whileHover={{ x: 4 }}
        onClick={onClick}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        className="w-full flex items-center justify-between pr-4 py-3 rounded-xl transition-all duration-200 group hover:bg-primary/5"
      >
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {count}
          </span>
          <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity fill-primary" />
        </div>
      </motion.button>
    );
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>, subSection: string) => {
    return Object.keys(subTopics).map(subTopic => {
      const count = getCount(subSection, parentTopic, subTopic);
      return (
        <div key={subTopic}>
          {renderTopicItem(
            subTopic,
            count,
            () => startPractice({
              section: 'English',
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

  const renderTopics = (subSection: string, topics: Record<string, any>) => {
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
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {count}
                </span>
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
                  <div className="space-y-0.5">
                    {renderSubTopics(topic, subTopics, subSection)}
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
              section: 'English',
              subSection,
              topic,
            }),
            1
          )}
        </div>
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>) => {
    const subSectionIcons: Record<string, React.ElementType> = {
      'Craft and Structure': BookOpen,
      'Expression of Ideas': Sparkles,
      'Information and Ideas': Target,
      'Standard English Conventions': Filter,
    };

    const subSectionGradients: Record<string, string> = {
      'Craft and Structure': 'from-violet-500 to-purple-600',
      'Expression of Ideas': 'from-blue-500 to-cyan-500',
      'Information and Ideas': 'from-emerald-500 to-teal-500',
      'Standard English Conventions': 'from-amber-500 to-orange-500',
    };

    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';
      const Icon = subSectionIcons[subSection] || BookOpen;
      const gradient = subSectionGradients[subSection] || 'from-primary to-accent';

      return (
        <motion.div 
          key={subSection} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between p-4 bg-card border border-border hover:border-primary/20 rounded-2xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', gradient)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">{subSection}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {count} questions
              </span>
              {expandedSections.includes(subSection) ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedSections.includes(subSection) && hasTopics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pl-4 pt-2 pb-2 ml-5 border-l-2 border-border">
                  {renderTopics(subSection, topics)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 border-2 border-primary/30 border-t-primary rounded-3xl"
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Loading questions...</p>
            <p className="text-sm text-muted-foreground">Preparing your practice session</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-foreground">NextPrep</span>
            </div>
            <div className="w-[60px]" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">Choose Your Practice</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select difficulty level and topic to begin your focused practice session
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Filter by Difficulty</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <DifficultyCard difficulty="easy" />
            <DifficultyCard difficulty="medium" />
            <DifficultyCard difficulty="hard" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CategoryCard
            title="Practice All Questions"
            count={filteredQuestions.length}
            icon={Play}
            onClick={() => startPractice({})}
            gradient="from-primary to-accent"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Topics</h2>
          </div>
          
          {Object.entries(FILTER_STRUCTURE).map(([section, subSections]) => (
            <div key={section} className="space-y-3">
              {renderSubSections(subSections)}
            </div>
          ))}
        </motion.div>

        <div className="h-20" />
      </main>
    </div>
  );
}
