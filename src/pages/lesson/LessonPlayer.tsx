import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  ListChecks,
  Lock,
  PlayCircle,
  Sparkles,
  StickyNote,
  X,
  MessageCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { canAccessLesson, scoreQuiz } from '@/lib/access';
import { cn, formatMinutes } from '@/lib/utils';
import { generateCourseOutline as _g, streamStudyBuddy, summarizeLesson } from '@/lib/ai';
import type { ChatMessage, Lesson } from '@/types';

void _g;

export function LessonPlayer() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const course = slug ? demoStore.getCourse(slug) : null;

  const flat = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons.map((l) => ({ lesson: l, module: m })));
  }, [course]);

  const idx = flat.findIndex((x) => x.lesson.id === lessonId);
  const cur = idx >= 0 ? flat[idx] : null;
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  if (!course || !cur) {
    return (
      <div className="mx-auto max-w-2xl p-12">
        <p className="eyebrow">Lesson not found</p>
        <h1 className="mt-2 font-display text-title1">Looking somewhere else?</h1>
        <Button asChild className="mt-6"><Link to="/catalog">Back to catalog</Link></Button>
      </div>
    );
  }

  const access = canAccessLesson(user, course, cur.lesson);
  const progress = user ? demoStore.getProgress(user.id, course.id) : null;
  const completedSet = new Set(progress?.completedLessonIds ?? []);

  useEffect(() => {
    if (user && access) {
      if (!progress) demoStore.enroll(user.id, course.id);
      demoStore.setLastLesson(user.id, course.id, cur.lesson.id);
    }
  }, [user, access, progress, course.id, cur.lesson.id]);

  if (!access) {
    return (
      <div className="mx-auto max-w-2xl p-12">
        <p className="eyebrow">Locked</p>
        <h1 className="mt-2 font-display text-title1">This lesson is on a higher tier.</h1>
        <p className="mt-3 text-body text-ink-soft">
          Upgrade your subscription to read it. The first lesson of every course is free.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="terra"><Link to="/account/billing">See plans</Link></Button>
          <Button asChild variant="outline"><Link to={`/courses/${course.slug}`}>Back to outline</Link></Button>
        </div>
      </div>
    );
  }

  function markComplete() {
    if (!user) return;
    demoStore.markLessonComplete(user.id, course!.id, cur!.lesson.id);
    toast.success('Lesson complete.');
    if (next) nav(`/learn/${course!.slug}/${next.lesson.id}`);
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-rule bg-paper px-4 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/courses/${course.slug}`}>
            <ArrowLeft className="size-4" /> Outline
          </Link>
        </Button>
        <Separator />
        <p className="hidden truncate text-caption text-ink-mute md:block">
          <span className="font-medium text-ink">{course.title}</span> · {cur.module.title}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="num">
            {idx + 1} / {flat.length}
          </Badge>
        </div>
      </header>

      {/* Layout */}
      <div className="grid lg:grid-cols-[300px_1fr]">
        <SidebarOutline course={course} currentId={cur.lesson.id} completed={completedSet} />

        <div className="min-w-0 px-5 py-8 md:px-10 md:py-12">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">{cur.module.title}</p>
            <h1 className="mt-2 font-display text-largeTitle leading-tight xl:text-display">{cur.lesson.title}</h1>
            <p className="mt-3 text-caption num text-ink-mute">{formatMinutes(cur.lesson.durationMinutes)} · {cur.lesson.type}</p>

            <div className="mt-10">
              <LessonBody lesson={cur.lesson} courseId={course.id} userId={user?.id} onPass={markComplete} />
            </div>

            {/* Footer nav */}
            <footer className="mt-16 flex items-center justify-between gap-3 border-t border-rule pt-6">
              {prev ? (
                <Button asChild variant="ghost" className="min-w-0 max-w-[40%] sm:max-w-[50%]">
                  <Link to={`/learn/${course.slug}/${prev.lesson.id}`} className="min-w-0">
                    <ChevronLeft className="size-4 flex-shrink-0" />
                    <span className="hidden truncate sm:inline">{prev.lesson.title}</span>
                  </Link>
                </Button>
              ) : <div />}
              <div className="flex items-center gap-3">
                {!completedSet.has(cur.lesson.id) && cur.lesson.type !== 'quiz' && (
                  <Button variant="outline" onClick={markComplete}>
                    <Check className="size-4" /> Mark complete
                  </Button>
                )}
                {next && (
                  <Button variant="terra" asChild>
                    <Link to={`/learn/${course.slug}/${next.lesson.id}`}>
                      Next <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </footer>
          </div>
        </div>
      </div>

      <ToolDock lesson={cur.lesson} courseId={course.id} userId={user?.id} />
    </div>
  );
}

function Separator() {
  return <span className="hidden h-6 w-px bg-rule md:block" />;
}

function SidebarOutline({
  course,
  currentId,
  completed,
}: {
  course: NonNullable<ReturnType<typeof demoStore.getCourse>>;
  currentId: string;
  completed: Set<string>;
}) {
  return (
    <aside className="hidden border-r border-rule bg-paper-soft py-6 lg:block lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:sticky lg:top-14" data-tour="lesson-tree">
      <p className="eyebrow px-6">Outline</p>
      <p className="mt-1 px-6 font-display text-title3 leading-tight">{course.title}</p>
      <div className="mt-4">
        <Progress
          value={
            completed.size === 0
              ? 0
              : (Array.from(completed).filter((id) =>
                  course.modules.some((m) => m.lessons.some((l) => l.id === id)),
                ).length /
                  course.totalLessons) *
                100
          }
          className="mx-6"
        />
      </div>
      <nav className="mt-6">
        {course.modules.map((m, mi) => (
          <div key={m.id} className="mt-2">
            <p className="px-6 py-2 text-caption uppercase tracking-[0.06em] text-ink-mute num">
              {String(mi + 1).padStart(2, '0')} · {m.title}
            </p>
            <ul>
              {m.lessons.map((l) => {
                const isCur = l.id === currentId;
                const done = completed.has(l.id);
                const Icon = l.type === 'video' ? PlayCircle : l.type === 'quiz' ? ListChecks : FileText;
                return (
                  <li key={l.id}>
                    <Link
                      to={`/learn/${course.slug}/${l.id}`}
                      className={cn(
                        'flex items-center gap-3 px-6 py-2 text-footnote',
                        isCur ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper',
                      )}
                    >
                      <span className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
                        isCur ? 'border-paper text-paper' : done ? 'border-success text-success' : 'border-rule text-ink-mute',
                      )}>
                        {done ? <Check className="size-3" /> : <Icon className="size-3" />}
                      </span>
                      <span className="line-clamp-2">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function LessonBody({
  lesson,
  courseId,
  userId,
  onPass,
}: {
  lesson: Lesson;
  courseId: string;
  userId?: string;
  onPass: () => void;
}) {
  if (lesson.type === 'video') return <VideoLesson lesson={lesson} courseId={courseId} userId={userId} />;
  if (lesson.type === 'quiz') return <QuizLesson lesson={lesson} onPass={onPass} />;
  return <TextLesson lesson={lesson} />;
}

function TextLesson({ lesson }: { lesson: Lesson }) {
  return (
    <article className="editorial-prose text-body" data-tour="lesson-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
    </article>
  );
}

function VideoLesson({ lesson, courseId, userId }: { lesson: Lesson; courseId: string; userId?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current || !userId) return;
    const startAt = demoStore.getProgress(userId, courseId)?.videoPositions[lesson.id];
    if (typeof startAt === 'number') {
      try { ref.current.currentTime = startAt; } catch { /* ignore */ }
    }
  }, [userId, courseId, lesson.id]);

  useEffect(() => {
    if (!userId) return;
    const v = ref.current;
    if (!v) return;
    const id = setInterval(() => {
      if (!v.paused && !v.ended) {
        demoStore.setVideoPosition(userId, courseId, lesson.id, Math.floor(v.currentTime));
      }
    }, 10000);
    const onPause = () => demoStore.setVideoPosition(userId, courseId, lesson.id, Math.floor(v.currentTime));
    v.addEventListener('pause', onPause);
    return () => {
      clearInterval(id);
      v.removeEventListener('pause', onPause);
    };
  }, [userId, courseId, lesson.id]);

  return (
    <div data-tour="lesson-body">
      <video
        ref={ref}
        src={lesson.videoUrl}
        controls
        autoPlay
        muted
        playsInline
        className="aspect-video w-full rounded-md bg-ink"
      >
        Your browser does not support the video tag.
      </video>
      {lesson.content && (
        <article className="editorial-prose mt-8 text-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}

function QuizLesson({ lesson, onPass }: { lesson: Lesson; onPass: () => void }) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const result = scoreQuiz(lesson, { selected });

  return (
    <div className="space-y-8" data-tour="lesson-body">
      {lesson.questions?.map((q, qi) => (
        <fieldset key={q.id} className="rounded-md border border-rule bg-paper-soft p-6">
          <legend className="px-2 eyebrow num">Question {qi + 1}</legend>
          <p className="mt-2 font-display text-title3 leading-snug">{q.prompt}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => {
              const isSel = selected[q.id] === i;
              const isCorrect = i === q.correctIndex;
              const showResult = submitted && isSel;
              return (
                <label
                  key={i}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors',
                    submitted
                      ? isCorrect
                        ? 'border-success bg-success/10'
                        : showResult
                        ? 'border-danger bg-danger/10'
                        : 'border-rule'
                      : isSel
                      ? 'border-ink bg-paper'
                      : 'border-rule hover:border-ink',
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="mt-1"
                    checked={isSel}
                    disabled={submitted}
                    onChange={() => setSelected({ ...selected, [q.id]: i })}
                  />
                  <span className="text-body">{opt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!submitted ? (
        <Button
          variant="terra"
          size="lg"
          onClick={() => {
            setSubmitted(true);
            const r = scoreQuiz(lesson, { selected });
            if (r.passed) onPass();
            else toast.error(`Score ${(r.score * 100).toFixed(0)}% — need 70% to pass. Try again.`);
          }}
          disabled={Object.keys(selected).length !== (lesson.questions?.length ?? 0)}
        >
          Submit answers
        </Button>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-rule bg-paper-soft px-5 py-4">
          <p className="text-body">
            <span className="num font-medium">{result.correct} / {result.total}</span> · {result.passed ? 'Passed.' : 'Not yet — review and retry.'}
          </p>
          {!result.passed && (
            <Button variant="outline" onClick={() => { setSelected({}); setSubmitted(false); }}>Retry</Button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Right-side tool dock: AI buddy, summarizer, notes ----------

function ToolDock({ lesson, courseId, userId }: { lesson: Lesson; courseId: string; userId?: string }) {
  const [open, setOpen] = useState<'buddy' | 'summary' | 'notes' | null>(null);
  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2" data-tour="lesson-tools">
        <Button variant="default" size="icon" onClick={() => setOpen(open === 'buddy' ? null : 'buddy')} title="AI study buddy">
          <MessageCircle className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setOpen(open === 'summary' ? null : 'summary')} title="Summarize">
          <Sparkles className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setOpen(open === 'notes' ? null : 'notes')} title="Notes">
          <StickyNote className="size-4" />
        </Button>
      </div>
      <AnimatePresence>
        {open === 'buddy' && (
          <BuddyDrawer key="buddy" lesson={lesson} onClose={() => setOpen(null)} />
        )}
        {open === 'summary' && (
          <SummaryDrawer key="sum" lesson={lesson} onClose={() => setOpen(null)} />
        )}
        {open === 'notes' && userId && (
          <NotesDrawer key="notes" lesson={lesson} userId={userId} courseId={courseId} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-rule bg-paper shadow-2xl"
    >
      <header className="flex items-start justify-between gap-4 border-b border-rule p-5">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 font-display text-title2 leading-tight">{title}</h2>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-paper-deep" aria-label="Close">
          <X className="size-4" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </motion.aside>
  );
}

function SummaryDrawer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    summarizeLesson(lesson)
      .then((b) => { if (!stale) setBullets(b); })
      .catch(() => { if (!stale) toast.error('Could not summarize.'); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [lesson.id]);

  return (
    <DrawerShell eyebrow="Summarizer · Haiku 4.5" title="The 30-second TL;DR" onClose={onClose}>
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-3 animate-pulse rounded bg-paper-deep" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-paper-deep" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-paper-deep" />
          </div>
        ) : (
          <ol className="space-y-4">
            {bullets?.map((b, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-display text-title2 leading-none num text-terra">{i + 1}</span>
                <p className="text-body leading-relaxed">{b}</p>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-8 text-caption text-ink-mute">
          Cached after first generation. Subsequent loads are free for everyone.
        </p>
      </div>
    </DrawerShell>
  );
}

function BuddyDrawer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Reading along with you. Ask me anything about "${lesson.title}" — I have the full lesson in context.`,
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 9e6, behavior: 'smooth' });
  }, [messages.length, streaming]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const u: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: text, createdAt: Date.now() };
    const aid = `a_${Date.now()}`;
    setMessages((m) => [...m, u, { id: aid, role: 'assistant', content: '', createdAt: Date.now() }]);
    setInput('');
    setStreaming(true);
    try {
      const history = [...messages.filter((m) => m.id !== 'init'), u].map((m) => ({ role: m.role, content: m.content }));
      let acc = '';
      for await (const chunk of streamStudyBuddy(lesson, history)) {
        if (chunk.done) break;
        acc += chunk.text;
        setMessages((m) => m.map((x) => (x.id === aid ? { ...x, content: acc } : x)));
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <DrawerShell eyebrow="Study buddy · Sonnet 4.6" title="Talk through it." onClose={onClose}>
      <div className="flex h-full flex-col">
        <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-md px-3.5 py-2.5 text-body leading-relaxed',
                  m.role === 'user' ? 'bg-ink text-paper' : 'bg-paper-soft border border-rule text-ink',
                )}
              >
                {m.content}
                {streaming && m.role === 'assistant' && m.id === messages[messages.length - 1]?.id && (
                  <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-terra align-middle" />
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t border-rule bg-paper-soft p-3"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the lesson…"
            className="min-h-16 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-caption text-ink-mute">Press Enter to send · Shift+Enter for newline</p>
            <Button size="sm" variant="terra" type="submit" disabled={streaming || !input.trim()}>
              <ArrowRight className="size-3.5" /> Send
            </Button>
          </div>
        </form>
      </div>
    </DrawerShell>
  );
}

