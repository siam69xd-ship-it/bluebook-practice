import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Target, Sparkles, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadProgress, getAllQuestionsAsync, getTopicCounts, Question } from '@/lib/questionUtils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const savedProgress = loadProgress();

  useEffect(() => {
    getAllQuestionsAsync().then(questions => {
      setAllQuestions(questions);
      setIsLoading(false);
    });
  }, []);

  const topicCounts = getTopicCounts(allQuestions);

  const answeredCount = savedProgress
    ? Object.values(savedProgress.questionStates).filter(s => s?.userAnswer).length
    : 0;

  const features = [
    {
      icon: BookOpen,
      title: 'Real SAT Questions',
      description: 'Practice with authentic past exam questions',
    },
    {
      icon: Clock,
      title: 'Per-Question Timer',
      description: 'Track your time on each individual question',
    },
    {
      icon: Target,
      title: 'Topic Filters',
      description: 'Focus on specific areas like Grammar or Math',
    },
    {
      icon: Sparkles,
      title: 'Bluebook Interface',
      description: 'Experience the real exam environment',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-foreground">NextPrep</span>
          </div>
          <div className="flex items-center gap-3">
            {!authLoading && (
              isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2">
                    {user.profileImageUrl && (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {user.firstName || user.email}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/api/logout'}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              )
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">NextPrep</span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-foreground mb-4">
              Practice Real SAT (DSAT) Past Questions
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Experience the real Bluebook feel — smooth, fast, and organized.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/quiz')}
              className="w-full sm:w-auto"
            >
              Start Practice
              <ArrowRight className="w-5 h-5" />
            </Button>
            {savedProgress && answeredCount > 0 && (
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate('/quiz')}
                className="w-full sm:w-auto"
              >
                Continue ({answeredCount} answered)
              </Button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <p className="text-3xl font-bold gradient-text">
                {isLoading ? '...' : allQuestions.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <p className="text-3xl font-bold gradient-text">
                {isLoading ? '...' : Object.keys(topicCounts).length}
              </p>
              <p className="text-sm text-muted-foreground">Topics</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <p className="text-3xl font-bold gradient-text">1</p>
              <p className="text-sm text-muted-foreground">Section</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
              <p className="text-3xl font-bold text-success">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Answered</p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Topic Preview */}
      {!isLoading && Object.keys(topicCounts).length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">
              Available Topics
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(topicCounts).map(([topic, count]) => (
                <div
                  key={topic}
                  className="px-4 py-2 rounded-full bg-card border border-border text-sm"
                >
                  <span className="font-medium text-foreground">{topic}</span>
                  <span className="ml-2 text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 NextPrep. Practice makes perfect.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Built for SAT success
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
