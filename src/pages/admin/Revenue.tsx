import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, DollarSign, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { demoStore } from '@/lib/store';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { TIERS } from '@/lib/pricing';

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const seedRevenue = months.map((m, i) => {
  const base = 8400 + i * 1820;
  const churn = i === 4 ? -420 : -150 - i * 20;
  return { month: m, mrr: base, new: 1800 + i * 220 + (i % 2) * 240, churn };
});

const tierBreakdown = [
  { tier: 'Reader', count: 9210 },
  { tier: 'Member', count: 3982 },
  { tier: 'Team', count: 936 },
];

export function AdminRevenue() {
  const users = demoStore.listAllUsers();
  const activeSubs = users.filter((u) => u.subscriptionStatus === 'active' && u.tier !== 'free').length;

  const computed = useMemo(() => {
    const last = seedRevenue.at(-1)!;
    const prev = seedRevenue.at(-2)!;
    const growth = (last.mrr - prev.mrr) / prev.mrr;
    const totalRev = seedRevenue.reduce((a, x) => a + x.mrr, 0);
    const newThisMonth = last.new;
    const churnRate = Math.abs(last.churn) / last.mrr;
    return { mrr: last.mrr, growth, totalRev, newThisMonth, churnRate };
  }, []);

  return (
    <AppShell pageEyebrow="Admin · Revenue">
      <h1 className="font-display text-largeTitle leading-tight">Revenue.</h1>
      <p className="mt-1 text-body text-ink-soft">Pulled from Stripe (cached 5 min in production).</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="revenue-stats">
        <Stat
          label="MRR"
          value={formatCurrency(computed.mrr)}
          delta={`${computed.growth >= 0 ? '+' : ''}${formatPercent(computed.growth, 1)}`}
          up={computed.growth >= 0}
          icon={DollarSign}
        />
        <Stat
          label="Total revenue (7mo)"
          value={formatCurrency(computed.totalRev)}
          delta="ALL TIME"
          up={true}
          neutral
          icon={TrendingUp}
        />
        <Stat
          label="New subs · this month"
          value={formatNumber(computed.newThisMonth)}
          delta={`+${formatPercent((computed.newThisMonth - 1800) / 1800, 1)}`}
          up={true}
          icon={Users}
        />
        <Stat
          label="Churn (monthly)"
          value={formatPercent(computed.churnRate, 1)}
          delta="-0.4 pp"
          up={false}
          good={true}
          icon={TrendingDown}
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-rule bg-paper-soft p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="eyebrow">MRR · trailing 7 months</p>
            <p className="text-caption num text-ink-mute">in USD</p>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={seedRevenue} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="terraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 38)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 38)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.88 0.02 80)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'oklch(0.52 0.028 270)' }} stroke="oklch(0.88 0.02 80)" />
                <YAxis tick={{ fontSize: 12, fill: 'oklch(0.52 0.028 270)' }} stroke="oklch(0.88 0.02 80)" />
                <Tooltip
                  contentStyle={{ background: 'oklch(0.985 0.012 82)', border: '1px solid oklch(0.88 0.02 80)', borderRadius: '0.375rem', fontFamily: 'Inter' }}
                  formatter={(v: any) => formatCurrency(Number(v))}
                />
                <Area type="monotone" dataKey="mrr" stroke="oklch(0.48 0.18 36)" fill="url(#terraGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-rule bg-paper-soft p-6">
          <p className="eyebrow">Active subscribers · by tier</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={tierBreakdown} layout="vertical" margin={{ top: 10, right: 16, bottom: 8, left: 28 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.88 0.02 80)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'oklch(0.52 0.028 270)' }} stroke="oklch(0.88 0.02 80)" />
                <YAxis dataKey="tier" type="category" tick={{ fontSize: 12, fill: 'oklch(0.22 0.04 268)' }} stroke="oklch(0.88 0.02 80)" />
                <Tooltip
                  contentStyle={{ background: 'oklch(0.985 0.012 82)', border: '1px solid oklch(0.88 0.02 80)', borderRadius: '0.375rem', fontFamily: 'Inter' }}
                  formatter={(v: any) => formatNumber(Number(v))}
                />
                <Bar dataKey="count" fill="oklch(0.62 0.16 38)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="eyebrow">By the numbers</p>
        <h2 className="mt-2 font-display text-title1 leading-tight">{formatNumber(activeSubs)} demo accounts hold a paid subscription.</h2>
        <p className="mt-2 max-w-prose text-footnote text-ink-mute">
          In the deployed app, this view pulls from Stripe via a Cloud Function and caches the result for 5 minutes. Prices: {TIERS.map((t) => `${t.name} $${t.priceMonthly}`).join(', ')}.
        </p>
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  delta,
  up,
  good = up,
  neutral,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  good?: boolean;
  neutral?: boolean;
  icon: typeof DollarSign;
}) {
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-md border border-rule bg-paper-soft p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <Icon className="size-4 text-ink-mute" />
      </div>
      <p className="mt-3 font-display text-largeTitle leading-none num">{value}</p>
      <p className={`mt-2 inline-flex items-center gap-1 text-caption num ${neutral ? 'text-ink-mute' : good ? 'text-success' : 'text-danger'}`}>
        <Arrow className="size-3" /> {delta}
      </p>
    </div>
  );
}
