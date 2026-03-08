import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const results = [];

    // Process questions in batches of 5
    for (let i = 0; i < questions.length; i += 5) {
      const batch = questions.slice(i, i + 5);
      
      const batchPromises = batch.map(async (q: any) => {
        const prompt = `You are an expert SAT tutor. Generate a detailed, educational explanation for this SAT Reading & Writing inference question.

Question ID: ${q.id}
Passage: ${q.content.passage}
Question: ${q.content.question}
Options:
${q.content.options.join('\n')}
Correct Answer: ${q.solution.answer}

Write a detailed explanation (3-5 sentences) that:
1. Identifies the key information in the passage that leads to the answer
2. Explains WHY the correct answer logically follows from the passage
3. Briefly explains why the other options are incorrect or less supported
4. Uses clear, student-friendly language

Return ONLY the explanation text, no prefixes or labels.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          console.error(`Failed for question ${q.id}: ${response.status}`);
          return { id: q.id, explanation: q.solution.explanation };
        }

        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content?.trim() || q.solution.explanation;
        return { id: q.id, explanation };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      console.log(`Processed ${Math.min(i + 5, questions.length)}/${questions.length}`);
    }

    return new Response(JSON.stringify({ results }), {
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
