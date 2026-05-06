import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function MarketingNav() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-rule/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-title2 leading-none tracking-tight">CourseStack</span>
          <span className="eyebrow hidden sm:inline">est. 2026</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          <Link to="/catalog" className="text-footnote font-medium text-ink hover:text-terra-deep">
            Catalog
          </Link>
          <Link to="/instructors" className="text-footnote font-medium text-ink hover:text-terra-deep">
            Instructors
          </Link>
          <a href="#pricing" className="text-footnote font-medium text-ink hover:text-terra-deep">
            Pricing
          </a>
          <a href="#editorial" className="text-footnote font-medium text-ink hover:text-terra-deep">
            The Quarterly
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" variant="terra" asChild>
                <Link to="/signup">Start learning</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
