import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  CornerDownLeft,
  LayoutDashboard,
  PenLine,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { cn, formatMinutes } from '@/lib/utils';

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  group: 'Navigate' | 'Courses' | 'Instructors' | 'Account';
  icon: ReactNode;
  to: string;
  keywords?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const allItems = useMemo<PaletteItem[]>(() => {
    if (!user) return [];
    const items: PaletteItem[] = [
      { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigate', icon: <LayoutDashboard className="size-4" />, to: '/dashboard', keywords: 'home start' },
      { id: 'nav-catalog', label: 'Catalog', group: 'Navigate', icon: <Compass className="size-4" />, to: '/catalog', keywords: 'browse courses library' },
      { id: 'nav-library', label: 'My library', group: 'Navigate', icon: <BookOpen className="size-4" />, to: '/library', keywords: 'progress in progress' },
    ];

    if (user.roles.includes('instructor')) {
      items.push(
        { id: 'nav-instructor', label: 'Instructor desk', group: 'Navigate', icon: <PenLine className="size-4" />, to: '/instructor', keywords: 'my courses author teach' },
        { id: 'nav-new-course', label: 'New course (AI outline)', group: 'Navigate', icon: <PenLine className="size-4" />, to: '/instructor/new', keywords: 'create draft outline opus generate' },
      );
    }
    if (user.roles.includes('admin')) {
      items.push(
        { id: 'nav-admin-users', label: 'Admin · Users', group: 'Navigate', icon: <Users className="size-4" />, to: '/admin/users', keywords: 'admin people accounts' },
        { id: 'nav-admin-courses', label: 'Admin · Courses', group: 'Navigate', icon: <BookOpen className="size-4" />, to: '/admin/courses', keywords: 'admin all courses' },
        { id: 'nav-admin-revenue', label: 'Admin · Revenue', group: 'Navigate', icon: <BarChart3 className="size-4" />, to: '/admin/revenue', keywords: 'admin mrr stripe billing metrics' },
      );
    }

    items.push(
      { id: 'acc-profile', label: 'Account · Profile', group: 'Account', icon: <User className="size-4" />, to: '/account', keywords: 'profile name bio avatar' },
      { id: 'acc-billing', label: 'Account · Plan & billing', group: 'Account', icon: <Settings className="size-4" />, to: '/account/billing', keywords: 'tier stripe subscription cancel upgrade' },
    );

    for (const c of demoStore.listCourses()) {
      items.push({
        id: `c_${c.id}`,
        label: c.title,
        hint: `${c.instructorName} · ${formatMinutes(c.estimatedMinutes)} · ${c.tier}`,
        group: 'Courses',
        icon: <BookOpen className="size-4" />,
        to: `/courses/${c.slug}`,
        keywords: `${c.subtitle} ${c.tags.join(' ')} ${c.topic} ${c.instructorName}`,
      });
    }

    const instructors = demoStore.listAllUsers().filter((u) => u.roles.includes('instructor'));
    for (const inst of instructors) {
      items.push({
        id: `i_${inst.id}`,
        label: inst.displayName,
        hint: 'Instructor',
        group: 'Instructors',
        icon: <User className="size-4" />,
        to: `/catalog?instructor=${encodeURIComponent(inst.displayName)}`,
        keywords: inst.bio ?? '',
      });
    }

    return items;
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((it) =>
      `${it.label} ${it.hint ?? ''} ${it.keywords ?? ''}`.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  // Group items in their original group order
  const grouped = useMemo(() => {
    const order: PaletteItem['group'][] = ['Navigate', 'Courses', 'Instructors', 'Account'];
    const map = new Map<PaletteItem['group'], PaletteItem[]>();
    for (const g of order) map.set(g, []);
    for (const it of filtered) map.get(it.group)!.push(it);
    return order.map((g) => ({ group: g, items: map.get(g)! })).filter((s) => s.items.length > 0);
  }, [filtered]);

  // Flat list of items in render order, used for arrow-key navigation
  const flat = useMemo(() => grouped.flatMap((s) => s.items), [grouped]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      // focus on next tick so the dialog is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keep active item in view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function go(idx: number) {
    const item = flat[idx];
    if (!item) return;
    onClose();
    nav(item.to);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(activeIdx);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="fixed left-1/2 top-[15vh] z-[110] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-md border border-ink bg-paper shadow-2xl"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-rule px-4">
              <Search className="size-4 text-ink-mute" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search courses, instructors, pages…"
                className="h-12 flex-1 bg-transparent text-body outline-none placeholder:text-ink-mute"
              />
              <kbd className="rounded bg-paper-deep px-1.5 py-0.5 text-caption text-ink-soft">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-1">
              {flat.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-body text-ink-mute">Nothing matches "{query}".</p>
                </div>
              ) : (
                grouped.map((section) => (
                  <div key={section.group} className="py-1">
                    <p className="px-4 pb-1 pt-2 eyebrow">{section.group}</p>
                    {section.items.map((it) => {
                      const idx = flat.indexOf(it);
                      const active = idx === activeIdx;
                      return (
                        <button
                          key={it.id}
                          data-cmd-idx={idx}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => go(idx)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left text-body',
                            active ? 'bg-paper-deep text-ink' : 'text-ink-soft hover:bg-paper-soft',
                          )}
                        >
                          <span className={cn('text-ink-mute', active && 'text-terra')}>{it.icon}</span>
                          <span className="flex-1 truncate">{it.label}</span>
                          {it.hint && (
                            <span className="hidden truncate text-caption text-ink-mute md:inline">{it.hint}</span>
                          )}
                          {active && <CornerDownLeft className="size-3.5 text-ink-mute" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-rule bg-paper-soft px-4 py-2 text-caption text-ink-mute">
              <span className="inline-flex items-center gap-2">
                <Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate
              </span>
              <span className="inline-flex items-center gap-2">
                <Kbd>↵</Kbd> open
              </span>
              <span className="inline-flex items-center gap-2">
                <Kbd>esc</Kbd> close
              </span>
              <span className="inline-flex items-center gap-2 num">
                <ArrowRight className="size-3" /> {flat.length} {flat.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded bg-paper-deep px-1.5 py-0.5 text-caption text-ink-soft">{children}</kbd>;
}
