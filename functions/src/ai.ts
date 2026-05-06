import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY');

function client() {
  return new Anthropic({ apiKey: ANTHROPIC_KEY.value() });
}

// Per-user rate limit (Firestore counter)
async function rateLimit(uid: string, key: string, max: number, windowMs: number) {
  const db = getFirestore();
  const ref = db.doc(`rateLimits/${uid}_${key}`);
  const now = Date.now();
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? (snap.data() as { count: number; resetAt: number }) : { count: 0, resetAt: now + windowMs };
    if (cur.resetAt < now) {
      tx.set(ref, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }
    if (cur.count >= max) return { ok: false };
    tx.update(ref, { count: cur.count + 1 });
    return { ok: true };
  });
  if (!result.ok) throw new HttpsError('resource-exhausted', 'Too many requests, slow down.');
}

interface LessonDoc {
  title: string;
  content: string;
  type: 'video' | 'text' | 'quiz';
  courseId: string;
  moduleId: string;
}

async function loadLesson(lessonId: string): Promise<{ courseId: string; lesson: LessonDoc }> {
  const db = getFirestore();
  // Lesson IDs are doc IDs at courses/<c>/modules/<m>/lessons/<l>. We've encoded c_m_l as id.
  const parts = lessonId.split('_l')[0]!.split('_m');
  const courseId = parts[0]!;
  const moduleId = `${courseId}_m${parts[1]}`;
  const ref = db.doc(`courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Lesson not found.');
  return { courseId, lesson: snap.data() as LessonDoc };
}

export const aiSummarizeLesson = onCall({ secrets: [ANTHROPIC_KEY] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in.');
  await rateLimit(req.auth.uid, 'summarize', 60, 60 * 60_000);
  const { lessonId } = req.data as { lessonId: string };

  const db = getFirestore();
  const cacheRef = db.doc(`aiSummaries/${lessonId}`);
  const cached = await cacheRef.get();
  if (cached.exists) return { bullets: cached.get('bullets') };

  const { lesson } = await loadLesson(lessonId);
  const c = client();
  const resp = await c.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    system: [
      {
        type: 'text',
        text: 'You produce a 3-bullet TL;DR of a course lesson. Each bullet is one short sentence, no fluff, no preamble.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Lesson: ${lesson.title}\n\n${lesson.content}\n\nReturn EXACTLY three bullets, one per line, no leading dashes or numbers.`,
      },
    ],
  });
  const text = resp.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n');
  const bullets = text
    .split('\n')
    .map((s: string) => s.replace(/^[-\d.)]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
  await cacheRef.set({ bullets, createdAt: FieldValue.serverTimestamp(), lessonId });
  return { bullets };
});

// Streaming study buddy via raw HTTPS so we can stream chunks back to the browser
export const aiStudyBuddyStream = onRequest({ secrets: [ANTHROPIC_KEY], cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }
  const { lessonId, history } = req.body as {
    lessonId: string;
    history: { role: 'user' | 'assistant'; content: string }[];
  };
  const { lesson } = await loadLesson(lessonId);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  const c = client();
  const stream = c.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: [
      {
        type: 'text',
        text: `You are a study companion for the CourseStack lesson titled "${lesson.title}". Answer in plain prose, plain speech. Reference the lesson directly when helpful. Push back when the user is wrong. Don't repeat the lesson — extend it.\n\nLESSON CONTENT:\n${lesson.content}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: history.map((h) => ({ role: h.role, content: h.content })),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      res.write(event.delta.text);
    }
  }
  res.end();
});

export const aiCourseOutline = onCall({ secrets: [ANTHROPIC_KEY] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in.');
  await rateLimit(req.auth.uid, 'outline', 20, 60 * 60_000);
  const db = getFirestore();
  const me = await db.doc(`users/${req.auth.uid}`).get();
  const roles = (me.get('roles') as string[] | undefined) ?? [];
  if (!roles.includes('instructor') && !roles.includes('admin')) {
    throw new HttpsError('permission-denied', 'Instructors only.');
  }

  const { topic, audience } = req.data as { topic: string; audience: string };
  const c = client();
  const resp = await c.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    system: [
      {
        type: 'text',
        text:
          'You design course outlines for CourseStack — a magazine-quality online education platform. Output ONLY valid JSON matching this shape: {"title": string, "modules": Array<{"title": string, "lessons": Array<{"title": string, "type": "video"|"text"|"quiz", "durationMinutes": number}>}>}. 2 to 4 modules. 3 to 6 lessons per module. End every module with a quiz. No prose around the JSON.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Topic: ${topic}\nAudience: ${audience}\n\nReturn the outline as JSON only.`,
      },
    ],
  });
  const text = resp.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new HttpsError('internal', 'Bad model output.');
  return JSON.parse(match[0]);
});