function NotesDrawer({
  lesson,
  userId,
  courseId: _c,
  onClose,
}: {
  lesson: Lesson;
  userId: string;
  courseId: string;
  onClose: () => void;
}) {
  const existing = demoStore.listNotes(userId, lesson.id);
  const [body, setBody] = useState(existing[0]?.body ?? '');
  const noteId = existing[0]?.id;
  void _c;
  return (
    <DrawerShell eyebrow="Notes" title="Write it down." onClose={onClose}>
      <div className="flex h-full flex-col">
        <div className="flex-1 p-5">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What stood out from this lesson?"
            className="min-h-72 leading-relaxed"
          />
          <p className="mt-2 text-caption text-ink-mute">Notes are saved to your account, scoped to this lesson.</p>
        </div>
        <footer className="flex items-center justify-between border-t border-rule bg-paper-soft p-3">
          {noteId ? (
            <Button variant="ghost" size="sm" onClick={() => { demoStore.deleteNote(noteId); toast.success('Note deleted.'); onClose(); }}>
              Delete
            </Button>
          ) : <span />}
          <Button
            variant="terra"
            size="sm"
            onClick={() => {
              demoStore.saveNote({ id: noteId, userId, lessonId: lesson.id, body });
              toast.success('Saved.');
            }}
          >
            Save
          </Button>
        </footer>
      </div>
    </DrawerShell>
  );
}

// unused-warning helper for Lock import
void Lock;
