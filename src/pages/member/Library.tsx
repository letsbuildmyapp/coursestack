import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { formatMinutes } from '@/lib/utils';

export function Library() {
  const { user } = useAuth();
  if (!user) return null;
  const progress = demoStore.listProgressForUser(user.id);
  const inProgress = progress.filter((p) => !p.completedAt).sort((a, b) => b.lastViewedAt - a.lastViewedAt);
  const completed = progress.filter((p) => p.completedAt);

  return (
    <AppShell pageEyebrow="My library">
      <h1 className="font-display text-largeTitle leading-tight">Your library.</h1>

      <section className="mt-10">
        <p className="eyebrow">In progress</p>
        {inProgress.length === 0 ? (
          <p className="mt-3 text-footnote text-ink-mute">Nothing in progress yet.</p>
        ) : (
          <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2">
            {inProgress.map((p) => {
              const c = demoStore.getCourse(p.courseId);
              if (!c) return null;
              return (
                <Link to={`/courses/${c.slug}`} key={p.courseId} className="flex gap-4 bg-paper-soft p-5 hover:bg-paper">
                  <img src={c.coverImage} className="h-24 w-24 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-mute">{c.instructorName}</p>
                    <h3 className="mt-0.5 font-display text-title3 leading-tight line-clamp-2">{c.title}</h3>
                    <Progress value={p.percentComplete * 100} className="mt-3" />
                    <p className="mt-2 text-caption num text-ink-mute">{p.completedLessonIds.length} of {c.totalLessons} lessons · {formatMinutes(c.estimatedMinutes)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-12">
          <p className="eyebrow">Completed</p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2">
            {completed.map((p) => {
              const c = demoStore.getCourse(p.courseId);
              if (!c) return null;
              return (
                <Link to={`/courses/${c.slug}`} key={p.courseId} className="flex gap-4 bg-paper-soft p-5 hover:bg-paper">
                  <img src={c.coverImage} className="h-24 w-24 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-mute">{c.instructorName}</p>
                    <h3 className="mt-0.5 font-display text-title3 leading-tight line-clamp-2">{c.title}</h3>
                    <Badge variant="success" className="mt-3">Completed</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
