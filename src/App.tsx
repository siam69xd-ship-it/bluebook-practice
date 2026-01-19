import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Eagerly load Index for fastest initial render
import Index from "./pages/Index";

// Lazy load other pages for faster initial bundle
const Practice = lazy(() => import("./pages/Practice"));
const Quiz = lazy(() => import("./pages/Quiz"));
const TimedQuiz = lazy(() => import("./pages/TimedQuiz"));
const Math = lazy(() => import("./pages/Math"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Minimal loading fallback for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
  </div>
);

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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/practice" element={
                <Suspense fallback={<PageLoader />}>
                  <Practice />
                </Suspense>
              } />
              <Route path="/quiz" element={
                <Suspense fallback={<PageLoader />}>
                  <Quiz />
                </Suspense>
              } />
              <Route path="/timed-quiz" element={
                <Suspense fallback={<PageLoader />}>
                  <TimedQuiz />
                </Suspense>
              } />
              <Route path="/math" element={
                <Suspense fallback={<PageLoader />}>
                  <Math />
                </Suspense>
              } />
              <Route path="/auth" element={
                <Suspense fallback={<PageLoader />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
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