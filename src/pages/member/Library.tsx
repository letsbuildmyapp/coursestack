import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { formatMinutes } from '@/lib/utils';
import { fadeUp, sectionViewport } from '@/lib/motion';

export function Library() {
  const { user } = useAuth();
  if (!user) return null;
  const progress = demoStore.listProgressForUser(user.id);
  const inProgress = progress.filter((p) => !p.completedAt).sort((a, b) => b.lastViewedAt - a.lastViewedAt);
  const completed = progress.filter((p) => p.completedAt);

  return (
    <AppShell pageEyebrow="My library">
      <motion.h1 className="font-display text-largeTitle leading-tight" initial="hidden" animate="show" variants={fadeUp}>Your library.</motion.h1>

      <section className="mt-10">
        <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>In progress</motion.p>
        {inProgress.length === 0 ? (
          <p className="mt-3 text-footnote text-ink-mute">Nothing in progress yet.</p>
        ) : (
          <motion.div
            className="mt-4 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {inProgress.map((p) => {
              const c = demoStore.getCourse(p.courseId);
              if (!c) return null;
              return (
                <div key={p.courseId}>
                <Link to={`/courses/${c.slug}`} className="flex h-full gap-4 bg-paper-soft p-5 hover:bg-paper">
                  <img src={c.coverImage} className="h-24 w-24 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-mute">{c.instructorName}</p>
                    <h3 className="mt-0.5 font-display text-title3 leading-tight line-clamp-2">{c.title}</h3>
                    <Progress value={p.percentComplete * 100} className="mt-3" />
                    <p className="mt-2 text-caption num text-ink-mute">{p.completedLessonIds.length} of {c.totalLessons} lessons · {formatMinutes(c.estimatedMinutes)}</p>
                  </div>
                </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-12">
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>Completed</motion.p>
          <motion.div
            className="mt-4 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {completed.map((p) => {
              const c = demoStore.getCourse(p.courseId);
              if (!c) return null;
              return (
                <div key={p.courseId}>
                <Link to={`/courses/${c.slug}`} className="flex h-full gap-4 bg-paper-soft p-5 hover:bg-paper">
                  <img src={c.coverImage} className="h-24 w-24 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-mute">{c.instructorName}</p>
                    <h3 className="mt-0.5 font-display text-title3 leading-tight line-clamp-2">{c.title}</h3>
                    <Badge variant="success" className="mt-3">Completed</Badge>
                  </div>
                </Link>
                </div>
              );
            })}
          </motion.div>
        </section>
      )}
    </AppShell>
  );
}
