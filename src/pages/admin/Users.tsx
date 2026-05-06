import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { demoStore } from '@/lib/store';
import { initials, formatNumber, relativeTime } from '@/lib/utils';
import type { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AdminUsers() {
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState<'all' | Role>('all');

  const users = useMemo(() => {
    return demoStore.listAllUsers().filter((u) => {
      if (roleF !== 'all' && !u.roles.includes(roleF)) return false;
      if (q && !`${u.displayName} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, roleF]);

  return (
    <AppShell pageEyebrow="Admin">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-largeTitle leading-tight">Users.</h1>
          <p className="mt-1 text-body text-ink-soft">{formatNumber(users.length)} {users.length === 1 ? 'account' : 'accounts'}.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3" data-tour="users-filter">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'admin', 'instructor', 'member'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleF(r as any)}
              className={`rounded-md px-3 py-1.5 text-caption uppercase tracking-[0.06em] ${
                roleF === r ? 'bg-ink text-paper' : 'border border-rule text-ink-soft hover:border-ink'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-rule">
        <table className="w-full">
          <thead className="bg-paper-soft text-left">
            <tr className="text-caption uppercase tracking-[0.06em] text-ink-mute">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Roles</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule bg-paper">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-paper-soft">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{initials(u.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-headline">{u.displayName}</p>
                      <p className="text-caption text-ink-mute num">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => <Badge key={r} variant={r === 'admin' ? 'terra' : 'soft'}>{r}</Badge>)}
                  </div>
                </td>
                <td className="px-5 py-3"><Badge variant="outline">{u.tier}</Badge></td>
                <td className="px-5 py-3">
                  <Badge variant={u.subscriptionStatus === 'active' ? 'success' : u.subscriptionStatus === 'past_due' ? 'danger' : 'soft'}>
                    {u.subscriptionStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-footnote text-ink-mute num">{relativeTime(u.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const isInstructor = u.roles.includes('instructor');
                      demoStore.setRoles(u.id, isInstructor ? u.roles.filter((r) => r !== 'instructor') : [...u.roles, 'instructor']);
                      toast.success(isInstructor ? 'Instructor role removed.' : 'Promoted to instructor.');
                    }}
                  >
                    {u.roles.includes('instructor') ? 'Demote' : 'Promote'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
