import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Compass, Quote, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { demoStore } from '@/lib/store';
import { formatNumber, formatMinutes } from '@/lib/utils';
import { TIERS } from '@/lib/pricing';
import { fadeUp, fadeUpSmall, staggerContainer, sectionViewport, useCountUp } from '@/lib/motion';

function StatNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const n = useCountUp(value, 1400);
  return <p className="font-display text-title1 leading-none num">{format(n)}</p>;
}

export function Landing() {
  const courses = demoStore.listCourses().slice(0, 4);
  const instructors = demoStore.listAllUsers().filter((u) => u.roles.includes('instructor') && !u.roles.includes('admin'));
  const lessonsTotal = courses.length * 18 + 14;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      {/* HERO — split-screen editorial */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-16 md:grid-cols-12 md:gap-16 md:pt-24">
          {/* Left: headline */}
          <motion.div className="md:col-span-7" initial="hidden" animate="show" variants={staggerContainer}>
            <motion.p className="eyebrow num" variants={fadeUpSmall}>Vol. I · Spring 2026 · No. 03</motion.p>
            <motion.h1 className="display-headline mt-6 font-display text-[3.5rem] leading-[0.96] tracking-tight md:text-[5rem]" variants={fadeUp}>
              Courses for the<br />
              <em className="italic font-light text-terra-deep">already-working</em><br />
              professional.
            </motion.h1>
            <motion.p className="mt-8 max-w-xl text-title3 leading-relaxed text-ink-soft" variants={fadeUp}>
              CourseStack is a small, deliberate library of courses for designers, engineers, operators, and founders who are past tutorial videos and tired of fluff. Six courses every quarter. No autoplay. No "level&nbsp;1&nbsp;of&nbsp;47."
            </motion.p>
            <motion.div className="mt-10 flex flex-wrap items-center gap-4" variants={fadeUp}>
              <Button size="xl" variant="terra" asChild>
                <Link to="/signup">
                  Start the trial
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/catalog">Browse the catalog</Link>
              </Button>
              <span className="hidden items-center gap-2 text-footnote text-ink-mute md:flex">
                <Sparkles className="size-4 text-terra" />
                14-day refund window. No platform fees, no upsells.
              </span>
            </motion.div>

            <motion.div className="mt-14 grid max-w-xl grid-cols-3 gap-8 border-t border-rule pt-6" variants={fadeUp}>
              <div>
                <StatNumber value={lessonsTotal} format={(n) => formatNumber(Math.round(n))} />
                <p className="mt-1 text-caption text-ink-mute">Lessons in print</p>
              </div>
              <div>
                <StatNumber value={14128} format={(n) => formatNumber(Math.round(n))} />
                <p className="mt-1 text-caption text-ink-mute">Reading members</p>
              </div>
              <div>
                <StatNumber value={4.8} format={(n) => n.toFixed(1)} />
                <p className="mt-1 text-caption text-ink-mute">Median rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: layered course cards at slight angles */}
          <div className="relative md:col-span-5">
            <div className="relative mx-auto h-[480px] w-full max-w-md md:h-[560px]">
              {courses.slice(0, 4).map((c, i) => {
                const rotations = ['rotate-[-4deg]', 'rotate-[2.5deg]', 'rotate-[-1.5deg]', 'rotate-[3deg]'];
                const tops = ['top-0', 'top-12', 'top-28', 'top-48'];
                const offsets = ['md:-translate-x-6', '', 'md:translate-x-4', '-translate-x-2'];
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 14, rotate: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                    className={`absolute left-0 right-0 stack-card overflow-hidden rounded-md border border-rule bg-paper-soft ${tops[i]} ${rotations[i]} ${offsets[i]}`}
                    style={{ zIndex: 10 + i }}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <img
                        src={c.coverImage}
                        alt=""
                        className="h-28 w-24 flex-shrink-0 rounded-sm object-cover grayscale-[20%]"
                        loading={i < 2 ? 'eager' : 'lazy'}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow num">No. {String(i + 1).padStart(2, '0')}</p>
                        <h3 className="mt-1 font-display text-title3 leading-snug text-ink">
                          {c.title}
                        </h3>
                        <p className="mt-1 text-caption text-ink-mute">{c.instructorName}</p>
                        <div className="mt-3 flex items-center gap-3 text-caption num text-ink-mute">
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3 fill-terra text-terra" /> {c.rating.toFixed(1)}
                          </span>
                          <span>·</span>
                          <span>{formatMinutes(c.estimatedMinutes)}</span>
                          <span>·</span>
                          <span className="uppercase tracking-[0.06em]">{c.tier}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quote rule below hero */}
        <motion.div className="mx-auto max-w-7xl border-t border-rule px-6 py-6" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-8">
            <p className="font-display text-title3 italic text-ink-soft text-balance md:max-w-3xl">
              <Quote className="mr-2 inline size-5 -translate-y-1 text-terra" />
              The kind of thing I'd buy a hardcover edition of, if they printed one.
            </p>
            <p className="eyebrow whitespace-nowrap text-ink-mute">— A reader, on email</p>
          </div>
        </motion.div>
      </section>

      {/* THE STACK — featured courses */}
      <section id="catalog" className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <motion.div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row" initial="hidden" whileInView="show" viewport={sectionViewport} variants={staggerContainer}>
            <motion.div className="max-w-xl" variants={fadeUp}>
              <p className="eyebrow">The Stack · Spring 2026</p>
              <h2 className="mt-2 font-display text-largeTitle leading-tight">
                Six courses, chosen on purpose.
              </h2>
              <p className="mt-4 text-body text-ink-soft">
                Not a marketplace. Every course is commissioned, edited, and held to the same craft bar a magazine would hold a feature.
              </p>
            </motion.div>
            <motion.div variants={fadeUpSmall}>
              <Button variant="link" asChild>
                <Link to="/catalog">View the full library →</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
          >
            {demoStore.listCourses().map((c, i) => (
              <motion.div key={c.id} variants={fadeUp}>
              <Link
                to={`/courses/${c.slug}`}
                className="group relative flex h-full flex-col bg-paper-soft p-7 transition-colors hover:bg-paper"
              >
                <div className="flex items-start justify-between">
                  <p className="eyebrow num">No. {String(i + 1).padStart(2, '0')} · {c.tags[0]}</p>
                  <Badge variant={c.tier === 'free' ? 'soft' : c.tier === 'pro' ? 'terra' : 'default'}>
                    {c.tier}
                  </Badge>
                </div>
                <h3 className="mt-5 font-display text-title2 leading-snug text-ink text-balance group-hover:text-terra-deep">
                  {c.title}
                </h3>
                <p className="mt-2 text-footnote leading-relaxed text-ink-mute line-clamp-3">
                  {c.subtitle}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-6 text-caption num text-ink-mute">
                  <span>{c.instructorName}</span>
                  <span>·</span>
                  <span>{formatMinutes(c.estimatedMinutes)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3 fill-terra text-terra" /> {c.rating.toFixed(1)}
                  </span>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* INSTRUCTORS — B&W portraits */}
      <section className="border-b border-rule bg-paper-soft">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <motion.div className="mb-14 max-w-2xl" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>
            <p className="eyebrow">Faculty</p>
            <h2 className="mt-2 font-display text-largeTitle leading-tight">
              People who still ship.
            </h2>
            <p className="mt-4 text-body text-ink-soft">
              Every instructor on CourseStack works in the field they teach. We don't commission talking-head explainers.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-12 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          >
            {instructors.map((inst) => (
              <motion.article key={inst.id} variants={fadeUp} className="flex flex-col">
                <div className="aspect-[3/4] overflow-hidden rounded-md border border-rule">
                  {inst.avatarUrl && (
                    <img
                      src={inst.avatarUrl}
                      alt={inst.displayName}
                      className="h-full w-full object-cover grayscale"
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="mt-4 eyebrow">{inst.id === 'u_inst_ada' ? 'Brand & sales' : inst.id === 'u_inst_marco' ? 'Engineering' : 'Design'}</p>
                <h3 className="mt-1 font-display text-title2 leading-tight">{inst.displayName}</h3>
                <p className="mt-2 max-w-sm text-footnote leading-relaxed text-ink-soft">{inst.bio}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <motion.div className="mb-14 max-w-xl" initial="hidden" whileInView="show" viewport={sectionViewport} variants={fadeUp}>
            <p className="eyebrow">Subscriptions</p>
            <h2 className="mt-2 font-display text-largeTitle leading-tight">Three ways to read.</h2>
            <p className="mt-4 text-body text-ink-soft">
              Annual billing knocks 20% off. Cancel from the customer portal at any time, no calls, no clawbacks.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          >
            {TIERS.map((t) => (
              <motion.div
                key={t.id}
                variants={fadeUp}
                className={`relative flex flex-col rounded-md border p-8 ${
                  t.highlight ? 'border-ink bg-paper-soft shadow-xl' : 'border-rule bg-paper'
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-8 inline-flex bg-terra px-2 py-0.5 text-caption tracking-[0.05em] uppercase text-paper rounded-md">
                    Most chosen
                  </span>
                )}
                <p className="eyebrow">{t.name}</p>
                <p className="mt-3 font-display text-display leading-none num">
                  ${t.priceMonthly}
                  <span className="text-title3 font-normal text-ink-mute">/mo</span>
                </p>
                <p className="mt-3 max-w-xs text-footnote text-ink-mute">{t.description}</p>
                <ul className="mt-6 space-y-3 text-footnote">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 size-4 flex-shrink-0 text-terra" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={t.highlight ? 'terra' : 'outline'}
                  size="lg"
                  className="mt-8"
                  asChild
                >
                  <Link to={`/signup?tier=${t.id}`}>
                    {t.id === 'free' ? 'Start with the free tier' : `Start with ${t.name}`}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EDITORIAL ESSAY */}
      <section id="editorial" className="border-b border-rule bg-paper-soft">
        <motion.div
          className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-12"
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={staggerContainer}
        >
          <motion.aside className="md:col-span-3" variants={fadeUpSmall}>
            <p className="eyebrow">The Quarterly · Editor's note</p>
            <p className="mt-4 text-caption text-ink-mute num">Issue 03 — March 2026</p>
            <p className="mt-2 text-caption text-ink-mute">
              By <span className="text-ink">Alex Rivera</span>
            </p>
          </motion.aside>
          <div className="md:col-span-9">
            <motion.h2 className="font-display text-largeTitle leading-tight max-w-3xl" variants={fadeUp}>
              The case for the long-form course in a short-form decade.
            </motion.h2>
            <motion.div className="editorial-prose mt-8 max-w-3xl text-body text-ink-soft" variants={staggerContainer}>
              <motion.p variants={fadeUp}>
                Most online courses today are built like content marketing — a hook, a tease, a CTA, a checkout. They're optimized for the moment of purchase, not the year of practice. The subtitle is a promise; the syllabus is a stack of exit ramps. Six months in, the customer has clicked through 47 lessons and learned nothing they couldn't have learned in a Tuesday afternoon read.
              </motion.p>
              <motion.p variants={fadeUp}>
                We started CourseStack on a different hypothesis: that working professionals don't need more <em>content</em>; they need fewer, better courses they can sit with. A magazine you'd save on a shelf, in course form. Six new ones every quarter, each one held to the bar that a feature article in print would be held to.
              </motion.p>
              <motion.blockquote variants={fadeUp}>
                "Watch any number, when you're moving fast and breaking things, of demos you'll watch you'll never come back to. Then sit, once, with something good. The difference is the rest of your career."
              </motion.blockquote>
              <motion.p variants={fadeUp}>
                That's the whole pitch. The rest of this issue is the work itself.
              </motion.p>
            </motion.div>

            <motion.div className="mt-12 inline-flex items-center gap-2" variants={fadeUp}>
              <Compass className="size-4 text-terra" />
              <Link to="/catalog" className="font-medium underline-offset-4 decoration-terra decoration-2 hover:underline">
                Continue to the catalog
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
