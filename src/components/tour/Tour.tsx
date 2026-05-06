import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  LayoutDashboard,
  PenLine,
  PlayCircle,
  Sparkles,
  Star,
  Users,
  Wand2,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

type Placement = 'right' | 'left' | 'top' | 'bottom';

interface TourStep {
  id: string;
  icon: ReactNode;
  title: string;
  body: ReactNode;
  target?: string;
  placement?: Placement;
}

const memberSteps: TourStep[] = [
  {
    id: 'welcome',
    icon: <Sparkles className="size-4" />,
    title: 'Welcome to CourseStack.',
    body: (
      <>
        A short tour. Six steps, two minutes. We&rsquo;ll show you the dashboard, the catalog, the lesson player, and the AI study buddy. Press <kbd className="rounded bg-paper-deep px-1 text-caption">→</kbd> to advance.
      </>
    ),
  },
  {
    id: 'continue',
    icon: <LayoutDashboard className="size-4" />,
    title: 'Pick up where you left off.',
    body: 'The Continue card always shows your most recent in-progress lesson. One click jumps you back in.',
    target: 'continue',
    placement: 'bottom',
  },
  {
    id: 'library',
    icon: <PlayCircle className="size-4" />,
    title: 'Your library.',
    body: 'Every course you have started lives here, with progress tracked lesson-by-lesson.',
    target: 'library',
    placement: 'top',
  },
  {
    id: 'catalog',
    icon: <Compass className="size-4" />,
    title: 'Browse the catalog.',
    body: 'Search by topic, instructor, length, or tier. The first lesson of every course is a free preview.',
    target: 'nav-catalog',
    placement: 'right',
  },
  {
    id: 'tools',
    icon: <Sparkles className="size-4" />,
    title: 'On every lesson: an AI study buddy.',
    body: 'Inside any lesson, the floating dock on the right opens a Sonnet 4.6 study companion, a 30-second summarizer, and a notes drawer.',
  },
  {
    id: 'done',
    icon: <Star className="size-4" />,
    title: "You're set.",
    body: 'Pick something from the catalog and read for 20 minutes. The kind of thing you can actually finish in a Tuesday afternoon.',
  },
];

const instructorSteps: TourStep[] = [
  { id: 'welcome', icon: <Sparkles className="size-4" />, title: 'Welcome, instructor.', body: 'A quick tour of the editor surface. Five steps.' },
  { id: 'home', icon: <PenLine className="size-4" />, title: 'Your courses live here.', body: 'List, sort, publish or unpublish in one click.', target: 'nav-instructor', placement: 'right' },
  { id: 'new', icon: <Wand2 className="size-4" />, title: 'Outline new courses with AI.', body: 'Tell the assistant your topic and audience. Opus 4.7 drafts a 2–4 module outline; you edit and one-click create.', target: 'new-course', placement: 'bottom' },
  { id: 'edit', icon: <PlayCircle className="size-4" />, title: 'Edit, drag, ship.', body: 'Inside the editor, drag modules and lessons to reorder, edit metadata, and toggle Publish from the header.' },
  { id: 'done', icon: <Star className="size-4" />, title: 'Ready when you are.', body: 'Course catalog updates the moment you toggle Publish.' },
];

const adminSteps: TourStep[] = [
  { id: 'welcome', icon: <Sparkles className="size-4" />, title: 'Welcome, admin.', body: 'Three places to know about: users, courses, revenue.' },
  { id: 'users', icon: <Users className="size-4" />, title: 'Users.', body: 'Search by name, filter by role, promote members to instructor.', target: 'nav-admin-users', placement: 'right' },
  { id: 'revenue', icon: <BarChart3 className="size-4" />, title: 'Revenue.', body: 'Pulled from Stripe via a Cloud Function, cached for five minutes. MRR, growth, churn at a glance.', target: 'nav-admin-revenue', placement: 'right' },
  { id: 'done', icon: <Star className="size-4" />, title: 'You have the keys.', body: 'Every other surface is fair game from here.' },
];

function pickRoleSteps(roles: Role[]): { steps: TourStep[]; role: 'admin' | 'instructor' | 'member' } {
  if (roles.includes('admin')) return { steps: adminSteps, role: 'admin' };
  if (roles.includes('instructor')) return { steps: instructorSteps, role: 'instructor' };
  return { steps: memberSteps, role: 'member' };
}

function useViewport() {
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vw;
}

