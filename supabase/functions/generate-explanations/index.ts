import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateExplanation(apiKey: string, q: any): Promise<string> {
  const prompt = `You are an expert SAT tutor. Generate a detailed explanation for this SAT inference question.

Passage: ${q.content.passage}
Question: ${q.content.question}
Options:
${q.content.options.join('\n')}
Correct Answer: ${q.solution.answer}

Write a detailed explanation (3-5 sentences) that:
1. Identifies key passage information leading to the answer
2. Explains WHY the correct answer logically follows
3. Briefly notes why other options fail
4. Uses clear, student-friendly language

Return ONLY the explanation text.`;

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
      max_tokens: 400,
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
    const { questions, batchStart = 0, batchSize = 15 } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const batch = questions.slice(batchStart, batchStart + batchSize);
    const results = [];

    // Process 5 at a time within the batch
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

    console.log(`Processed batch ${batchStart}-${batchStart + batch.length}`);

    return new Response(JSON.stringify({ results, processedCount: batch.length }), {
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
