import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SEED_PASSWORD } from '@/data/seed';

const schema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof schema>;

const DEMO_LOGINS = [
  { email: 'pro@coursestack.demo', label: 'Member · Pro tier' },
  { email: 'team@coursestack.demo', label: 'Member · Team tier' },
  { email: 'free@coursestack.demo', label: 'Member · Free tier' },
  { email: 'ada@coursestack.demo', label: 'Instructor' },
  { email: 'admin@coursestack.demo', label: 'Admin' },
];

export function Login() {
  const { signIn, signInWithGoogle, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const intended = (loc.state as { from?: string } | null)?.from ?? '/dashboard';
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const [authErr, setAuthErr] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setAuthErr(null);
    try {
      await signIn(values.email, values.password);
      toast.success(`Welcome back.`);
      nav(intended);
    } catch (e: any) {
      setAuthErr(e.message ?? 'Sign in failed.');
    }
  }

  function fillDemo(email: string) {
    setValue('email', email);
    setValue('password', SEED_PASSWORD);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between border-r border-rule bg-paper-soft p-10">
        <Link to="/" className="font-display text-title2">CourseStack</Link>
        <div className="max-w-md">
          <p className="eyebrow">Returning member</p>
          <h1 className="mt-3 font-display text-largeTitle leading-tight">
            Pick up where you left off.
          </h1>
          <p className="mt-4 text-body text-ink-soft">
            Your bookmarks, notes, and progress are exactly where you parked them.
          </p>
        </div>
        <p className="text-caption text-ink-mute num">Vol. I · Issue 03</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Sign in</p>
          <h1 className="mt-2 font-display text-title1 leading-tight">Welcome back.</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-caption text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot" className="text-caption text-ink-mute hover:text-terra-deep">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} className="mt-1.5" />
              {errors.password && <p className="mt-1 text-caption text-danger">{errors.password.message}</p>}
            </div>
            {authErr && (
              <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-footnote text-danger">
                {authErr}
              </div>
            )}
            <Button type="submit" variant="terra" size="lg" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-caption text-ink-mute">
            <span className="h-px flex-1 bg-rule" />
            or
            <span className="h-px flex-1 bg-rule" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={async () => {
              try {
                await signInWithGoogle();
                nav(intended);
              } catch (e: any) {
                setAuthErr(e.message);
              }
            }}
          >
            Continue with Google
          </Button>

          <p className="mt-8 text-footnote text-ink-mute">
            New here?{' '}
            <Link to="/signup" className="font-medium text-ink underline-offset-4 hover:underline decoration-terra decoration-2">
              Make an account
            </Link>
          </p>

          <div className="mt-10 rounded-md border border-rule bg-paper-soft p-4">
            <p className="eyebrow">Demo accounts</p>
            <p className="mt-2 text-caption text-ink-mute">Click any to autofill — password is <code className="font-mono text-ink">{SEED_PASSWORD}</code>.</p>
            <ul className="mt-3 space-y-1.5">
              {DEMO_LOGINS.map((d) => (
                <li key={d.email}>
                  <button
                    type="button"
                    onClick={() => fillDemo(d.email)}
                    className="w-full text-left text-caption text-ink-soft hover:text-terra-deep"
                  >
                    <span className="num">{d.email}</span>
                    <span className="ml-2 text-ink-mute">— {d.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
