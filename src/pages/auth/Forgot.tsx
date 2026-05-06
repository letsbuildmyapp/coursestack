import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function Forgot() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="font-display text-title2">CourseStack</Link>
      <p className="mt-12 eyebrow">Account recovery</p>
      <h1 className="mt-2 font-display text-title1">Reset your password.</h1>
      {sent ? (
        <div className="mt-8 rounded-md border border-rule bg-paper-soft p-6">
          <p className="text-body">Check your inbox. A reset link is on the way (demo mode — nothing was actually sent).</p>
          <Button asChild className="mt-6"><Link to="/login">Back to sign in</Link></Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => setSent(true))} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          </div>
          <Button type="submit" variant="terra" size="lg" className="w-full" disabled={formState.isSubmitting}>
            Send reset link
          </Button>
          <Link to="/login" className="block text-caption text-ink-mute hover:text-terra-deep">← Back to sign in</Link>
        </form>
      )}
    </main>
  );
}
