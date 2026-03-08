import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateExplanation(apiKey: string, q: any): Promise<string> {
  const prompt = `You are an expert SAT tutor. Write a detailed explanation (3-5 sentences) for this SAT inference question.

Passage: ${q.content.passage}
Question: ${q.content.question}
Options: ${q.content.options.join(' | ')}
Correct Answer: ${q.solution.answer}

Explain: 1) Key passage info leading to the answer 2) Why correct answer follows logically 3) Why other options fail. Use clear student-friendly language. Return ONLY the explanation.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 350,
    }),
  });

  if (!response.ok) {
    console.error(`Failed for question ${q.id}: ${response.status}`);
    return q.solution.explanation;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || q.solution.explanation;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchStart = 0, batchSize = 15, dataUrl } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch the questions from the provided URL or use inline questions
    let questions: any[];
    if (dataUrl) {
      const resp = await fetch(dataUrl);
      const data = await resp.json();
      questions = data.questions;
    } else {
      throw new Error("dataUrl is required");
    }

    const batch = questions.slice(batchStart, batchStart + batchSize);
    const results = [];

    // Process 5 at a time
    for (let i = 0; i < batch.length; i += 5) {
      const chunk = batch.slice(i, i + 5);
      const chunkResults = await Promise.all(
        chunk.map(async (q: any) => {
          const explanation = await generateExplanation(apiKey, q);
          return { id: q.id, explanation };
        })
      );
      results.push(...chunkResults);
    }

    console.log(`Processed questions ${batchStart + 1}-${batchStart + batch.length} of ${questions.length}`);

    return new Response(JSON.stringify({ results, total: questions.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
