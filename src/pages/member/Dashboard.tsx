import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { formatMinutes, formatNumber } from '@/lib/utils';
import { fadeUp, staggerContainer, sectionViewport, useCountUp } from '@/lib/motion';

function CountText({ value, className }: { value: number; className?: string }) {
  const n = useCountUp(value, 1100);
  return <p className={className}>{Math.round(n)}</p>;
}

export function MemberDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const progress = demoStore.listProgressForUser(user.id);
  const courses = demoStore.listCourses();
  const enrolledCourseIds = new Set(progress.map((p) => p.courseId));

  const inProgress = progress
    .filter((p) => !p.completedAt)
    .sort((a, b) => b.lastViewedAt - a.lastViewedAt);

  const completed = progress.filter((p) => p.completedAt);

  const recommendations = courses
    .filter((c) => !enrolledCourseIds.has(c.id))
    .slice(0, 3);

  // Continue learning
  const top = inProgress[0];
  const topCourse = top ? demoStore.getCourse(top.courseId) : null;
  let nextLessonHref = '/catalog';
  let nextLessonTitle = '';
  let nextModuleTitle = '';
  if (topCourse) {
    const allLessons = topCourse.modules.flatMap((m) => m.lessons.map((l) => ({ l, m })));
    const nextEntry =
      allLessons.find(({ l }) => l.id === top!.lastLessonId) ??
      allLessons.find(({ l }) => !top!.completedLessonIds.includes(l.id)) ??
      allLessons[0];
    nextLessonHref = `/learn/${topCourse.slug}/${nextEntry!.l.id}`;
    nextLessonTitle = nextEntry!.l.title;
    nextModuleTitle = nextEntry!.m.title;
  }

  // streak (mock: count of distinct days viewed in last 7)
  const streakDays = inProgress.length ? Math.min(7, inProgress.length + 2) : 0;

  return (
    <AppShell pageEyebrow={`Today · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}>
      <motion.div className="flex items-end justify-between gap-4" data-tour="welcome" initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-largeTitle leading-tight">Hello, {user.displayName.split(' ')[0]}.</h1>
          <p className="mt-1 text-body text-ink-soft">A quiet hour with one course beats an afternoon scrolling clips.</p>
        </motion.div>
      </motion.div>

      {/* Continue learning hero */}
      {topCourse ? (
        <motion.section className="mt-8 grid gap-6 lg:grid-cols-3" data-tour="continue" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}>
          <motion.div className="lg:col-span-2 overflow-hidden rounded-md border border-rule bg-paper-soft" variants={fadeUp}>
            <div className="grid md:grid-cols-[280px_1fr]">
              <img src={topCourse.coverImage} alt="" className="h-48 w-full object-cover md:h-full" />
              <div className="flex flex-col p-7">
                <p className="eyebrow">Continue · {nextModuleTitle}</p>
                <h2 className="mt-1 font-display text-title1 leading-tight">{nextLessonTitle || topCourse.title}</h2>
                <p className="mt-2 text-footnote text-ink-soft">{topCourse.title} · {topCourse.instructorName}</p>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-caption text-ink-mute">
                    <span className="num">{Math.round(top!.percentComplete * 100)}% complete</span>
                    <span className="num">
                      {top!.completedLessonIds.length} / {topCourse.totalLessons} lessons
                    </span>
                  </div>
                  <Progress value={top!.percentComplete * 100} />
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Button size="lg" variant="terra" asChild>
                    <Link to={nextLessonHref}>
                      Resume lesson <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="ghost" asChild>
                    <Link to={`/courses/${topCourse.slug}`}>Course outline</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" variants={staggerContainer}>
            <motion.div className="rounded-md border border-rule bg-paper-soft p-6" variants={fadeUp}>
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-terra" />
                <p className="eyebrow">Reading streak</p>
              </div>
              <CountText value={streakDays} className="mt-3 font-display text-largeTitle leading-none num" />
              <p className="mt-2 text-caption text-ink-mute">Days in a row · keep it light.</p>
            </motion.div>
            <motion.div className="rounded-md border border-rule bg-paper-soft p-6" variants={fadeUp}>
              <p className="eyebrow">This quarter</p>
              <CountText value={completed.length} className="mt-3 font-display text-largeTitle leading-none num" />
              <p className="mt-2 text-caption text-ink-mute">{completed.length === 1 ? 'Course finished' : 'Courses finished'}</p>
            </motion.div>
          </motion.aside>
        </motion.section>
      ) : (
        <EmptyContinue />
      )}

      {/* Enrolled courses */}
      <section className="mt-14" data-tour="library">
        <motion.div className="flex items-end justify-between" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>
          <div>
            <p className="eyebrow">My library</p>
            <h2 className="mt-1 font-display text-title1 leading-tight">Courses in progress.</h2>
          </div>
          <Link to="/catalog" className="text-footnote text-ink-mute hover:text-terra-deep">
            Browse more →
          </Link>
        </motion.div>

        {inProgress.length === 0 ? (
          <p className="mt-6 text-footnote text-ink-mute">Nothing in progress yet. Pick something from the catalog.</p>
        ) : (
          <motion.div
            className="mt-6 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {inProgress.map((p) => {
              const c = demoStore.getCourse(p.courseId);
              if (!c) return null;
              const next = c.modules.flatMap((m) => m.lessons).find((l) => !p.completedLessonIds.includes(l.id));
              return (
                <div key={p.courseId}>
                <Link
                  to={next ? `/learn/${c.slug}/${next.id}` : `/courses/${c.slug}`}
                  className="flex h-full gap-4 bg-paper-soft p-5 hover:bg-paper"
                >
                  <img src={c.coverImage} className="h-24 w-24 flex-shrink-0 rounded-sm object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-mute">{c.instructorName}</p>
                    <h3 className="mt-0.5 font-display text-title3 leading-tight text-ink line-clamp-2">{c.title}</h3>
                    <Progress value={p.percentComplete * 100} className="mt-3" />
                    <p className="mt-2 text-caption num text-ink-mute">
                      {p.completedLessonIds.length} of {c.totalLessons} lessons · {formatMinutes(c.estimatedMinutes)}
                    </p>
                  </div>
                </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Recommendations */}
      <section className="mt-14">
        <motion.div className="flex items-end justify-between" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>
          <div>
            <p className="eyebrow">From the editors</p>
            <h2 className="mt-1 font-display text-title1 leading-tight">Recommended for you.</h2>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >
          {recommendations.map((c, i) => (
            <motion.div key={c.id} variants={fadeUp}>
            <Link to={`/courses/${c.slug}`} className="group block h-full rounded-md border border-rule bg-paper-soft p-5 hover:border-ink">
              <div className="overflow-hidden rounded-sm">
                <img src={c.coverImage} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
              <p className="mt-4 eyebrow num">No. {String(i + 1).padStart(2, '0')} · {c.tags[0]}</p>
              <h3 className="mt-1 font-display text-title3 leading-snug text-ink group-hover:text-terra-deep">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-footnote text-ink-mute">{c.subtitle}</p>
              <div className="mt-4 flex items-center gap-3 text-caption num text-ink-mute">
                <Star className="size-3 fill-terra text-terra" />
                <span>{c.rating.toFixed(1)}</span>
                <span>·</span>
                <span>{formatNumber(c.enrollmentCount)} readers</span>
                <span>·</span>
                <Clock className="size-3" />
                <span>{formatMinutes(c.estimatedMinutes)}</span>
              </div>
              <Badge className="mt-4" variant={c.tier === 'free' ? 'soft' : c.tier === 'pro' ? 'terra' : 'default'}>
                {c.tier}
              </Badge>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AppShell>
  );
}

function EmptyContinue() {
  return (
    <div className="mt-8 rounded-md border border-rule bg-paper-soft p-8" data-tour="continue">
      <p className="eyebrow">Welcome</p>
      <h2 className="mt-1 font-display text-title1 leading-tight">No course is open yet.</h2>
      <p className="mt-3 max-w-prose text-body text-ink-soft">
        Pick something from the catalog. The first lesson of every course is free to read so you can decide if it's for you.
      </p>
      <Button variant="terra" size="lg" className="mt-6" asChild>
        <Link to="/catalog">
          Browse the catalog
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
