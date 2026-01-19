import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, User, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-[#ddd]">
        <div className="max-w-[960px] mx-auto px-6 py-5">
          <nav className="flex items-center justify-between">
            <div>
              <span className="font-academic text-xl text-black tracking-tight">
                Nextprep
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!authLoading && (
                isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#555]">
                      {user.firstName || user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={() => {
                        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                          .then(() => window.location.reload());
                      }}
                      className="text-sm text-[#555] hover:text-black transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-sm text-[#555] hover:text-black transition-colors"
                  >
                    Sign In
                  </button>
                )
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-[85vh] flex items-center">
          <div className="max-w-[960px] mx-auto px-6 py-20">
            {/* Eyebrow */}
            <p className="text-xs uppercase tracking-[0.12em] text-[#555] mb-4">
              Independent Academic SAT Practice
            </p>

            {/* Main Headline */}
            <h1 className="font-academic text-[42px] md:text-[48px] font-medium text-black leading-tight mb-6">
              Practice the SAT as It Is Designed
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#222] max-w-[720px] leading-relaxed mb-5">
              Over {isLoading ? '...' : allQuestions.length.toLocaleString()} topic-wise SAT questions with human-written explanations
              and selectively applied AI-assisted reasoning feedback.
            </p>

            {/* Value Statement */}
            <p className="text-base text-[#333] max-w-[720px] leading-relaxed mb-10">
              We do not teach answers.<br />
              We teach how SAT questions are constructed — and how to reason through them accurately.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-6 mb-6">
              <button
                onClick={() => navigate('/practice')}
                className="border border-black px-6 py-3 text-black text-[15px] hover:bg-black hover:text-white transition-colors"
              >
                Start Practicing
              </button>
              <button
                onClick={() => navigate('/timed-quiz')}
                className="text-[15px] text-black hover:underline flex items-center gap-1"
              >
                Timed Quiz <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Continue Progress */}
            {savedProgress && answeredCount > 0 && (
              <button
                onClick={() => navigate('/quiz')}
                className="text-sm text-[#555] hover:text-black flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Continue where you left off ({answeredCount} answered)
              </button>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-t border-[#ddd] max-w-[960px] mx-auto" />

        {/* Trust Statement */}
        <section className="max-w-[960px] mx-auto px-6 py-16">
          <ul className="space-y-2 text-[15px] text-[#333]">
            <li>• Topic-wise SAT practice</li>
            <li>• Human-written explanations</li>
            <li>• Mistake-focused learning</li>
            <li>• Ethical and exam-safe design</li>
          </ul>
        </section>

        {/* Divider */}
        <hr className="border-t border-[#ddd] max-w-[960px] mx-auto" />

        {/* Content Section */}
        <section className="max-w-[960px] mx-auto px-6 py-16">
          <h2 className="font-academic text-2xl font-normal text-black mb-3">
            Designed Around How the SAT Tests Thinking
          </h2>
          <hr className="border-t border-black w-16 mb-6" />
          <p className="text-base text-[#222] max-w-[720px] leading-relaxed">
            Questions are organized by reasoning skill rather than surface difficulty.
            Each topic targets a specific cognitive pattern the SAT repeatedly tests,
            allowing you to build genuine understanding instead of memorizing shortcuts.
          </p>
        </section>

        {/* Stats Section */}
        {!isLoading && (
          <>
            <hr className="border-t border-[#ddd] max-w-[960px] mx-auto" />
            <section className="max-w-[960px] mx-auto px-6 py-16">
              <h2 className="font-academic text-2xl font-normal text-black mb-3">
                Question Bank Overview
              </h2>
              <hr className="border-t border-black w-16 mb-8" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-3xl font-normal text-black mb-1">
                    {allQuestions.length.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#555]">Total Questions</p>
                </div>
                <div>
                  <p className="text-3xl font-normal text-black mb-1">
                    {Object.keys(topicCounts).length}
                  </p>
                  <p className="text-sm text-[#555]">Topics</p>
                </div>
                <div>
                  <p className="text-3xl font-normal text-black mb-1">3</p>
                  <p className="text-sm text-[#555]">Difficulty Levels</p>
                </div>
                <div>
                  <p className="text-3xl font-normal text-black mb-1">{answeredCount}</p>
                  <p className="text-sm text-[#555]">Your Progress</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#fafafa] border-t border-[#ddd]">
        <div className="max-w-[960px] mx-auto px-6 py-8 text-center">
          <p className="text-[13px] text-[#555]">
            © 2026 — Independent Academic SAT Preparation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
