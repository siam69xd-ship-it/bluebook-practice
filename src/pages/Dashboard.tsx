import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  BarChart3, 
  Target, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadProgress, getAllQuestionsAsync, Question } from '@/lib/questionUtils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RecentActivity {
  date: string;
  questionsAnswered: number;
  accuracy: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const savedProgress = loadProgress();

  useEffect(() => {
    getAllQuestionsAsync().then(qs => {
      setQuestions(qs);
      setLoading(false);
    });
  }, []);

  const totalAnswered = savedProgress 
    ? Object.values(savedProgress.questionStates).filter(s => s?.userAnswer).length 
    : 0;

  const totalCorrect = savedProgress
    ? Object.entries(savedProgress.questionStates).filter(([id, state]) => {
        if (!state?.userAnswer) return false;
        const q = questions.find(q => q.id.toString() === id);
        return q && state.userAnswer === q.correctAnswer;
      }).length
    : 0;

  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Calculate weak topics for recommendations
  const getWeakTopics = () => {
    if (!savedProgress) return [];
    
    const topicMap = new Map<string, { correct: number; total: number }>();
    
    Object.entries(savedProgress.questionStates).forEach(([id, state]) => {
      if (!state?.userAnswer) return;
      
      const question = questions.find(q => q.id.toString() === id);
      if (!question) return;

      const topic = question.subTopic || question.topic || 'Unknown';
      const existing = topicMap.get(topic) || { correct: 0, total: 0 };
      
      existing.total += 1;
      if (state.userAnswer === question.correctAnswer) {
        existing.correct += 1;
      }
      
      topicMap.set(topic, existing);
    });

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        accuracy: Math.round((data.correct / data.total) * 100),
        total: data.total
      }))
      .filter(t => t.accuracy < 70 && t.total >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  };

  const weakTopics = getWeakTopics();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight text-foreground">
              Acely
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
              <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {isAuthenticated && user?.firstName 
                ? `Welcome back, ${user.firstName}` 
                : 'Your Dashboard'}
            </h1>
            <p className="text-muted-foreground">Track your progress and continue your SAT preparation.</p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{totalAnswered}</p>
                  <p className="text-sm text-muted-foreground">Questions Practiced</p>
                </div>
                <div className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4">
                    <Target className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{overallAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                </div>
                <div className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{totalCorrect}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4">
                    <BarChart3 className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-12">
                <div 
                  className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors cursor-pointer group"
                  onClick={() => navigate('/practice')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">Continue Practice</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {totalAnswered > 0 
                      ? `You've answered ${totalAnswered} questions. Keep going!`
                      : 'Start practicing to improve your SAT score.'}
                  </p>
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                    Practice Now
                  </Button>
                </div>

                <div 
                  className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors cursor-pointer group"
                  onClick={() => navigate('/analytics')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">View Analytics</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    See detailed breakdowns of your performance by topic.
                  </p>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </motion.div>

              {/* Study Recommendations */}
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Personalized Recommendations
                </h2>
                
                {weakTopics.length > 0 ? (
                  <div className="space-y-4">
                    {weakTopics.map((topic, index) => (
                      <motion.div
                        key={topic.topic}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-foreground">{topic.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            Current accuracy: {topic.accuracy}% ({topic.total} questions)
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/practice')}
                        >
                          Practice
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : totalAnswered === 0 ? (
                  <div className="border border-border rounded-lg p-8 text-center">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Complete at least 3 questions in a topic to get personalized recommendations.
                    </p>
                    <Button onClick={() => navigate('/practice')}>
                      Start Practicing
                    </Button>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-8 text-center">
                    <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-2">Great work!</p>
                    <p className="text-muted-foreground">
                      You're performing well across all topics. Keep practicing to maintain your skills.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Progress Chart Placeholder */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-foreground mb-6">Progress Over Time</h2>
                <div className="border border-border rounded-lg p-8">
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {totalAnswered >= 10 
                          ? 'Progress tracking coming soon'
                          : 'Answer at least 10 questions to see your progress chart'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
