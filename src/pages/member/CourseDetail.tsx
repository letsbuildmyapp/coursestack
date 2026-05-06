import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Clock, FileText, Lock, PlayCircle, Star, ListChecks } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { canAccessLesson, userTierGrants } from '@/lib/access';
import { formatMinutes, formatNumber, initials } from '@/lib/utils';
import { toast } from 'sonner';

export function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const course = slug ? demoStore.getCourse(slug) : null;
  if (!course) {
    return (
      <AppShell>
        <div className="rounded-md border border-rule bg-paper-soft p-10">
          <p className="eyebrow">Not found</p>
          <h1 className="mt-2 font-display text-title1">That course doesn't exist.</h1>
          <Button asChild className="mt-6"><Link to="/catalog">Back to catalog</Link></Button>
        </div>
      </AppShell>
    );
  }

  const instructor = demoStore.listAllUsers().find((u) => u.id === course.instructorId);
  const progress = user ? demoStore.getProgress(user.id, course.id) : null;
  const enrolled = !!progress;
  const userHasTier = userTierGrants(user, course.tier);

  const firstLesson = course.modules[0]?.lessons[0];
  const startHref = firstLesson ? `/learn/${course.slug}/${firstLesson.id}` : '#';

  function startCourse() {
    if (!user) return nav('/login');
    if (!course) return;
    if (!userHasTier && course.tier !== 'free') {
      return nav('/account/billing');
    }
    demoStore.enroll(user.id, course.id);
    toast.success('Enrolled — opening the first lesson.');
    nav(startHref);
  }

  return (
    <AppShell pageEyebrow={`${course.tier} tier · ${course.tags[0]}`}>
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div>
          <p className="eyebrow num">Volume I · No. {course.id.slice(-2).toUpperCase()}</p>
          <h1 className="mt-2 font-display text-largeTitle leading-tight md:text-display">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-4 max-w-2xl font-display text-title2 italic leading-snug text-ink-soft">
              {course.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-caption num text-ink-mute">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-terra text-terra" /> {course.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{formatNumber(course.enrollmentCount)} readers</span>
            <span>·</span>
            <span>{course.totalLessons} lessons</span>
            <span>·</span>
            <span>{formatMinutes(course.estimatedMinutes)}</span>
          </div>

          <img src={course.coverImage} alt="" className="mt-8 aspect-[16/9] w-full rounded-md object-cover" />

          <div className="editorial-prose mt-10 max-w-prose text-body">
            <p>{course.description}</p>
          </div>

          {/* Modules */}
          <section className="mt-14">
            <p className="eyebrow">Outline</p>
            <h2 className="mt-2 font-display text-title1 leading-tight">{course.modules.length} modules.</h2>

            <div className="mt-6 space-y-4">
              {course.modules.map((m, mi) => (
                <details key={m.id} open={mi === 0} className="group rounded-md border border-rule bg-paper-soft">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-title3 num text-ink-mute">
                        {String(mi + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-title2 leading-tight">{m.title}</h3>
                    </div>
                    <p className="text-caption num text-ink-mute">{m.lessons.length} lessons</p>
                  </summary>
                  <ol className="border-t border-rule">
                    {m.lessons.map((l) => {
                      const access = canAccessLesson(user, course, l);
                      const completed = !!progress?.completedLessonIds.includes(l.id);
                      const Icon = l.type === 'video' ? PlayCircle : l.type === 'quiz' ? ListChecks : FileText;
                      return (
                        <li key={l.id} className="border-b border-rule last:border-b-0">
                          <Link
                            to={access ? `/learn/${course.slug}/${l.id}` : '#'}
                            onClick={(e) => {
                              if (!access) {
                                e.preventDefault();
                                if (!user) nav('/login');
                                else nav('/account/billing');
                              }
                            }}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-paper"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-rule">
                              {completed ? (
                                <Check className="size-3.5 text-success" />
                              ) : access ? (
                                <Icon className="size-3.5 text-ink-soft" />
                              ) : (
                                <Lock className="size-3.5 text-ink-mute" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-headline text-ink">{l.title}</p>
                              <p className="text-caption text-ink-mute capitalize">
                                {l.type} · {formatMinutes(l.durationMinutes)}
                                {l.isFreePreview && (
                                  <span className="ml-2 uppercase tracking-[0.06em] text-terra">free preview</span>
                                )}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-rule bg-paper-soft p-6">
            {progress ? (
              <>
                <p className="eyebrow">In progress</p>
                <Progress value={progress.percentComplete * 100} className="mt-3" />
                <p className="mt-2 text-caption num text-ink-mute">
                  {progress.completedLessonIds.length} of {course.totalLessons} complete
                </p>
                <Button variant="terra" size="lg" className="mt-5 w-full" asChild>
                  <Link to={firstLesson ? `/learn/${course.slug}/${progress.lastLessonId ?? firstLesson.id}` : '#'}>
                    Continue <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="eyebrow">{course.tier === 'free' ? 'Free' : `${course.tier} tier`}</p>
                <p className="mt-3 font-display text-title2 leading-tight">
                  {userHasTier
                    ? 'Included in your plan.'
                    : course.tier === 'free'
                    ? 'Free to read.'
                    : `Available on the ${course.tier} plan.`}
                </p>
                <Button variant="terra" size="lg" className="mt-5 w-full" onClick={startCourse}>
                  {!user ? 'Sign in to start' : userHasTier || course.tier === 'free' ? 'Start course' : 'Upgrade to access'}
                  <ArrowRight className="size-4" />
                </Button>
                {firstLesson?.isFreePreview && (
                  <p className="mt-3 text-caption text-ink-mute">First lesson is a free preview.</p>
                )}
              </>
            )}
          </div>

          {instructor && (
            <div className="rounded-md border border-rule bg-paper-soft p-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={instructor.avatarUrl} alt={instructor.displayName} />
                  <AvatarFallback>{initials(instructor.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="eyebrow">Faculty</p>
                  <p className="font-display text-title3 leading-tight">{instructor.displayName}</p>
                </div>
              </div>
              <p className="mt-4 text-footnote leading-relaxed text-ink-soft">{instructor.bio}</p>
            </div>
          )}

          <div className="rounded-md border border-rule bg-paper-soft p-6">
            <p className="eyebrow">In short</p>
            <ul className="mt-3 space-y-2 text-footnote text-ink-soft">
              <li className="flex justify-between"><span>Lessons</span><span className="num text-ink">{course.totalLessons}</span></li>
              <li className="flex justify-between"><span>Total length</span><span className="num text-ink">{formatMinutes(course.estimatedMinutes)}</span></li>
              <li className="flex justify-between"><span>Topic</span><span className="text-ink capitalize">{course.topic}</span></li>
              <li className="flex justify-between"><span>Tier</span><Badge variant={course.tier === 'free' ? 'soft' : course.tier === 'pro' ? 'terra' : 'default'}>{course.tier}</Badge></li>
            </ul>
          </div>

          <div className="text-caption text-ink-mute">
            <Clock className="mr-1 inline size-3" /> Updated {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
