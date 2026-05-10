// AI client wrapper. In production this calls a Cloud Function which
// holds the LLM key and uses prompt caching. In demo mode we return a
// realistic-feeling local response so the UI works end-to-end without keys.

import type { Lesson } from '@/types';

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL ?? '';

export async function summarizeLesson(lesson: Lesson): Promise<string[]> {
  if (FUNCTIONS_BASE) {
    const r = await fetch(`${FUNCTIONS_BASE}/aiSummarizeLesson`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson.id }),
    });
    if (!r.ok) throw new Error('Summarizer failed.');
    const j = (await r.json()) as { bullets: string[] };
    return j.bullets;
  }
  // demo: derive a plausible 3-bullet TL;DR from the body
  await new Promise((r) => setTimeout(r, 850));
  const body = lesson.content;
  const sentences = body
    .replace(/[#>]/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 220);

  const pick = (i: number) => sentences[i] ?? sentences[sentences.length - 1] ?? lesson.title;
  const bullets = [
    pick(0),
    pick(Math.floor(sentences.length / 2)),
    pick(sentences.length - 2),
  ].map((s) => s.replace(/\*\*/g, ''));
  return bullets;
}

export interface ChatStreamChunk {
  text: string;
  done: boolean;
}

const DEMO_BUDDY_REPLIES = [
  'Good question. The lesson is making the case that the most reliable lever is the *consistency* of customer experience — receipts, tone, follow-ups — not the artifacts most teams obsess over.',
  'Quick answer: yes, exactly. The author\'s point is that the artifact you can change cheaply rarely moves the underlying perception. Spend that energy on the touchpoints customers actually read.',
  'A fair pushback. Two things the lesson doesn\'t fully address: (1) brands that *do* make a logo their identity, and (2) cases where the visual system is the product. Both are real exceptions.',
  'Try this: write three "voice rules" you want every customer email to follow. If two of your last five emails violate any of them, that\'s your real positioning gap.',
];

export async function* streamStudyBuddy(
  _lesson: Lesson,
  history: { role: 'user' | 'assistant'; content: string }[],
): AsyncGenerator<ChatStreamChunk, void, unknown> {
  if (FUNCTIONS_BASE) {
    const r = await fetch(`${FUNCTIONS_BASE}/aiStudyBuddyStream`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lessonId: _lesson.id, history }),
    });
    if (!r.body) throw new Error('No stream body.');
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) yield { text: decoder.decode(value), done: false };
    }
    yield { text: '', done: true };
    return;
  }

  // demo streaming
  const text =
    DEMO_BUDDY_REPLIES[history.filter((h) => h.role === 'user').length % DEMO_BUDDY_REPLIES.length];
  const words = text!.split(' ');
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
    yield { text: w + ' ', done: false };
  }
  yield { text: '', done: true };
}

export interface OutlineDraft {
  title: string;
  modules: { title: string; lessons: { title: string; type: 'video' | 'text' | 'quiz'; durationMinutes: number }[] }[];
}

export async function generateCourseOutline(topic: string, audience: string): Promise<OutlineDraft> {
  if (FUNCTIONS_BASE) {
    const r = await fetch(`${FUNCTIONS_BASE}/aiCourseOutline`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic, audience }),
    });
    if (!r.ok) throw new Error('Outline gen failed.');
    return (await r.json()) as OutlineDraft;
  }
  await new Promise((r) => setTimeout(r, 1400));
  const t = topic.trim() || 'Untitled Course';
  return {
    title: t,
    modules: [
      {
        title: 'Mindset before mechanics',
        lessons: [
          { title: `Why ${t} is misunderstood`, type: 'video', durationMinutes: 9 },
          { title: 'A working definition', type: 'text', durationMinutes: 11 },
          { title: 'Module check', type: 'quiz', durationMinutes: 5 },
        ],
      },
      {
        title: 'Core practice',
        lessons: [
          { title: `The first ${t} exercise`, type: 'video', durationMinutes: 14 },
          { title: 'Two failure modes to avoid', type: 'text', durationMinutes: 10 },
          { title: 'A walkthrough', type: 'video', durationMinutes: 18 },
        ],
      },
      {
        title: 'Putting it to work',
        lessons: [
          { title: `Adapting ${t} to ${audience || 'your context'}`, type: 'video', durationMinutes: 13 },
          { title: 'Templates and prompts', type: 'text', durationMinutes: 8 },
          { title: 'Final exam', type: 'quiz', durationMinutes: 8 },
        ],
      },
    ],
  };
}
