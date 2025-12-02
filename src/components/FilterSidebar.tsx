import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FilterOption, Question, getTopicCounts } from '@/lib/questionUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  questions: Question[];
  activeFilter: Partial<FilterOption>;
  onFilterChange: (filter: Partial<FilterOption>) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TopicItem {
  name: string;
  count: number;
  subTopics?: TopicItem[];
}

export function FilterSidebar({
  questions,
  activeFilter,
  onFilterChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Standard English Conventions', 'Form, Structure, and Sense']);

  const topicCounts = getTopicCounts(questions);

  // Build tree structure
  const boundariesCount = questions.filter(q => q.topic === 'Boundaries').length;
  const formStructureQuestions = questions.filter(q => q.topic === 'Form, Structure, and Sense');
  
  const subTopicCounts: { [key: string]: number } = {};
  formStructureQuestions.forEach(q => {
    if (q.subTopic) {
      subTopicCounts[q.subTopic] = (subTopicCounts[q.subTopic] || 0) + 1;
    }
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleTopicClick = (topic: string, subTopic?: string) => {
    if (subTopic) {
      onFilterChange({
        section: 'English',
        subSection: 'Standard English Conventions',
        topic: 'Form, Structure, and Sense',
        subTopic,
      });
    } else if (topic === 'Boundaries') {
      onFilterChange({
        section: 'English',
        subSection: 'Standard English Conventions',
        topic: 'Boundaries',
      });
    } else {
      onFilterChange({});
    }
  };

  const isTopicActive = (topic: string, subTopic?: string) => {
    if (subTopic) {
      return activeFilter.subTopic === subTopic;
    }
    return activeFilter.topic === topic && !activeFilter.subTopic;
  };

  const clearFilter = () => {
    onFilterChange({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-card border-r border-border shadow-xl lg:relative lg:shadow-none"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <div className="flex items-center gap-2">
                  {Object.keys(activeFilter).length > 0 && (
                    <button
                      onClick={clearFilter}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-muted lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* All Questions */}
                <button
                  onClick={() => handleTopicClick('')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg mb-4 transition-colors',
                    Object.keys(activeFilter).length === 0
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  All Questions ({questions.length})
                </button>

                {/* English Section */}
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    English — Reading & Writing
                  </div>

                  {/* Standard English Conventions */}
                  <div>
                    <button
                      onClick={() => toggleSection('Standard English Conventions')}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <span className="text-sm font-medium">Standard English Conventions</span>
                      {expandedSections.includes('Standard English Conventions') ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {expandedSections.includes('Standard English Conventions') && (
                      <div className="ml-4 mt-1 space-y-1">
                        {/* Boundaries */}
                        <button
                          onClick={() => handleTopicClick('Boundaries')}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            isTopicActive('Boundaries')
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          Boundaries ({boundariesCount})
                        </button>

                        {/* Form, Structure, and Sense */}
                        <div>
                          <button
                            onClick={() => toggleSection('Form, Structure, and Sense')}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <span className="text-sm">Form, Structure, and Sense ({formStructureQuestions.length})</span>
                            {expandedSections.includes('Form, Structure, and Sense') ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>

                          {expandedSections.includes('Form, Structure, and Sense') && (
                            <div className="ml-4 mt-1 space-y-0.5">
                              {Object.entries(subTopicCounts).map(([subTopic, count]) => (
                                <button
                                  key={subTopic}
                                  onClick={() => handleTopicClick('Form, Structure, and Sense', subTopic)}
                                  className={cn(
                                    'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                                    isTopicActive('Form, Structure, and Sense', subTopic)
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'hover:bg-muted text-muted-foreground'
                                  )}
                                >
                                  {subTopic} ({count})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