function getRect(target: string | undefined): DOMRect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function Tour() {
  const { user } = useAuth();
  const { steps, role } = useMemo(() => pickRoleSteps(user?.roles ?? ['member']), [user?.roles]);
  const storageKey = `coursestack:tutorial_seen:${role}`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const vw = useViewport();
  const isDesktop = vw >= 768;
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [user, storageKey]);

  // Programmatic replay — fires from anywhere via window.dispatchEvent(new Event('coursestack:replay-tour'))
  useEffect(() => {
    if (!user) return;
    function onReplay() {
      window.localStorage.removeItem(storageKey);
      setStep(0);
      setOpen(true);
    }
    window.addEventListener('coursestack:replay-tour', onReplay);
    return () => window.removeEventListener('coursestack:replay-tour', onReplay);
  }, [user, storageKey]);

  const close = useCallback(() => {
    setOpen(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, '1');
  }, [storageKey]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s >= steps.length - 1) {
        close();
        return s;
      }
      return s + 1;
    });
  }, [steps.length, close]);

  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, next, prev, close]);

  useEffect(() => {
    if (!open) return;
    const recompute = () => setRect(getRect(steps[step]?.target));
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
    };
  }, [open, step, steps]);

  if (!user) return null;
  const cur = steps[step]!;
  const useSpotlight = isDesktop && !!cur.target && !!rect;

  return (
    <AnimatePresence>
      {open && (
        <>
          {useSpotlight ? (
            <SpotlightLayer key="spot" rect={rect!} onClick={close} />
          ) : (
            <ModalOverlay key="ov" onClick={close} />
          )}
          <TooltipCard
            key={`tip-${step}`}
            ref={tooltipRef}
            step={cur}
            stepIndex={step}
            total={steps.length}
            useSpotlight={useSpotlight}
            rect={rect}
            placement={cur.placement ?? 'right'}
            onPrev={prev}
            onNext={next}
            onClose={close}
            onJump={setStep}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function ModalOverlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[120] bg-ink/72 backdrop-blur-sm"
      onClick={onClick}
    />
  );
}

function SpotlightLayer({ rect, onClick }: { rect: DOMRect; onClick: () => void }) {
  return (
    <>
      {/* click-outside catcher */}
      <div className="fixed inset-0 z-[110]" onClick={onClick} />
      <motion.div
        key={`${rect.top}-${rect.left}-${rect.width}-${rect.height}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 30 }}
        className="fixed z-[120] tour-cutout"
        style={{
          top: Math.max(rect.top - 8, 8),
          left: Math.max(rect.left - 8, 8),
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />
    </>
  );
}

const TooltipCard = forwardRef<
  HTMLDivElement,
  {
    step: TourStep;
    stepIndex: number;
    total: number;
    useSpotlight: boolean;
    rect: DOMRect | null;
    placement: Placement;
    onPrev: () => void;
    onNext: () => void;
    onClose: () => void;
    onJump: (i: number) => void;
  }
>(({ step, stepIndex, total, useSpotlight, rect, placement, onPrev, onNext, onClose, onJump }, ref) => {
  // Compute spotlight-mode position; modal mode is centered by a wrapping flex container so
  // Framer Motion's animated transform doesn't conflict with CSS centering.
  let spotlightStyle: React.CSSProperties | null = null;
  if (useSpotlight && rect) {
    const card = { w: 320, h: 240 };
    const margin = 16;
    let top = 0;
    let left = 0;
    const tryPlace = (p: Placement) => {
      if (p === 'right') {
        top = rect.top + rect.height / 2 - card.h / 2;
        left = rect.right + margin;
      } else if (p === 'left') {
        top = rect.top + rect.height / 2 - card.h / 2;
        left = rect.left - margin - card.w;
      } else if (p === 'top') {
        top = rect.top - margin - card.h;
        left = rect.left + rect.width / 2 - card.w / 2;
      } else {
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - card.w / 2;
      }
    };
    const order: Placement[] = [placement, 'bottom', 'top', 'right', 'left'];
    for (const p of order) {
      tryPlace(p);
      const inX = left >= 8 && left + card.w <= window.innerWidth - 8;
      const inY = top >= 8 && top + card.h <= window.innerHeight - 8;
      if (inX && inY) break;
    }
    spotlightStyle = {
      top: Math.max(8, Math.min(window.innerHeight - card.h - 8, top)),
      left: Math.max(8, Math.min(window.innerWidth - card.w - 8, left)),
    };
  }

  const cardClass =
    'w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-ink bg-paper shadow-2xl';

  // Spotlight mode: absolutely positioned by computed top/left, animate scale only.
  // Modal mode: positioned at left:50%/top:50% and offset by -50%/-50% via motion x/y so
  // Framer Motion composes them into its animated transform (a manual `transform: translate(-50%,-50%)`
  // would be overwritten on every animation frame).
  const motionProps = useSpotlight
    ? {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, x: '-50%', y: '-50%' },
        animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
        exit: { opacity: 0, scale: 0.96, x: '-50%', y: '-50%' },
      };

  const card = (
    <motion.div
      ref={ref}
      {...motionProps}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className={cn(
        'fixed z-[130]',
        cardClass,
        useSpotlight ? null : 'left-1/2 top-1/2',
      )}
      style={spotlightStyle ?? undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 border-b border-rule bg-paper-soft px-5 py-3">
        <p className="eyebrow num">Tour · {stepIndex + 1} of {total}</p>
        <button onClick={onClose} className="rounded p-1 text-ink-mute hover:text-ink" aria-label="Close tour">
          <X className="size-4" />
        </button>
      </div>
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 text-terra">
          {step.icon}
          <span className="eyebrow text-terra-deep">Step {stepIndex + 1}</span>
        </div>
        <h3 className="mt-2 font-display text-title2 leading-tight">{step.title}</h3>
        <p className="mt-2 text-footnote leading-relaxed text-ink-soft">{step.body}</p>
        <div className="mt-5 flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Go to step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-terra' : 'w-1.5 bg-rule hover:bg-ink-mute'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-rule px-3 py-2.5">
        <Button variant="ghost" size="sm" disabled={stepIndex === 0} onClick={onPrev} className="text-footnote">
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        {stepIndex === total - 1 ? (
          <Button variant="terra" size="sm" onClick={onNext}>
            Done <Star className="size-3.5" />
          </Button>
        ) : (
          <Button variant="terra" size="sm" onClick={onNext}>
            Next <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );

  return card;
});
TooltipCard.displayName = 'TooltipCard';
