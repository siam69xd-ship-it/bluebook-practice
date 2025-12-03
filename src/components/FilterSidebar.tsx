import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FilterOption, Question } from '@/lib/questionUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  questions: Question[];
  activeFilter: Partial<FilterOption>;
  onFilterChange: (filter: Partial<FilterOption>) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Complete filter structure matching JSON
const FILTER_STRUCTURE = {
  'English Reading & Writing': {
    'Craft and Structure': {
      'Cross-Text Connections': null,
      'Text Structure and Purpose': null,
      'Words in Context': null,
    },
    'Expression of Ideas': {
      'Rhetorical Synthesis': null,
      'Transitions': null,
    },
    'Information and Ideas': {
      'Central Ideas and Details': null,
      'Command of Evidence': null,
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

export function FilterSidebar({
  questions,
  activeFilter,
  onFilterChange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'English Reading & Writing',
    'Standard English Conventions',
    'Form, Structure, and Sense',
  ]);

  // Count questions for each category
  const getCount = (subSection?: string, topic?: string, subTopic?: string): number => {
    return questions.filter(q => {
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

  const handleFilterClick = (subSection?: string, topic?: string, subTopic?: string) => {
    if (subTopic) {
      onFilterChange({
        section: 'English',
        subSection: subSection || 'Standard English Conventions',
        topic: topic || 'Form, Structure, and Sense',
        subTopic,
      });
    } else if (topic) {
      onFilterChange({
        section: 'English',
        subSection: subSection || 'Standard English Conventions',
        topic,
      });
    } else if (subSection) {
      onFilterChange({
        section: 'English',
        subSection,
      });
    } else {
      onFilterChange({});
    }
  };

  const isActive = (subSection?: string, topic?: string, subTopic?: string) => {
    if (subTopic) return activeFilter.subTopic === subTopic;
    if (topic) return activeFilter.topic === topic && !activeFilter.subTopic;
    if (subSection) return activeFilter.subSection === subSection && !activeFilter.topic;
    return Object.keys(activeFilter).length === 0;
  };

  const clearFilter = () => {
    onFilterChange({});
  };

  const renderSubTopics = (parentTopic: string, subTopics: Record<string, null>) => {
    return Object.keys(subTopics).map(subTopic => {
      const count = getCount('Standard English Conventions', parentTopic, subTopic);
      return (
        <button
          key={subTopic}
          onClick={() => handleFilterClick('Standard English Conventions', parentTopic, subTopic)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200',
            isActive('Standard English Conventions', parentTopic, subTopic)
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {subTopic} <span className="text-xs opacity-70">({count})</span>
        </button>
      );
    });
  };

  const renderTopics = (subSection: string, topics: Record<string, any>) => {
    return Object.entries(topics).map(([topic, subTopics]) => {
      const count = getCount(subSection, topic);
      const hasSubTopics = subTopics !== null && typeof subTopics === 'object';

      if (hasSubTopics) {
        return (
          <div key={topic}>
            <button
              onClick={() => toggleSection(topic)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted rounded-xl transition-all duration-200"
            >
              <span className="text-sm">
                {topic} <span className="text-xs text-muted-foreground">({count})</span>
              </span>
              {expandedSections.includes(topic) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {expandedSections.includes(topic) && (
              <div className="ml-4 mt-1 space-y-0.5">
                {renderSubTopics(topic, subTopics)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={topic}
          onClick={() => handleFilterClick(subSection, topic)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200',
            isActive(subSection, topic)
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted text-foreground'
          )}
        >
          {topic} <span className="text-xs opacity-70">({count})</span>
        </button>
      );
    });
  };

  const renderSubSections = (subSections: Record<string, any>) => {
    return Object.entries(subSections).map(([subSection, topics]) => {
      const count = getCount(subSection);
      const hasTopics = topics !== null && typeof topics === 'object';

      return (
        <div key={subSection}>
          <button
            onClick={() => toggleSection(subSection)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted rounded-xl transition-all duration-200"
          >
            <span className="text-sm font-medium">
              {subSection} <span className="text-xs text-muted-foreground font-normal">({count})</span>
            </span>
            {expandedSections.includes(subSection) ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections.includes(subSection) && hasTopics && (
            <div className="ml-4 mt-1 space-y-0.5">
              {renderTopics(subSection, topics)}
            </div>
          )}
        </div>
      );
    });
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
                <h3 className="text-lg font-semibold text-foreground">Question Filters</h3>
                <div className="flex items-center gap-2">
                  {Object.keys(activeFilter).length > 0 && (
                    <button
                      onClick={clearFilter}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
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
                  onClick={() => handleFilterClick()}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl mb-4 transition-all duration-200',
                    Object.keys(activeFilter).length === 0
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  All Questions ({questions.length})
                </button>

                {/* English Reading & Writing */}
                {Object.entries(FILTER_STRUCTURE).map(([section, subSections]) => (
                  <div key={section} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted rounded-xl transition-all duration-200"
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {section}
                      </span>
                      {expandedSections.includes(section) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {expandedSections.includes(section) && (
                      <div className="ml-2 space-y-0.5">
                        {renderSubSections(subSections)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
