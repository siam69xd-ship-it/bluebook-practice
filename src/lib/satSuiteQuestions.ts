import { Question } from './questionUtils';
import { Difficulty } from './difficultyData';

export interface SatSuiteTopicInfo {
  slug: string;
  topic: string;
  count: number;
  counts: { easy: number; medium: number; hard: number };
}

interface RawSatSuiteQuestion {
  id: string;
  sourceId: string;
  difficulty: Difficulty;
  passage: string;
  questionPrompt: string;
  options: { [key: string]: string };
  answer: string;
  explanation: string;
}

// Offset keeps SAT Suite question ids from colliding with the main bank
const ID_OFFSET = 900000;

let indexCache: SatSuiteTopicInfo[] | null = null;
let indexPromise: Promise<SatSuiteTopicInfo[]> | null = null;
const topicCache = new Map<string, Question[]>();
const topicPromises = new Map<string, Promise<Question[]>>();

export function loadSatSuiteIndex(): Promise<SatSuiteTopicInfo[]> {
  if (indexCache) return Promise.resolve(indexCache);
  if (indexPromise) return indexPromise;
  indexPromise = fetch('/data/satsuite/index.json')
    .then(r => r.json())
    .then((data: SatSuiteTopicInfo[]) => {
      indexCache = data;
      return data;
    })
    .catch(() => []);
  return indexPromise;
}

function cleanText(text: string): string {
  return (text || '').replace(/\s+\n/g, '\n').trim();
}

export function loadSatSuiteTopic(slug: string, slugIndex: number): Promise<Question[]> {
  const cached = topicCache.get(slug);
  if (cached) return Promise.resolve(cached);
  const inflight = topicPromises.get(slug);
  if (inflight) return inflight;

  const p = fetch(`/data/satsuite/${slug}.json`)
    .then(r => r.json())
    .then((data: { topic: string; questions: RawSatSuiteQuestion[] }) => {
      const questions: Question[] = data.questions.map((q, i) => {
        const passage = cleanText(q.passage);
        const prompt = cleanText(q.questionPrompt);
        return {
          id: ID_OFFSET + slugIndex * 5000 + i,
          sourceId: `SAT-${slug}-${q.id || i + 1}`,
          section: 'English',
          subSection: 'SAT Suite Question Bank',
          topic: data.topic,
          passage,
          questionPrompt: prompt,
          questionText: [passage, prompt].filter(Boolean).join('\n\n'),
          options: q.options || {},
          correctAnswer: q.answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        };
      });
      topicCache.set(slug, questions);
      return questions;
    })
    .catch(() => []);

  topicPromises.set(slug, p);
  return p;
}

export interface SatSuiteConfig {
  slugs: string[];
  difficulties: Difficulty[];
}

export async function getSatSuiteQuestions(config: SatSuiteConfig): Promise<Question[]> {
  const index = await loadSatSuiteIndex();
  const targets = config.slugs.length
    ? index.filter(t => config.slugs.includes(t.slug))
    : index;

  const groups = await Promise.all(
    targets.map(t => loadSatSuiteTopic(t.slug, index.findIndex(i => i.slug === t.slug)))
  );

  let all = groups.flat();
  if (config.difficulties.length && config.difficulties.length < 3) {
    all = all.filter(q => q.difficulty && config.difficulties.includes(q.difficulty));
  }
  return all;
}
