import type { AppUser, Course, Lesson, Tier } from '@/types';

const RANK: Record<Tier, number> = { free: 1, pro: 2, team: 3 };

export function tierRank(t: Tier) {
  return RANK[t];
}

export function userTierGrants(user: AppUser | null, tier: Tier): boolean {
  if (!user) return tier === 'free';
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
    return tier === 'free';
  }
  return tierRank(user.tier) >= tierRank(tier);
}

export function canAccessLesson(user: AppUser | null, course: Course, lesson: Lesson): boolean {
  if (!user) return lesson.isFreePreview;
  if (user.roles.includes('admin')) return true;
  if (user.roles.includes('instructor') && course.instructorId === user.id) return true;
  if (lesson.isFreePreview) return true;
  return userTierGrants(user, course.tier);
}

export function progressPercent(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.min(1, completed / total);
}

export interface QuizAttempt {
  selected: Record<string, number>;
}

export function scoreQuiz(lesson: Lesson, attempt: QuizAttempt) {
  if (lesson.type !== 'quiz' || !lesson.questions) return { score: 0, passed: false, total: 0, correct: 0 };
  const total = lesson.questions.length;
  let correct = 0;
  for (const q of lesson.questions) {
    if (attempt.selected[q.id] === q.correctIndex) correct++;
  }
  const score = correct / total;
  return { score, passed: score >= 0.7, total, correct };
}
