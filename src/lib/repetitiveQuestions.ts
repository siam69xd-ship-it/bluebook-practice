export interface RepetitiveVersion {
  version: number;
  passage: string;
  prompt: string;
  options: string[];
  answer: string;
  changes: string;
  topic: string;
}

export interface RepetitiveTemplate {
  id: number;
  title: string;
  versions: RepetitiveVersion[];
}

let cache: RepetitiveTemplate[] | null = null;
let inflight: Promise<RepetitiveTemplate[]> | null = null;

export async function loadRepetitiveTemplates(): Promise<RepetitiveTemplate[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = fetch('/data/repetitive/templates.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((data: RepetitiveTemplate[]) => {
      cache = Array.isArray(data) ? data : [];
      return cache;
    })
    .catch(() => {
      cache = [];
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function totalVersions(templates: RepetitiveTemplate[]): number {
  return templates.reduce((acc, t) => acc + t.versions.length, 0);
}
