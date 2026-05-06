import { describe, it, expect } from 'vitest';
import { canAccessLesson, progressPercent, scoreQuiz, userTierGrants } from '@/lib/access';
import type { AppUser, Course, Lesson } from '@/types';

const baseUser: AppUser = {
  id: 'u1',
  email: 'a@b.c',
  displayName: 'Test',
  roles: ['member'],
  tier: 'pro',
  subscriptionStatus: 'active',
  createdAt: 0,
};

const course: Course = {
  id: 'c1', slug: 'c', title: 'C', description: '', coverImage: '',
  instructorId: 'inst', instructorName: 'I', tier: 'pro', tags: [], topic: 'business',
  published: true, rating: 4.5, enrollmentCount: 10, totalLessons: 5, estimatedMinutes: 60,
  createdAt: 0, modules: [],
};

const previewLesson: Lesson = {
  id: 'l1', courseId: 'c1', moduleId: 'm1', title: 'L', order: 0, type: 'text',
  content: '', durationMinutes: 5, isFreePreview: true,
};

const paidLesson: Lesson = { ...previewLesson, id: 'l2', isFreePreview: false };

describe('userTierGrants', () => {
  it('grants higher tiers to lower-tier courses', () => {
    expect(userTierGrants({ ...baseUser, tier: 'team' }, 'pro')).toBe(true);
    expect(userTierGrants({ ...baseUser, tier: 'pro' }, 'pro')).toBe(true);
    expect(userTierGrants({ ...baseUser, tier: 'free', subscriptionStatus: 'none' }, 'pro')).toBe(false);
  });

  it('inactive subscriptions only get free', () => {
    expect(userTierGrants({ ...baseUser, tier: 'pro', subscriptionStatus: 'canceled' }, 'pro')).toBe(false);
    expect(userTierGrants({ ...baseUser, tier: 'pro', subscriptionStatus: 'canceled' }, 'free')).toBe(true);
  });

  it('treats anonymous as free-only', () => {
    expect(userTierGrants(null, 'free')).toBe(true);
    expect(userTierGrants(null, 'pro')).toBe(false);
  });
});

describe('canAccessLesson', () => {
  it('lets anyone read a free preview', () => {
    expect(canAccessLesson(null, course, previewLesson)).toBe(true);
  });

  it('blocks paid lessons for users without the tier', () => {
    expect(canAccessLesson({ ...baseUser, tier: 'free', subscriptionStatus: 'none' }, course, paidLesson)).toBe(false);
  });

  it('grants admins access to any lesson', () => {
    expect(canAccessLesson({ ...baseUser, roles: ['admin'], tier: 'free' }, course, paidLesson)).toBe(true);
  });

  it('grants the owning instructor access', () => {
    expect(canAccessLesson({ ...baseUser, id: 'inst', roles: ['instructor'], tier: 'free', subscriptionStatus: 'none' }, course, paidLesson)).toBe(true);
  });
});

describe('progressPercent', () => {
  it('handles zero total', () => {
    expect(progressPercent(0, 0)).toBe(0);
  });
  it('clamps to 1', () => {
    expect(progressPercent(11, 10)).toBe(1);
  });
  it('rounds proportionally', () => {
    expect(progressPercent(3, 4)).toBe(0.75);
  });
});

describe('scoreQuiz', () => {
  const quiz: Lesson = {
    ...previewLesson,
    type: 'quiz',
    questions: [
      { id: 'q1', prompt: '?', options: ['a', 'b'], correctIndex: 1 },
      { id: 'q2', prompt: '?', options: ['a', 'b', 'c'], correctIndex: 2 },
      { id: 'q3', prompt: '?', options: ['x', 'y'], correctIndex: 0 },
    ],
  };

  it('passes at >= 70%', () => {
    const r = scoreQuiz(quiz, { selected: { q1: 1, q2: 2, q3: 0 } });
    expect(r.passed).toBe(true);
    expect(r.correct).toBe(3);
  });

  it('fails below 70%', () => {
    const r = scoreQuiz(quiz, { selected: { q1: 0, q2: 0, q3: 0 } });
    expect(r.passed).toBe(false);
    expect(r.correct).toBe(1);
  });

  it('returns zero state for non-quiz lessons', () => {
    const r = scoreQuiz(previewLesson, { selected: {} });
    expect(r).toEqual({ score: 0, passed: false, total: 0, correct: 0 });
  });
});
