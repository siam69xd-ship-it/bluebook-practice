import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  BarChart3,
  CheckCircle2,
  LogOut, 
  User,
  Timer,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadProgress, getAllQuestionsAsync, getTopicCounts, Question, prefetchQuestions } from '@/lib/questionUtils';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { prefetchRoute } from '@/lib/routePrefetch';

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const savedProgress = loadProgress();

  useEffect(() => {
    prefetchQuestions();
    getAllQuestionsAsync().then(questions => {
      setAllQuestions(questions);
      setDataLoaded(true);
    });
  }, []);

  const handlePracticeHover = useCallback(() => {
    prefetchQuestions();
    prefetchRoute('/practice');
  }, []);

  const handleTimedQuizHover = useCallback(() => {
    prefetchRoute('/timed-quiz');
  }, []);

  const handleQuizHover = useCallback(() => {
    prefetchRoute('/quiz');
  }, []);

  const handleMathHover = useCallback(() => {
    prefetchRoute('/math');
  }, []);

  const topicCounts = getTopicCounts(allQuestions);
  const answeredCount = savedProgress
    ? Object.values(savedProgress.questionStates).filter(s => s?.userAnswer).length
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Structured Question Bank',
      description: 'Questions organized by subject, domain, and skill for focused learning.',
    },
    {
      icon: Timer,
      title: 'Realistic Practice Tests',
      description: 'Full-length adaptive tests that mirror the Digital SAT experience.',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track accuracy by topic, identify weaknesses, and measure progress.',
    },
    {
      icon: Target,
      title: 'Topic-Based Filtering',
      description: 'Focus on specific skills with precise question filtering by category.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Acely
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              <Link 
                to="/practice" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onMouseEnter={handlePracticeHover}
              >
                Practice
              </Link>
              <Link 
                to="/math" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onMouseEnter={handleMathHover}
              >
                Math
              </Link>
              {!authLoading && (
                isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {user.firstName || user.email?.split('@')[0]}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                          .then(() => window.location.reload());
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )
              )}
            </motion.div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-foreground leading-[1.1] mb-6"
            >
              A Better Way to Prepare for the Digital SAT
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Acely is a fully free SAT practice platform built to help students prepare with clarity and structure. Practice with well-organized questions, realistic test sessions, and clear performance insights.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start gap-4 mb-6"
            >
              <Button
                size="lg"
                onClick={() => navigate('/practice')}
                onMouseEnter={handlePracticeHover}
                onFocus={handlePracticeHover}
                className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-sm font-medium"
              >
                Start practicing now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/timed-quiz')}
                onMouseEnter={handleTimedQuizHover}
                onFocus={handleTimedQuizHover}
                className="border-border hover:bg-muted h-12 px-8 text-sm font-medium"
              >
                Browse the question bank
              </Button>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-sm text-muted-foreground"
            >
              Free access. Thoughtful design. Serious preparation.
            </motion.p>

            {savedProgress && answeredCount > 0 && (
              <motion.div variants={itemVariants} className="mt-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/quiz')}
                  onMouseEnter={handleQuizHover}
                  onFocus={handleQuizHover}
                  className="text-muted-foreground hover:text-foreground -ml-4"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Continue where you left off ({answeredCount} answered)
                </Button>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
            >
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
                  {!dataLoaded ? '—' : allQuestions.length.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Questions</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
                  {!dataLoaded ? '—' : Object.keys(topicCounts).length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Topics Covered</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">3</p>
                <p className="text-sm text-muted-foreground mt-1">Difficulty Levels</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">{answeredCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Questions Answered</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-[1200px] mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              Built for Focused Learning
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-12">
              Every feature is designed with one goal in mind—helping you understand what the SAT tests and how to master it efficiently.
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="group"
                >
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4 group-hover:border-foreground/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Topics Section */}
        {dataLoaded && Object.keys(topicCounts).length > 0 && (
          <section className="border-t border-border">
            <div className="max-w-[1200px] mx-auto px-6 py-24">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                  Available Topics
                </h2>
                <p className="text-muted-foreground max-w-2xl mb-10">
                  Comprehensive coverage of all SAT question types, organized for efficient study.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {Object.entries(topicCounts).map(([topic, count]) => (
                    <div
                      key={topic}
                      className="px-4 py-2 rounded-full border border-border text-sm hover:border-foreground/20 transition-colors cursor-default"
                    >
                      <span className="text-foreground">{topic}</span>
                      <span className="ml-2 text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Practice Modes Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                Choose Your Practice Mode
              </h2>
              <p className="text-muted-foreground max-w-2xl mb-12">
                Whether you want focused topic practice or full test simulation, we have you covered.
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="border border-border rounded-lg p-6 bg-background hover:border-foreground/20 transition-colors cursor-pointer"
                  onClick={() => navigate('/practice')}
                  onMouseEnter={handlePracticeHover}
                >
                  <BookOpen className="w-6 h-6 text-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Reading & Writing</h3>
                  <p className="text-sm text-muted-foreground">Practice reading comprehension, grammar, and writing questions.</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="border border-border rounded-lg p-6 bg-background hover:border-foreground/20 transition-colors cursor-pointer"
                  onClick={() => navigate('/math')}
                  onMouseEnter={handleMathHover}
                >
                  <Calculator className="w-6 h-6 text-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Math</h3>
                  <p className="text-sm text-muted-foreground">Algebra, geometry, trigonometry, and problem-solving questions.</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="border border-border rounded-lg p-6 bg-background hover:border-foreground/20 transition-colors cursor-pointer"
                  onClick={() => navigate('/timed-quiz')}
                  onMouseEnter={handleTimedQuizHover}
                >
                  <Timer className="w-6 h-6 text-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Timed Quiz</h3>
                  <p className="text-sm text-muted-foreground">Simulate test conditions with timed practice sessions.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                Ready to Start Preparing?
              </h2>
              <p className="text-muted-foreground mb-8">
                Begin your SAT preparation journey today. No account required to start practicing.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/practice')}
                onMouseEnter={handlePracticeHover}
                className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-sm font-medium"
              >
                Start practicing now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Left Column */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Acely</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A free platform for focused Digital SAT preparation. Built to help students practice with clarity and confidence.
              </p>
            </div>

            {/* Middle Column */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-4">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Practice Tests
                  </Link>
                </li>
                <li>
                  <Link to="/timed-quiz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Question Bank
                  </Link>
                </li>
                <li>
                  <Link to="/math" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Math Practice
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Acely
                  </Link>
                </li>
                <li>
                  <Link to="/mission" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Mission
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 Acely. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms and Conditions
                </Link>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Acely is an independent educational platform and is not affiliated with College Board or the SAT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}