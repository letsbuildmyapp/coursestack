import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { TIERS } from '@/lib/pricing';
import { demoStore } from '@/lib/store';

const schema = z.object({
  displayName: z.string().min(2, 'Name is too short.'),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});

type FormValues = z.infer<typeof schema>;

export function Signup() {
  const { signUp, signInWithGoogle, loading } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const intendedTier = (params.get('tier') ?? 'free') as 'free' | 'pro' | 'team';
  const tier = TIERS.find((t) => t.id === intendedTier) ?? TIERS[0];
  const [authErr, setAuthErr] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    setAuthErr(null);
    try {
      const u = await signUp(values.email, values.password, values.displayName);
      if (intendedTier !== 'free') {
        // Demo: simulate Stripe Checkout flip
        demoStore.setTier(u.id, intendedTier, 'active');
        toast.success(`Welcome — ${tier!.name} access activated (demo).`);
      } else {
        toast.success('Welcome to CourseStack.');
      }
      nav('/dashboard?onboard=1');
    } catch (e: any) {
      setAuthErr(e.message ?? 'Signup failed.');
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between border-r border-rule bg-paper-soft p-10">
        <Link to="/" className="font-display text-title2">CourseStack</Link>
        <div className="max-w-md">
          <p className="eyebrow">{tier!.name} tier</p>
          <h1 className="mt-3 font-display text-largeTitle leading-tight">
            One subscription. Six new courses every quarter.
          </h1>
          <p className="mt-4 text-body text-ink-soft">{tier!.description}</p>
          <ul className="mt-6 space-y-2 text-footnote text-ink-soft">
            {tier!.features.slice(0, 4).map((f) => <li key={f}>· {f}</li>)}
          </ul>
        </div>
        <p className="text-caption text-ink-mute num">14-day refund window</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Create account</p>
          <h1 className="mt-2 font-display text-title1 leading-tight">
            {intendedTier === 'free' ? 'Make a free account.' : `Subscribe to ${tier!.name}.`}
          </h1>
          {intendedTier !== 'free' && (
            <p className="mt-2 text-footnote text-ink-mute">
              <span className="num">${tier!.priceMonthly}</span>/mo · cancel any time.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" autoComplete="name" {...register('displayName')} className="mt-1.5" />
              {errors.displayName && <p className="mt-1 text-caption text-danger">{errors.displayName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-caption text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} className="mt-1.5" />
              {errors.password && <p className="mt-1 text-caption text-danger">{errors.password.message}</p>}
            </div>
            {authErr && (
              <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-footnote text-danger">{authErr}</div>
            )}
            <Button type="submit" variant="terra" size="lg" className="w-full" disabled={isSubmitting || loading}>
              {intendedTier === 'free' ? 'Create account' : `Pay $${tier!.priceMonthly} (test mode)`}
            </Button>
            {intendedTier !== 'free' && (
              <p className="text-caption text-ink-mute">
                You'll be redirected to a Stripe Checkout test page. Use{' '}
                <code className="font-mono text-ink">4242 4242 4242 4242</code> with any future date.
              </p>
            )}
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
                nav('/dashboard');
              } catch (e: any) {
                setAuthErr(e.message);
              }
            }}
          >
            Continue with Google
          </Button>

          <p className="mt-8 text-footnote text-ink-mute">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline decoration-terra decoration-2">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
