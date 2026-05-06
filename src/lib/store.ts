// Local in-memory + localStorage-persisted demo store. The app uses this through
// `lib/data.ts` which switches to Firestore when real Firebase keys are set.

import type { AppUser, Course, Enrollment, LessonNote, Progress, Role, Tier } from '@/types';
import { seedCourses, seedEnrollments, seedNotes, seedProgress, seedUsers, SEED_PASSWORD } from '@/data/seed';

const NS = 'coursestack:store:v1';

interface DemoStoreShape {
  users: AppUser[];
  courses: Course[];
  enrollments: Enrollment[];
  progress: Progress[];
  notes: LessonNote[];
  passwords: Record<string, string>;
  currentUserId: string | null;
}

function load(): DemoStoreShape {
  if (typeof window === 'undefined') {
    return freshState();
  }
  try {
    const raw = window.localStorage.getItem(NS);
    if (!raw) {
      const fresh = freshState();
      save(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as DemoStoreShape;
    return parsed;
  } catch {
    return freshState();
  }
}

function save(state: DemoStoreShape) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NS, JSON.stringify(state));
}

function freshState(): DemoStoreShape {
  const passwords: Record<string, string> = {};
  for (const u of seedUsers) passwords[u.email.toLowerCase()] = SEED_PASSWORD;
  return {
    users: seedUsers,
    courses: seedCourses,
    enrollments: seedEnrollments,
    progress: seedProgress,
    notes: seedNotes,
    passwords,
    currentUserId: null,
  };
}

