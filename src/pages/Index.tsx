import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Target, 
  Sparkles, 
  LogOut, 
  User, 
  Timer,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  Zap,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadProgress, getAllQuestionsAsync, getTopicCounts, Question, prefetchQuestions } from '@/lib/questionUtils';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingProgressBar } from '@/components/LoadingProgressBar';
import { HomeSkeleton } from '@/components/LoadingSkeleton';
import { prefetchRoute } from '@/lib/routePrefetch';

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const savedProgress = loadProgress();

  // Prefetch questions immediately on mount
  useEffect(() => {
    prefetchQuestions(); // Start loading in background
    getAllQuestionsAsync().then(questions => {
      setAllQuestions(questions);
      setIsLoading(false);
    });
  }, []);

  // Prefetch on hover over Practice button for even faster loading
  const handlePracticeHover = useCallback(() => {
    prefetchQuestions();
    prefetchRoute('/practice');
  }, []);

  // Prefetch timed quiz on hover
  const handleTimedQuizHover = useCallback(() => {
    prefetchRoute('/timed-quiz');
  }, []);

  // Prefetch quiz on hover
  const handleQuizHover = useCallback(() => {
    prefetchRoute('/quiz');
  }, []);

  const topicCounts = getTopicCounts(allQuestions);
  const answeredCount = savedProgress
    ? Object.values(savedProgress.questionStates).filter(s => s?.userAnswer).length
    : 0;

  const difficultyStats = {
    easy: allQuestions.filter(q => q.difficulty === 'easy').length,
    medium: allQuestions.filter(q => q.difficulty === 'medium').length,
    hard: allQuestions.filter(q => q.difficulty === 'hard').length,
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Real SAT Questions',
      description: 'Authentic past exam questions for realistic practice',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Smart Filtering',
      description: 'Focus on specific topics and difficulty levels',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Clock,
      title: 'Timed Practice',
      description: 'Track your speed and improve efficiency',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement over time',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!showContent) {
    return (
      <>
        <LoadingProgressBar isLoading={isLoading} onLoadingComplete={() => setShowContent(true)} />
        <HomeSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 animate-stagger-fade stagger-1">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  NextPrep
                </span>
                <span className="hidden sm:block text-xs text-slate-500 -mt-0.5">SAT Preparation</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {!authLoading && (
                isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {(user.firstName || user.email)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-slate-700 font-medium">
                        {user.firstName || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-200 hover:bg-slate-100"
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
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="border-slate-200 hover:bg-slate-100"
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
        <section className="container mx-auto px-4 pt-16 pb-20 lg:pt-24 lg:pb-28 animate-stagger-fade stagger-2">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                <Sparkles className="w-4 h-4" />
                Trusted by thousands of students
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Master the SAT with
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Real Practice Questions
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Experience authentic Digital SAT questions in a clean, distraction-free environment. 
              Practice smarter, not harder.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <Button
                size="lg"
                onClick={() => navigate('/practice')}
                onMouseEnter={handlePracticeHover}
                onFocus={handlePracticeHover}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 h-14 px-8 text-base font-semibold group"
              >
                Start Practice
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-150" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/timed-quiz')}
                onMouseEnter={handleTimedQuizHover}
                onFocus={handleTimedQuizHover}
                className="w-full sm:w-auto border-2 border-slate-200 hover:bg-slate-50 h-14 px-8 text-base font-semibold"
              >
                <Timer className="w-5 h-5 mr-2" />
                Timed Quiz
              </Button>
            </motion.div>

            {savedProgress && answeredCount > 0 && (
              <motion.div variants={itemVariants}>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/quiz')}
                  onMouseEnter={handleQuizHover}
                  onFocus={handleQuizHover}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                  Continue where you left off ({answeredCount} answered)
                </Button>
              </motion.div>
            )}
          </motion.div>
        </section>

        <section className="container mx-auto px-4 pb-20 animate-stagger-fade stagger-3">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    allQuestions.length.toLocaleString()
                  )}
                </p>
                <p className="text-slate-500 text-sm font-medium">Total Questions</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    Object.keys(topicCounts).length
                  )}
                </p>
                <p className="text-slate-500 text-sm font-medium">Topics</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">3</p>
                <p className="text-slate-500 text-sm font-medium">Difficulty Levels</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-emerald-600 mb-1">{answeredCount}</p>
                <p className="text-slate-500 text-sm font-medium">Answered</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {!isLoading && (
          <section className="container mx-auto px-4 pb-20 animate-stagger-fade stagger-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                  Difficulty Distribution
                </h2>
                <p className="text-slate-600">Practice questions organized by difficulty level</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-emerald-800">Easy</span>
                  </div>
                  <p className="text-4xl font-bold text-emerald-700">{difficultyStats.easy}</p>
                  <p className="text-sm text-emerald-600 mt-1">Great for building confidence</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-amber-800">Medium</span>
                  </div>
                  <p className="text-4xl font-bold text-amber-700">{difficultyStats.medium}</p>
                  <p className="text-sm text-amber-600 mt-1">Perfect for steady progress</p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-6 border border-rose-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-rose-800">Hard</span>
                  </div>
                  <p className="text-4xl font-bold text-rose-700">{difficultyStats.hard}</p>
                  <p className="text-sm text-rose-600 mt-1">Challenge yourself</p>
                </motion.div>
              </div>
            </motion.div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-20 animate-stagger-fade stagger-5">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Everything You Need to Succeed
              </h2>
              <p className="text-slate-600">Comprehensive tools for effective SAT preparation</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {!isLoading && Object.keys(topicCounts).length > 0 && (
          <section className="container mx-auto px-4 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                  Available Topics
                </h2>
                <p className="text-slate-600">Comprehensive coverage of all SAT question types</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {Object.entries(topicCounts).map(([topic, count]) => (
                  <motion.div
                    key={topic}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default"
                  >
                    <span className="font-medium text-slate-700">{topic}</span>
                    <span className="ml-2 text-blue-600 font-semibold">{count}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-blue-500/20">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Boost Your Score?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Start practicing with real SAT questions today and see your improvement.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/practice')}
                className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-base font-semibold shadow-lg group"
              >
                Begin Practice Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-700">NextPrep</span>
            </div>
            <p className="text-sm text-slate-500">
              Practice makes perfect. Start your SAT journey today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
