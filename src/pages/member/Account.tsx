import { useEffect, useRef, useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { TIERS } from '@/lib/pricing';
import { formatCurrency, initials } from '@/lib/utils';
import { toast } from 'sonner';
import type { Tier } from '@/types';

export function Account({ section }: { section?: 'billing' }) {
  const { user } = useAuth();
  const billingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (section === 'billing' && billingRef.current) {
      billingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [section]);

  if (!user) return null;

  return (
    <AppShell pageEyebrow="Account">
      <div className="max-w-4xl">
        <h1 className="font-display text-largeTitle leading-tight">Account.</h1>
        <p className="mt-1 text-body text-ink-soft">Profile, plan, billing.</p>
        <Profile />
        <div ref={billingRef} className="scroll-mt-20">
          <Billing />
        </div>
      </div>
    </AppShell>
  );
}

function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  const [name, setName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');

  function save() {
    demoStore.updateProfile(user!.id, { displayName: name, bio });
    toast.success('Profile saved.');
  }

  return (
    <section className="mt-10 rounded-md border border-rule bg-paper-soft p-6">
      <p className="eyebrow">Profile</p>
      <div className="mt-4 flex items-start gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex justify-end">
            <Button variant="terra" onClick={save}>Save</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Billing() {
  const { user } = useAuth();
  if (!user) return null;

  function pickTier(t: Tier) {
    demoStore.setTier(user!.id, t, t === 'free' ? 'none' : 'active');
    toast.success(t === 'free' ? 'Downgraded to free.' : `Activated ${t.toUpperCase()} (demo).`);
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Plan &amp; billing</p>
          <h2 className="mt-1 font-display text-title1 leading-tight">
            Currently on <span className="capitalize">{user.tier}</span>{user.subscriptionStatus === 'active' ? '.' : ` · ${user.subscriptionStatus}`}
          </h2>
          <p className="mt-2 text-footnote text-ink-mute">
            Pick a plan. In production this opens Stripe Checkout / Customer Portal — here, the demo flips state instantly.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => {
          const current = user.tier === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-md border p-6 ${current ? 'border-ink bg-paper-soft' : 'border-rule bg-paper'}`}
            >
              <div className="flex items-start justify-between">
                <p className="eyebrow">{t.name}</p>
                {current && <Badge variant="terra">Current</Badge>}
              </div>
              <p className="mt-3 font-display text-display leading-none num">
                {t.priceMonthly === 0 ? 'Free' : formatCurrency(t.priceMonthly)}
                {t.priceMonthly > 0 && <span className="text-title3 text-ink-mute font-normal">/mo</span>}
              </p>
              <ul className="mt-5 space-y-2 text-footnote text-ink-soft">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="size-3.5 mt-0.5 text-terra" />{f}</li>
                ))}
              </ul>
              <Button
                disabled={current}
                variant={t.highlight ? 'terra' : 'outline'}
                className="mt-6 w-full"
                onClick={() => pickTier(t.id)}
              >
                {current ? 'Active' : t.id === 'free' ? 'Downgrade to free' : `Switch to ${t.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-md border border-rule bg-paper-soft p-6">
        <div className="flex items-center gap-3">
          <CreditCard className="size-5 text-ink-mute" />
          <div>
            <p className="text-headline">Manage billing in Stripe</p>
            <p className="text-caption text-ink-mute">In production, opens the Stripe Customer Portal in a new tab.</p>
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => toast.message('Stripe Customer Portal would open now.')}>
            Open portal
          </Button>
        </div>
      </div>
    </section>
  );
}