let state = load();

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  save(state);
  for (const l of listeners) l();
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const demoStore = {
  reset() {
    state = freshState();
    emit();
  },

  // Auth
  currentUser(): AppUser | null {
    if (!state.currentUserId) return null;
    return state.users.find((u) => u.id === state.currentUserId) ?? null;
  },

  signIn(email: string, password: string): AppUser {
    const lower = email.toLowerCase();
    const user = state.users.find((u) => u.email.toLowerCase() === lower);
    if (!user) throw new Error('No account with that email.');
    const pw = state.passwords[lower];
    if (pw !== password) throw new Error('Wrong password.');
    state.currentUserId = user.id;
    emit();
    return user;
  },

  signInWithGoogle(): AppUser {
    // demo only — sign in as the pro member
    const user = state.users.find((u) => u.id === 'u_member_pro')!;
    state.currentUserId = user.id;
    emit();
    return user;
  },

  signUp(email: string, password: string, displayName: string): AppUser {
    const lower = email.toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === lower)) {
      throw new Error('An account with that email already exists.');
    }
    const id = `u_${Math.random().toString(36).slice(2, 10)}`;
    const user: AppUser = {
      id,
      email,
      displayName,
      roles: ['member'],
      tier: 'free',
      subscriptionStatus: 'none',
      createdAt: Date.now(),
    };
    state.users.push(user);
    state.passwords[lower] = password;
    state.currentUserId = id;
    emit();
    return user;
  },

  signOut() {
    state.currentUserId = null;
    emit();
  },

  updateProfile(userId: string, patch: Partial<AppUser>) {
    state.users = state.users.map((u) => (u.id === userId ? { ...u, ...patch } : u));
    emit();
  },

  setRoles(userId: string, roles: Role[]) {
    state.users = state.users.map((u) => (u.id === userId ? { ...u, roles } : u));
    emit();
  },

  setTier(userId: string, tier: Tier, status: AppUser['subscriptionStatus'] = 'active') {
    state.users = state.users.map((u) =>
      u.id === userId
        ? {
            ...u,
            tier,
            subscriptionStatus: status,
            currentPeriodEnd: status === 'active' ? Date.now() + 30 * 86400_000 : undefined,
            stripeCustomerId: u.stripeCustomerId ?? `cus_demo_${u.id}`,
          }
        : u,
    );
    emit();
  },

  // Courses
  listCourses() {
    return state.courses.filter((c) => c.published);
  },

  listAllCourses() {
    return state.courses;
  },

  getCourse(idOrSlug: string) {
    return state.courses.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null;
  },

  listInstructorCourses(instructorId: string) {
    return state.courses.filter((c) => c.instructorId === instructorId);
  },

  upsertCourse(course: Course) {
    const idx = state.courses.findIndex((c) => c.id === course.id);
    if (idx === -1) state.courses.push(course);
    else state.courses[idx] = course;
    emit();
  },

  togglePublished(courseId: string) {
    state.courses = state.courses.map((c) =>
      c.id === courseId ? { ...c, published: !c.published } : c,
    );
    emit();
  },

  // Progress + enrollment
  getProgress(userId: string, courseId: string): Progress | null {
    return state.progress.find((p) => p.userId === userId && p.courseId === courseId) ?? null;
  },

  listProgressForUser(userId: string) {
    return state.progress.filter((p) => p.userId === userId);
  },

  listProgressForCourse(courseId: string) {
    return state.progress.filter((p) => p.courseId === courseId);
  },

  enroll(userId: string, courseId: string) {
    if (!state.enrollments.some((e) => e.userId === userId && e.courseId === courseId)) {
      state.enrollments.push({ userId, courseId, enrolledAt: Date.now() });
    }
    if (!state.progress.some((p) => p.userId === userId && p.courseId === courseId)) {
      state.progress.push({
        userId,
        courseId,
        completedLessonIds: [],
        percentComplete: 0,
        startedAt: Date.now(),
        lastViewedAt: Date.now(),
        videoPositions: {},
      });
    }
    emit();
  },

  setLastLesson(userId: string, courseId: string, lessonId: string) {
    state.progress = state.progress.map((p) =>
      p.userId === userId && p.courseId === courseId
        ? { ...p, lastLessonId: lessonId, lastViewedAt: Date.now() }
        : p,
    );
    emit();
  },

  markLessonComplete(userId: string, courseId: string, lessonId: string) {
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return;
    state.progress = state.progress.map((p) => {
      if (p.userId !== userId || p.courseId !== courseId) return p;
      const completed = p.completedLessonIds.includes(lessonId)
        ? p.completedLessonIds
        : [...p.completedLessonIds, lessonId];
      const percentComplete = completed.length / course.totalLessons;
      const completedAt = percentComplete >= 1 ? Date.now() : p.completedAt;
      return {
        ...p,
        completedLessonIds: completed,
        percentComplete,
        completedAt,
        lastViewedAt: Date.now(),
      };
    });
    emit();
  },

  setVideoPosition(userId: string, courseId: string, lessonId: string, seconds: number) {
    state.progress = state.progress.map((p) => {
      if (p.userId !== userId || p.courseId !== courseId) return p;
      return {
        ...p,
        videoPositions: { ...p.videoPositions, [lessonId]: seconds },
        lastViewedAt: Date.now(),
      };
    });
    emit();
  },

  // Notes
  listNotes(userId: string, lessonId?: string) {
    return state.notes.filter(
      (n) => n.userId === userId && (lessonId ? n.lessonId === lessonId : true),
    );
  },

  saveNote(note: Omit<LessonNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    if (note.id) {
      state.notes = state.notes.map((n) =>
        n.id === note.id ? { ...n, body: note.body, updatedAt: Date.now() } : n,
      );
    } else {
      state.notes.push({
        id: `n_${Math.random().toString(36).slice(2, 10)}`,
        userId: note.userId,
        lessonId: note.lessonId,
        body: note.body,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    emit();
  },

  deleteNote(noteId: string) {
    state.notes = state.notes.filter((n) => n.id !== noteId);
    emit();
  },

  // Admin views
  listAllUsers() {
    return state.users;
  },
  listAllEnrollments() {
    return state.enrollments;
  },
  listAllProgress() {
    return state.progress;
  },
};
