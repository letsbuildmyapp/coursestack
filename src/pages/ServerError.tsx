import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ServerError() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-lg text-center">
        <p className="eyebrow num">500 · Server hiccup</p>
        <h1 className="mt-3 font-display text-mega leading-none num">500</h1>
        <p className="mt-6 max-w-prose text-body text-ink-soft">
          Something on our end stumbled. We were notified. Try again in a minute.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="terra" asChild><Link to="/">Home</Link></Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    </main>
  );
}
