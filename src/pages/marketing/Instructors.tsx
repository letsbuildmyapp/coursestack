import { MarketingNav } from '@/components/layout/MarketingNav';
import { Footer } from '@/components/layout/Footer';
import { demoStore } from '@/lib/store';

export function Instructors() {
  const instructors = demoStore.listAllUsers().filter((u) => u.roles.includes('instructor'));
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <p className="eyebrow">Faculty</p>
        <h1 className="mt-2 font-display text-largeTitle leading-tight">All faculty.</h1>
        <p className="mt-4 max-w-2xl text-body text-ink-soft">
          Each instructor is interviewed, edited, and produced. We don't repost YouTube content.
        </p>
        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {instructors.map((inst) => (
            <article key={inst.id} className="flex flex-col">
              <div className="aspect-[3/4] overflow-hidden rounded-md border border-rule">
                {inst.avatarUrl && (
                  <img src={inst.avatarUrl} alt={inst.displayName} className="h-full w-full object-cover grayscale" />
                )}
              </div>
              <h3 className="mt-4 font-display text-title2 leading-tight">{inst.displayName}</h3>
              <p className="mt-2 text-footnote text-ink-soft">{inst.bio}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
