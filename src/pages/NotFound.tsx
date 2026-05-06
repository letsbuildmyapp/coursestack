import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-lg text-center">
        <p className="eyebrow num">404 · Page not found</p>
        <h1 className="mt-3 font-display text-mega leading-none num">404</h1>
        <p className="mt-6 max-w-prose text-body text-ink-soft">
          The page you wanted has gone to the printer and not come back. Check the URL, or step back to the catalog.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="terra" asChild><Link to="/">Home</Link></Button>
          <Button variant="outline" asChild><Link to="/catalog">Catalog</Link></Button>
        </div>
      </div>
    </main>
  );
}
