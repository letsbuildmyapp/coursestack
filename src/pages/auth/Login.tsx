import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Crown, Users, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { SEED_PASSWORD } from '@/data/seed';

const DEMO_LOGINS = [
  { email: 'pro@coursestack.demo', password: SEED_PASSWORD, label: 'Pro Member', description: 'Pro tier — all courses', icon: Crown, color: 'from-amber-500 to-orange-500' },
  { email: 'team@coursestack.demo', password: SEED_PASSWORD, label: 'Team Member', description: 'Team tier — shared seats', icon: Users, color: 'from-emerald-500 to-teal-500' },
  { email: 'free@coursestack.demo', password: SEED_PASSWORD, label: 'Free Member', description: 'Free tier — limited access', icon: Sparkles, color: 'from-sky-500 to-cyan-500' },
  { email: 'ada@coursestack.demo', password: SEED_PASSWORD, label: 'Instructor', description: 'Ada — course author', icon: GraduationCap, color: 'from-violet-500 to-fuchsia-500' },
  { email: 'admin@coursestack.demo', password: SEED_PASSWORD, label: 'Admin', description: 'Platform admin', icon: ShieldCheck, color: 'from-indigo-500 to-violet-500' },
];

export function Login() {
  const { signIn, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const intended = (loc.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [authErr, setAuthErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthErr(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back.');
      nav(intended);
    } catch (e: any) {
      setAuthErr(e.message ?? 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDemoLogin(d: (typeof DEMO_LOGINS)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setDemoLoading(d.email);
    setAuthErr(null);
    try {
      await signIn(d.email, d.password);
      toast.success(`Signed in as ${d.label}`);
      nav(intended);
    } catch (e: any) {
      setAuthErr(e.message ?? 'Sign in failed.');
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-paper">

      <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-8 sm:pt-12 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <Card className="border-rule bg-paper-soft p-8 shadow-2xl">
            <div className="space-y-1.5">
              <h1 className="font-display text-title1 leading-tight">Sign in to CourseStack</h1>
              <p className="text-caption text-ink-mute">
                New here?{' '}
                <Link to="/signup" className="font-medium text-ink underline-offset-4 hover:underline decoration-terra decoration-2">
                  Make an account
                </Link>
              </p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="eyebrow">One-click demo logins</span>
                <span className="text-[10px] text-ink-mute">No password needed</span>
              </div>
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onDemoLogin(d)}
                  disabled={demoLoading !== null || submitting}
                  className="group flex items-center gap-3 rounded-md border border-rule bg-paper p-3 text-left transition-all hover:border-terra hover:bg-paper-soft disabled:opacity-50"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br ${d.color} text-white shadow-sm`}>
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="truncate text-caption text-ink-mute">{d.description}</div>
                  </div>
                  {demoLoading === d.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink-mute" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-ink-mute transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-rule" />
              </div>
              <div className="relative flex justify-center text-caption uppercase tracking-wider">
                <span className="bg-paper-soft px-3 text-ink-mute">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="you@company.com" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot" className="text-caption text-ink-mute hover:text-terra-deep">
                    Forgot?
                  </Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" placeholder="••••••••" />
              </div>
              {authErr && (
                <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-footnote text-danger">{authErr}</div>
              )}
              <Button type="submit" variant="terra" size="lg" className="w-full" disabled={submitting || loading}>
                {submitting || loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-caption text-ink-mute sm:px-10">
        <a href="https://letsbuildmyapp.com" target="_blank" rel="noreferrer" className="font-medium text-ink underline-offset-4 hover:underline">
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
