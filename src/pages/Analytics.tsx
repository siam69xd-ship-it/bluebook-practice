import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadProgress, getAllQuestionsAsync, Question } from '@/lib/questionUtils';
import { useState, useEffect } from 'react';

interface TopicStats {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
}

export default function Analytics() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [loading, setLoading] = useState(true);
  const savedProgress = loadProgress();

  useEffect(() => {
    getAllQuestionsAsync().then(qs => {
      setQuestions(qs);
      calculateStats(qs);
      setLoading(false);
    });
  }, []);

  const calculateStats = (qs: Question[]) => {
    if (!savedProgress) return;

    const topicMap = new Map<string, { correct: number; total: number }>();

    Object.entries(savedProgress.questionStates).forEach(([id, state]) => {
      if (!state?.userAnswer) return;
      
      const question = qs.find(q => q.id.toString() === id);
      if (!question) return;

      const topic = question.subTopic || question.topic || 'Unknown';
      const existing = topicMap.get(topic) || { correct: 0, total: 0 };
      
      existing.total += 1;
      if (state.userAnswer === question.correctAnswer) {
        existing.correct += 1;
      }
      
      topicMap.set(topic, existing);
    });

    const stats: TopicStats[] = Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total,
        accuracy: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);

    setTopicStats(stats);
  };

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

  const getStrengthColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getBarWidth = (accuracy: number) => `${Math.max(accuracy, 5)}%`;

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
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Back Link */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-semibold text-foreground mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground mb-12">Track your accuracy by topic and identify areas for improvement.</p>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          ) : totalAnswered === 0 ? (
            <div className="text-center py-24 border border-border rounded-lg">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-medium text-foreground mb-2">No data yet</h2>
              <p className="text-muted-foreground mb-6">Start practicing to see your analytics.</p>
              <Button asChild>
                <Link to="/practice">Start Practicing</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                      <Target className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{overallAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                </div>
                <div className="border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{totalAnswered}</p>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{totalCorrect}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                      <Clock className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">{topicStats.length}</p>
                  <p className="text-sm text-muted-foreground">Topics Practiced</p>
                </div>
              </div>

              {/* Accuracy by Topic */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-foreground mb-6">Accuracy by Topic</h2>
                <div className="space-y-4">
                  {topicStats.map((stat, index) => (
                    <motion.div
                      key={stat.topic}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{stat.topic}</span>
                        <span className={`text-sm px-2 py-1 rounded border ${getStrengthColor(stat.accuracy)}`}>
                          {stat.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: getBarWidth(stat.accuracy) }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.4 }}
                          className={`h-full rounded-full ${stat.accuracy >= 80 ? 'bg-green-500' : stat.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stat.correct}/{stat.total} correct</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Strength/Weakness Heatmap */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Strengths & Weaknesses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Strongest Topics
                    </h3>
                    <div className="space-y-3">
                      {topicStats.filter(s => s.accuracy >= 70).slice(0, 5).map(stat => (
                        <div key={stat.topic} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{stat.topic}</span>
                          <span className="text-sm font-medium text-green-600">{stat.accuracy}%</span>
                        </div>
                      ))}
                      {topicStats.filter(s => s.accuracy >= 70).length === 0 && (
                        <p className="text-sm text-muted-foreground">Keep practicing to identify your strengths!</p>
                      )}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-600" />
                      Areas to Improve
                    </h3>
                    <div className="space-y-3">
                      {topicStats.filter(s => s.accuracy < 70).slice(0, 5).map(stat => (
                        <div key={stat.topic} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{stat.topic}</span>
                          <span className="text-sm font-medium text-red-600">{stat.accuracy}%</span>
                        </div>
                      ))}
                      {topicStats.filter(s => s.accuracy < 70).length === 0 && (
                        <p className="text-sm text-muted-foreground">Great work! No weak areas detected.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
