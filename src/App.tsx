import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import nprogress from "nprogress";
import "./loading.css";

// Configure nprogress for speed
nprogress.configure({
  minimum: 0.15,
  speed: 250,
  trickleSpeed: 100,
  showSpinner: false,
  easing: 'ease',
});

// Eagerly load Index for fastest initial render
import Index from "./pages/Index";

// Lazy load other pages for faster initial bundle
const Practice = lazy(() => import("./pages/Practice"));
const Quiz = lazy(() => import("./pages/Quiz"));
const TimedQuiz = lazy(() => import("./pages/TimedQuiz"));
const Math = lazy(() => import("./pages/Math"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Mission = lazy(() => import("./pages/Mission"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GenerateExplanations = lazy(() => import("./pages/GenerateExplanations"));
const ReadingPractice = lazy(() => import("./pages/ReadingPractice"));
const ReadingPracticeQuiz = lazy(() => import("./pages/ReadingPracticeQuiz"));
const BookReading = lazy(() => import("./pages/BookReading"));
const BookReadingQuiz = lazy(() => import("./pages/BookReadingQuiz"));
const SatSuite = lazy(() => import("./pages/SatSuite"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Minimal loading fallback — just the progress bar, no jarring spinner
const PageLoader = () => {
  useEffect(() => {
    nprogress.start();
    return () => { nprogress.done(); };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-5 h-5 border-[1.5px] border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
    </div>
  );
};

const NavigationHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    nprogress.start();
    nprogress.done();
  }, [location.pathname]);

  return null;
};

// Remove preloader instantly
const useRemovePreloader = () => {
  useEffect(() => {
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 50);
    }
  }, []);
};

const App = () => {
  useRemovePreloader();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NavigationHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/practice" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Practice />
                  </div>
                </Suspense>
              } />
              <Route path="/quiz" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Quiz />
                  </div>
                </Suspense>
              } />
              <Route path="/timed-quiz" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <TimedQuiz />
                  </div>
                </Suspense>
              } />
              <Route path="/math" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Math />
                  </div>
                </Suspense>
              } />
              <Route path="/auth" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Auth />
                  </div>
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <About />
                  </div>
                </Suspense>
              } />
              <Route path="/mission" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Mission />
                  </div>
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <FAQ />
                  </div>
                </Suspense>
              } />
              <Route path="/contact" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Contact />
                  </div>
                </Suspense>
              } />
              <Route path="/privacy" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Privacy />
                  </div>
                </Suspense>
              } />
              <Route path="/terms" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Terms />
                  </div>
                </Suspense>
              } />
              <Route path="/dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Dashboard />
                  </div>
                </Suspense>
              } />
              <Route path="/analytics" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Analytics />
                  </div>
                </Suspense>
              } />
              <Route path="/admin/generate-explanations" element={
                <Suspense fallback={<PageLoader />}>
                  <GenerateExplanations />
                </Suspense>
              } />
              <Route path="/reading-practice" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <ReadingPractice />
                  </div>
                </Suspense>
              } />
              <Route path="/reading-practice/:setId" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <ReadingPracticeQuiz />
                  </div>
                </Suspense>
              } />
              <Route path="/sat-suite" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <SatSuite />
                  </div>
                </Suspense>
              } />
              <Route path="/sat-suite/quiz" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <Quiz />
                  </div>
                </Suspense>
              } />

              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="animate-in">
                    <NotFound />
                  </div>
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;