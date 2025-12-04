export function normalizeQuestion(q: any) {
  let passage = q.passage || "";
  let questionText = "";
  let options: any = {};

  // ------------------ CASE 2: options array exists ------------------
  if (Array.isArray(q.options)) {
    questionText = (q.question || "").trim();

    q.options.forEach((opt: string) => {
      const letter = opt.trim()[0];       // "A" from "A) ..."
      const text = opt.slice(2).trim();   // text after "A)"
      options[letter] = text;
    });

    return { passage, questionText, options };
  }

  // ------------------ CASE 1: extract from question string ------------------
  const raw = q.question || "";
  
  // universal option regex for SAT formats
  const optionRegex = /([A-D])\)\s*(.+?)(?=(?:[A-D]\)|$))/gs;
  const matches = [...raw.matchAll(optionRegex)];

  if (matches.length >= 2) {
    const firstIndex = matches[0].index!;
    questionText = raw.substring(0, firstIndex).trim();

    matches.forEach((m) => {
      const letter = m[1];
      const text = m[2].trim();
      options[letter] = text;
    });
  } else {
    // fallback: treat as question only
    questionText = raw.trim();
  }

  return { passage, questionText, options };
}
