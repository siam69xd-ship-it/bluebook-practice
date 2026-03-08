import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function GenerateExplanations() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const processAllQuestions = async () => {
    setStatus('loading');
    
    // Load the inference questions
    const resp = await fetch('/data/inference.json');
    const data = await resp.json();
    const questions = data.questions;
    
    const allResults: Record<string, string> = {};
    const batchSize = 15;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize).map((q: any) => ({
        id: q.id,
        p: q.content.passage,
        q: q.content.question,
        o: q.content.options,
        a: q.solution.answer,
      }));
      
      setProgress(`Processing questions ${i + 1}-${Math.min(i + batchSize, questions.length)} of ${questions.length}...`);
      
      try {
        const { data: result, error } = await supabase.functions.invoke('generate-explanations', {
          body: { questions: batch },
        });
        
        if (error) throw error;
        
        for (const r of result.results) {
          allResults[r.id] = r.explanation;
        }
      } catch (err: any) {
        setProgress(`Error at batch ${i}: ${err.message}. Retrying...`);
        // Retry once
        try {
          const { data: result } = await supabase.functions.invoke('generate-explanations', {
            body: { questions: batch },
          });
          if (result) {
            for (const r of result.results) {
              allResults[r.id] = r.explanation;
            }
          }
        } catch {
          setProgress(`Skipped batch starting at ${i}`);
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Update the original data
    for (const q of data.questions) {
      if (allResults[q.id]) {
        q.solution.explanation = allResults[q.id];
      }
    }
    
    setResults(allResults);
    setStatus('done');
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inference.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Detailed Explanations</h1>
      <p className="mb-4 text-muted-foreground">
        This will process all 149 inference questions and generate detailed explanations using AI.
      </p>
      
      <button
        onClick={processAllQuestions}
        disabled={status === 'loading'}
        className="px-6 py-3 bg-foreground text-background rounded-lg font-medium disabled:opacity-50"
      >
        {status === 'loading' ? 'Processing...' : 'Generate All Explanations'}
      </button>
      
      {progress && <p className="mt-4 text-sm">{progress}</p>}
      
      {status === 'done' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✅ Done! Generated {Object.keys(results).length} explanations. File downloaded.
          </p>
          <p className="text-sm text-green-600 mt-1">
            Replace public/data/inference.json with the downloaded file.
          </p>
        </div>
      )}
    </div>
  );
}
