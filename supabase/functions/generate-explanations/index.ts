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
    const { questions, mode } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    let prompt: string;

    if (mode === "math") {
      const questionsText = questions.map((q: any) =>
        `Q${q.id}: ${q.question}\nOptions: ${q.options.join(' | ')}\nCorrect Answer: ${q.answer}`
      ).join('\n\n---\n\n');

      prompt = `You are an expert SAT Math tutor. For each question below, write a DETAILED step-by-step explanation (5-8 sentences). Your explanation MUST include:

1. **Formula Used**: State the exact formula needed (e.g., V = πr²h, A = πr², SA = 2πrh + 2πr²). Write it clearly.
2. **Variable Definitions**: Define what each variable represents in context (e.g., "where r = 5 inches is the radius, h = 6 inches is the height").
3. **Step-by-step Substitution**: Show plugging values into the formula step by step.
4. **Simplification**: Show the arithmetic/algebraic simplification clearly.
5. **Why other options are wrong**: Briefly explain common mistakes that lead to wrong answers (e.g., "Option A uses diameter instead of radius", "Option B forgot to square the radius").

Use LaTeX notation with $...$ for inline math and $$...$$ for display equations. Use \\frac{}{}, \\pi, \\sqrt{}, etc.

Format your response as JSON array: [{"id":1,"explanation":"..."},{"id":2,"explanation":"..."}]
IMPORTANT: Return ONLY the JSON array, no markdown code blocks.

${questionsText}`;
    } else {
      // Original inference mode
      const questionsText = questions.map((q: any) =>
        `Q${q.id}: Passage: ${q.p}\nQuestion: ${q.q}\nOptions: ${q.o.join(' | ')}\nAnswer: ${q.a}`
      ).join('\n\n---\n\n');

      prompt = `You are an expert SAT tutor. For each question below, write a detailed explanation (3-5 sentences). 
Explain: 1) Key passage info 2) Why the answer is correct 3) Why others fail.

Format your response as JSON array: [{"id":"1","explanation":"..."},{"id":"2","explanation":"..."}]

${questionsText}`;
    }

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
        max_tokens: 12000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please wait and retry." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "[]";
    
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) content = jsonMatch[1].trim();
    
    const results = JSON.parse(content);

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
