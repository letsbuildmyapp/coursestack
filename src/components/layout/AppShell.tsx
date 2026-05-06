import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  PenLine,
  Users,
  BarChart3,
  LogOut,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn, initials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CommandPalette } from '@/components/CommandPalette';

interface Props {
  children: ReactNode;
  pageEyebrow?: string;
}

export function AppShell({ children, pageEyebrow }: Props) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        e.preventDefault();
        setPaletteOpen((s) => !s);
        return;
      }
      // "/" opens search when not typing in an input
      if (e.key === '/' && !paletteOpen) {
        const tag = target?.tagName;
        const editable = target?.isContentEditable;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && !editable) {
          e.preventDefault();
          setPaletteOpen(true);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  if (!user) return null;

  const isInstructor = user.roles.includes('instructor');
  const isAdmin = user.roles.includes('admin');
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-rule bg-paper px-5 lg:h-screen lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-0 lg:py-6 lg:bg-paper-soft">
        <Link to="/" className="font-display text-title2 leading-none lg:px-6">
          CourseStack
        </Link>
        <nav className="hidden gap-1 px-3 lg:mt-10 lg:flex lg:flex-col" data-tour="sidebar">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" tour="nav-dashboard" />
          <NavItem to="/catalog" icon={Compass} label="Catalog" tour="nav-catalog" />
          <NavItem to="/library" icon={BookOpen} label="My library" />

          {isInstructor && (
            <>
              <p className="mt-6 px-3 eyebrow">Instructor</p>
              <NavItem to="/instructor" icon={PenLine} label="My courses" tour="nav-instructor" />
            </>
          )}

          {isAdmin && (
            <>
              <p className="mt-6 px-3 eyebrow">Admin</p>
              <NavItem to="/admin/users" icon={Users} label="Users" tour="nav-admin-users" />
              <NavItem to="/admin/courses" icon={BookOpen} label="Courses" />
              <NavItem to="/admin/revenue" icon={BarChart3} label="Revenue" tour="nav-admin-revenue" />
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <Avatar className="size-9">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign out</Button>
        </div>

        <div className="mt-auto hidden border-t border-rule px-5 pt-5 lg:block">
          <Link to="/account" className="flex items-center gap-3 rounded-md p-2 hover:bg-paper">
            <Avatar className="size-9">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-footnote font-medium text-ink">{user.displayName}</p>
              <p className="truncate text-caption text-ink-mute">{user.email}</p>
            </div>
            <ChevronRight className="size-4 text-ink-mute" />
          </Link>
          <button
            onClick={() => {
              signOut();
              nav('/');
            }}
            className="mt-3 flex w-full items-center gap-2 px-2 py-1.5 text-caption text-ink-mute hover:text-terra-deep"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex h-16 items-center gap-4 border-b border-rule bg-paper px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-9 flex-1 items-center gap-2 rounded-md border border-rule px-3 text-footnote text-ink-mute transition-colors hover:border-ink hover:text-ink md:flex"
            aria-label="Open command palette"
          >
            <Search className="size-4" />
            <span>Search the library, jump anywhere…</span>
            <kbd className="ml-auto rounded bg-paper-deep px-1.5 py-0.5 text-caption text-ink-soft">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="rounded-md p-2 text-ink-soft hover:bg-paper-soft md:hidden"
            aria-label="Open command palette"
          >
            <Search className="size-4" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant={user.subscriptionStatus === 'active' ? 'sage' : 'soft'} className="num">
              {user.tier} · {user.subscriptionStatus === 'active' ? 'active' : user.subscriptionStatus}
            </Badge>
            {user.tier === 'free' && (
              <Button size="sm" variant="terra" asChild data-tour="upgrade">
                <Link to="/account/billing">Upgrade</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
          {pageEyebrow && <p className="eyebrow mb-2">{pageEyebrow}</p>}
          {children}
        </div>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  tour,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  tour?: string;
}) {
  return (
    <NavLink
      to={to}
      data-tour={tour}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-footnote font-medium transition-colors',
          isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
        )
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  );
}
