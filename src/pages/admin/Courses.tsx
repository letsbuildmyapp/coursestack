import { Link } from 'react-router-dom';
import { Eye, EyeOff, Star, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { demoStore } from '@/lib/store';
import { formatMinutes, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function AdminCourses() {
  const courses = demoStore.listAllCourses();
  const enrollmentByCourse = demoStore.listAllEnrollments().reduce<Record<string, number>>((acc, e) => {
    acc[e.courseId] = (acc[e.courseId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell pageEyebrow="Admin">
      <h1 className="font-display text-largeTitle leading-tight">All courses.</h1>
      <p className="mt-1 text-body text-ink-soft">{courses.length} total · {courses.filter((c) => c.published).length} published.</p>

      <div className="mt-8 overflow-hidden rounded-md border border-rule">
        <table className="w-full">
          <thead className="bg-paper-soft text-left">
            <tr className="text-caption uppercase tracking-[0.06em] text-ink-mute">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Instructor</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3 text-right num">Enrollments</th>
              <th className="px-5 py-3 text-right num">Rating</th>
              <th className="px-5 py-3 text-right num">Length</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule bg-paper">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <Link to={`/courses/${c.slug}`} className="font-display text-title3 leading-tight hover:text-terra-deep">{c.title}</Link>
                  <p className="text-caption text-ink-mute">{c.subtitle}</p>
                </td>
                <td className="px-5 py-3 text-footnote">{c.instructorName}</td>
                <td className="px-5 py-3"><Badge variant={c.tier === 'free' ? 'soft' : c.tier === 'pro' ? 'terra' : 'default'}>{c.tier}</Badge></td>
                <td className="px-5 py-3 text-right num"><Users className="mr-1 inline size-3" />{formatNumber(enrollmentByCourse[c.id] ?? c.enrollmentCount)}</td>
                <td className="px-5 py-3 text-right num"><Star className="mr-1 inline size-3 fill-terra text-terra" />{c.rating.toFixed(1)}</td>
                <td className="px-5 py-3 text-right num">{formatMinutes(c.estimatedMinutes)}</td>
                <td className="px-5 py-3">
                  {c.published ? (
                    <span className="inline-flex items-center gap-1 text-footnote text-success"><Eye className="size-3" /> Live</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-footnote text-ink-mute"><EyeOff className="size-3" /> Draft</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { demoStore.togglePublished(c.id); toast.success(c.published ? 'Unpublished.' : 'Published.'); }}>
                    Toggle
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
