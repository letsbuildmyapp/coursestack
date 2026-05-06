import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { generateCourseOutline, type OutlineDraft } from '@/lib/ai';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import type { Course, Lesson, Module } from '@/types';

export function NewCourse() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [draft, setDraft] = useState<OutlineDraft | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function generate() {
    if (!topic.trim()) return toast.error('Add a topic first.');
    setLoading(true);
    try {
      const d = await generateCourseOutline(topic, audience);
      setDraft(d);
      toast.success('Outline ready. Edit before saving.');
    } catch {
      toast.error('Generation failed.');
    } finally {
      setLoading(false);
    }
  }

  function commit() {
    if (!draft) return;
    const courseId = `c_${slugify(draft.title)}_${Date.now().toString(36).slice(-4)}`;
    const modules: Module[] = draft.modules.map((m, mi) => {
      const moduleId = `${courseId}_m${mi}`;
      const lessons: Lesson[] = m.lessons.map((l, li) => {
        const id = `${moduleId}_l${li}`;
        return {
          id,
          courseId,
          moduleId,
          title: l.title,
          order: li,
          type: l.type,
          content: l.type === 'text' ? '## Lesson body\n\nWrite your lesson here.' : '',
          videoUrl: l.type === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' : undefined,
          questions: l.type === 'quiz' ? [{ id: `q_${id}`, prompt: 'Sample', options: ['A', 'B', 'C'], correctIndex: 0 }] : undefined,
          durationMinutes: l.durationMinutes,
          isFreePreview: mi === 0 && li === 0,
        };
      });
      return { id: moduleId, courseId, title: m.title, order: mi, lessons };
    });
    const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
    const estimatedMinutes = modules.reduce((a, m) => a + m.lessons.reduce((s, l) => s + l.durationMinutes, 0), 0);
    const c: Course = {
      id: courseId,
      slug: slugify(draft.title),
      title: draft.title,
      subtitle: '',
      description: `A working professional's guide to ${draft.title.toLowerCase()}.`,
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80&auto=format&fit=crop',
      instructorId: user!.id,
      instructorName: user!.displayName,
      tier: 'pro',
      tags: [topic.split(' ')[0]?.toLowerCase() ?? 'new'],
      topic: 'business',
      published: false,
      rating: 0,
      enrollmentCount: 0,
      totalLessons,
      estimatedMinutes,
      createdAt: Date.now(),
      modules,
    };
    demoStore.upsertCourse(c);
    toast.success('Course created — opening editor.');
    nav(`/instructor/${c.id}`);
  }

  return (
    <AppShell pageEyebrow="New course · AI assist">
      <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
        <div>
          <h1 className="font-display text-largeTitle leading-tight">Outline a course in a minute.</h1>
          <p className="mt-2 text-body text-ink-soft">
            Tell the assistant the topic and the reader. It drafts a 2–4 module outline using <code className="text-ink">claude-opus-4-7</code>. You review, edit, and one-click create the structure.
          </p>

          <div className="mt-6 space-y-4 rounded-md border border-rule bg-paper-soft p-5" data-tour="outline-input">
            <div>
              <label className="text-footnote text-ink-soft">Topic</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Negotiation for engineers" className="mt-1.5" />
            </div>
            <div>
              <label className="text-footnote text-ink-soft">Audience</label>
              <Textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="mt-1.5"
                placeholder="Senior ICs at Series-B startups looking to lead larger projects"
              />
            </div>
            <Button variant="terra" size="lg" className="w-full" disabled={loading} onClick={generate}>
              <Wand2 className="size-4" /> {loading ? 'Drafting…' : 'Draft outline'}
            </Button>
          </div>
        </div>

        <div data-tour="outline-output">
          {draft ? (
            <div className="rounded-md border border-rule bg-paper-soft p-6">
              <div className="flex items-center justify-between">
                <Badge variant="terra"><Sparkles className="size-3" /> Draft</Badge>
                <Button variant="terra" onClick={commit}>Create this course</Button>
              </div>
              <h2 className="mt-4 font-display text-title1 leading-tight">{draft.title}</h2>
              <ol className="mt-6 space-y-4">
                {draft.modules.map((m, mi) => (
                  <li key={mi} className="rounded-md border border-rule bg-paper p-4">
                    <p className="eyebrow num">Module {String(mi + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1 font-display text-title3 leading-tight">{m.title}</h3>
                    <ul className="mt-3 space-y-1.5 text-footnote">
                      {m.lessons.map((l, li) => (
                        <li key={li} className="flex items-center justify-between">
                          <span><span className="num text-ink-mute mr-2">{String(li + 1).padStart(2, '0')}</span>{l.title}</span>
                          <span className="text-caption text-ink-mute capitalize num">{l.type} · {l.durationMinutes}m</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="grid h-full place-items-center rounded-md border border-dashed border-rule p-12 text-center">
              <div>
                <Sparkles className="mx-auto size-8 text-terra" />
                <p className="mt-3 eyebrow">Outline preview</p>
                <p className="mt-2 max-w-xs text-footnote text-ink-mute">Generate from the left to populate this panel.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
