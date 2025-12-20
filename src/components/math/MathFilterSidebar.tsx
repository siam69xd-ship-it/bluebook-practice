import { useState } from 'react';
import { ChevronDown, ChevronRight, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface MathQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface MathFilterSidebarProps {
  questions: MathQuestion[];
  activeFilter: { section?: string; topic?: string };
  onFilterChange: (filter: { section?: string; topic?: string }) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Math taxonomy structure
const MATH_TAXONOMY = {
  'Algebra': [
    'Algebra Formulas',
    'Expressions',
    'Linear Equations',
    'Linear System of Equations',
    'Linear Functions',
    'Linear Inequalities'
  ],
  'Advanced Math': [
    'Advanced Math Formulas',
    'Polynomials',
    'Exponents & Radicals',
    'Functions & Function Notation',
    'Exponential Functions',
    'Quadratics'
  ],
  'Problem Solving': [
    'Problem Solving Formulas',
    'Percent; Ratio & Proportion',
    'Unit Conversion',
    'Probability',
    'Mean/Median/Mode/Range',
    'Scatterplots',
    'Research Organizing'
  ],
  'Geometry and Trigonometry': [
    'Geometry & Trigonometry Formulas',
    'Lines & Angles',
    'Triangles',
    'Trigonometry',
    'Circles',
    'Areas & Volumes'
  ]
};

export default function MathFilterSidebar({
  questions,
  activeFilter,
  onFilterChange,
  isOpen,
  onClose
}: MathFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Algebra']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getTopicCount = (topic: string) => {
    return questions.filter(q => q.topic === topic).length;
  };

  const getSectionCount = (section: string) => {
    const topics = MATH_TAXONOMY[section as keyof typeof MATH_TAXONOMY] || [];
    return questions.filter(q => topics.includes(q.topic)).length;
  };

  const isTopicActive = (topic: string) => activeFilter.topic === topic;
  const isSectionActive = (section: string) => activeFilter.section === section && !activeFilter.topic;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-[#1e2b3e]">
              <div className="flex items-center gap-2 text-white">
                <Filter className="w-5 h-5" />
                <span className="font-semibold">Filter by Topic</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* All Topics */}
            <div className="px-4 py-3 border-b">
              <Button
                variant={!activeFilter.section && !activeFilter.topic ? 'default' : 'outline'}
                className="w-full justify-between"
                onClick={() => onFilterChange({})}
              >
                <span>All Topics</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{questions.length}</span>
              </Button>
            </div>

            {/* Topics */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {Object.entries(MATH_TAXONOMY).map(([section, topics]) => (
                  <div key={section} className="border rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                        isSectionActive(section) ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      onClick={() => {
                        toggleSection(section);
                        onFilterChange({ section });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {expandedSections.has(section) ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-medium text-sm">{section}</span>
                      </div>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                        {getSectionCount(section)}
                      </span>
                    </button>

                    {/* Topics */}
                    <AnimatePresence>
                      {expandedSections.has(section) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t bg-slate-50"
                        >
                          {topics.map(topic => {
                            const count = getTopicCount(topic);
                            return (
                              <button
                                key={topic}
                                className={`w-full flex items-center justify-between px-6 py-2.5 text-left text-sm hover:bg-slate-100 transition-colors ${
                                  isTopicActive(topic) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600'
                                }`}
                                onClick={() => onFilterChange({ section, topic })}
                              >
                                <span>{topic}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  count > 0 ? 'bg-slate-200' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
