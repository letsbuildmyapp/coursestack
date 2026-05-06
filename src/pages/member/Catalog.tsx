import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { demoStore } from '@/lib/store';
import { formatMinutes, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Tier } from '@/types';

const TOPIC_OPTIONS = ['all', 'business', 'design', 'coding', 'marketing', 'photo', 'productivity'] as const;

export function Catalog() {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<(typeof TOPIC_OPTIONS)[number]>('all');
  const [tier, setTier] = useState<'all' | Tier>('all');
  const [length, setLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');

  const courses = useMemo(() => {
    const all = demoStore.listCourses();
    return all.filter((c) => {
      if (q && !`${c.title} ${c.subtitle} ${c.description} ${c.instructorName} ${c.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (topic !== 'all' && c.topic !== topic) return false;
      if (tier !== 'all' && c.tier !== tier) return false;
      if (length !== 'all') {
        const m = c.estimatedMinutes;
        if (length === 'short' && m > 90) return false;
        if (length === 'medium' && (m <= 90 || m > 180)) return false;
        if (length === 'long' && m <= 180) return false;
      }
      return true;
    });
  }, [q, topic, tier, length]);

  return (
    <AppShell pageEyebrow="The Library">
      <div className="flex flex-col items-end justify-between gap-4 md:flex-row md:items-end" data-tour="catalog-header">
        <div>
          <h1 className="font-display text-largeTitle leading-tight">Catalog.</h1>
          <p className="mt-1 text-body text-ink-soft">{formatNumber(courses.length)} courses, sorted by recency.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the library…" className="pl-9" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3" data-tour="catalog-filters">
        <FilterRow
          label="Topic"
          options={TOPIC_OPTIONS.map((t) => ({ value: t, label: t }))}
          value={topic}
          onChange={(v) => setTopic(v as any)}
        />
        <FilterRow
          label="Tier"
          options={[
            { value: 'all', label: 'all' },
            { value: 'free', label: 'free' },
            { value: 'pro', label: 'pro' },
            { value: 'team', label: 'team' },
          ]}
          value={tier}
          onChange={(v) => setTier(v as any)}
        />
        <FilterRow
          label="Length"
          options={[
            { value: 'all', label: 'any' },
            { value: 'short', label: '< 90 min' },
            { value: 'medium', label: '90–180 min' },
            { value: 'long', label: '> 180 min' },
          ]}
          value={length}
          onChange={(v) => setLength(v as any)}
        />
      </div>

      {courses.length === 0 ? (
        <div className="mt-16 rounded-md border border-dashed border-rule p-12 text-center">
          <p className="eyebrow">Nothing matches</p>
          <h2 className="mt-2 font-display text-title2">Try a wider net.</h2>
          <p className="mt-2 text-footnote text-ink-mute">Clear a filter or two and it'll come right back.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <Link
              key={c.id}
              to={`/courses/${c.slug}`}
              className="group flex flex-col bg-paper-soft p-6 transition-colors hover:bg-paper"
            >
              <div className="overflow-hidden rounded-sm">
                <img src={c.coverImage} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
              <div className="mt-5 flex items-start justify-between">
                <p className="eyebrow num">No. {String(i + 1).padStart(2, '0')} · {c.tags[0]}</p>
                <Badge variant={c.tier === 'free' ? 'soft' : c.tier === 'pro' ? 'terra' : 'default'}>
                  {c.tier}
                </Badge>
              </div>
              <h3 className="mt-2 font-display text-title2 leading-snug text-ink group-hover:text-terra-deep">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-footnote leading-relaxed text-ink-mute">{c.subtitle}</p>
              <div className="mt-auto flex items-center gap-3 pt-5 text-caption num text-ink-mute">
                <span>{c.instructorName}</span>
                <span>·</span>
                <span>{formatMinutes(c.estimatedMinutes)}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3 fill-terra text-terra" /> {c.rating.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="eyebrow">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-caption uppercase tracking-[0.05em]',
              value === o.value
                ? 'bg-ink text-paper'
                : 'border border-rule text-ink-soft hover:border-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
