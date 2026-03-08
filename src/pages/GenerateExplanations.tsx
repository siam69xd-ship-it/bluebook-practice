import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DatasetType = 'inference' | 'areas_volumes';

const DATASETS: Record<DatasetType, { label: string; path: string; filename: string }> = {
  inference: { label: 'Inference (English)', path: '/data/inference.json', filename: 'inference.json' },
  areas_volumes: { label: 'Areas & Volumes (Math)', path: '/data/math/areas_volumes.json', filename: 'areas_volumes.json' },
};

export default function GenerateExplanations() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [dataset, setDataset] = useState<DatasetType>('areas_volumes');

  const processAllQuestions = async () => {
    setStatus('loading');
    const cfg = DATASETS[dataset];

    const resp = await fetch(cfg.path);
    const data = await resp.json();
    const questions = data.questions;

    const allResults: Record<string, string> = {};
    const batchSize = 10;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);

      let body: any;
      if (dataset === 'areas_volumes') {
        body = {
          mode: 'math',
          questions: batch.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        };
      } else {
        body = {
          questions: batch.map((q: any) => ({
            id: q.id,
            p: q.content.passage,
            q: q.content.question,
            o: q.content.options,
            a: q.solution.answer,
          })),
        };
      }

      setProgress(`Processing questions ${i + 1}-${Math.min(i + batchSize, questions.length)} of ${questions.length}...`);

      try {
        const { data: result, error } = await supabase.functions.invoke('generate-explanations', { body });
        if (error) throw error;

        for (const r of result.results) {
          allResults[String(r.id)] = r.explanation;
        }
      } catch (err: any) {
        setProgress(`Error at batch ${i}: ${err.message}. Retrying in 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          const { data: result } = await supabase.functions.invoke('generate-explanations', { body });
          if (result) {
            for (const r of result.results) {
              allResults[String(r.id)] = r.explanation;
            }
          }
        } catch {
          setProgress(`Skipped batch starting at ${i}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update explanations in the data
    for (const q of data.questions) {
      const key = String(q.id);
      if (allResults[key]) {
        if (dataset === 'areas_volumes') {
          q.explanation = allResults[key];
        } else {
          q.solution.explanation = allResults[key];
        }
      }
    }

    setResults(allResults);
    setStatus('done');

    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cfg.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Detailed Explanations</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Dataset</label>
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value as DatasetType)}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
          disabled={status === 'loading'}
        >
          {Object.entries(DATASETS).map(([key, val]) => (
            <option key={key} value={key}>{val.label} </option>
          ))}
        </select>
      </div>

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
            Replace the original file with the downloaded one.
          </p>
        </div>
      )}
    </div>
  );
}
