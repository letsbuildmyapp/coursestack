import { Link } from 'react-router-dom';
import { Plus, Users, Star, Eye, EyeOff } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { demoStore } from '@/lib/store';
import { formatMinutes, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function InstructorHome() {
  const { user } = useAuth();
  if (!user) return null;
  const courses = demoStore.listInstructorCourses(user.id);
  const totalEnrollments = courses.reduce((acc, c) => acc + c.enrollmentCount, 0);

  return (
    <AppShell pageEyebrow="Instructor desk">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-largeTitle leading-tight">My courses.</h1>
          <p className="mt-1 text-body text-ink-soft">{courses.length} published · {formatNumber(totalEnrollments)} reading members.</p>
        </div>
        <Button variant="terra" size="lg" asChild data-tour="new-course">
          <Link to="/instructor/new">
            <Plus className="size-4" /> New course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-rule p-12 text-center">
          <p className="eyebrow">Empty desk</p>
          <h2 className="mt-2 font-display text-title2">No courses yet.</h2>
          <p className="mt-2 text-footnote text-ink-mute">Use the AI outline generator to start one in under a minute.</p>
          <Button variant="terra" className="mt-6" asChild>
            <Link to="/instructor/new">Create your first course</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-md border border-rule">
          <table className="w-full">
            <thead className="bg-paper-soft text-left">
              <tr className="text-caption uppercase tracking-[0.06em] text-ink-mute">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Tier</th>
                <th className="px-5 py-3 text-right num">Enrollments</th>
                <th className="px-5 py-3 text-right num">Rating</th>
                <th className="px-5 py-3 text-right num">Length</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-rule bg-paper">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <Link to={`/instructor/${c.id}`} className="font-display text-title3 leading-tight hover:text-terra-deep">
                      {c.title}
                    </Link>
                    <p className="text-caption text-ink-mute">{c.subtitle}</p>
                  </td>
                  <td className="px-5 py-3"><Badge variant={c.tier === 'free' ? 'soft' : c.tier === 'pro' ? 'terra' : 'default'}>{c.tier}</Badge></td>
                  <td className="px-5 py-3 text-right num"><Users className="mr-1 inline size-3" />{formatNumber(c.enrollmentCount)}</td>
                  <td className="px-5 py-3 text-right num"><Star className="mr-1 inline size-3 fill-terra text-terra" />{c.rating.toFixed(1)}</td>
                  <td className="px-5 py-3 text-right num">{formatMinutes(c.estimatedMinutes)}</td>
                  <td className="px-5 py-3">
                    {c.published ? (
                      <span className="inline-flex items-center gap-1 text-footnote text-success"><Eye className="size-3" /> Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-footnote text-ink-mute"><EyeOff className="size-3" /> Draft</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => { demoStore.togglePublished(c.id); toast.success(c.published ? 'Unpublished.' : 'Published.'); }}>
                      Toggle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
