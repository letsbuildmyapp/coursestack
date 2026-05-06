export type Role = 'admin' | 'instructor' | 'member';
export type Tier = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'none';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  roles: Role[];
  tier: Tier;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  currentPeriodEnd?: number;
  createdAt: number;
}

export type LessonType = 'video' | 'text' | 'quiz';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  order: number;
  type: LessonType;
  content: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  durationMinutes: number;
  isFreePreview: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage: string;
  instructorId: string;
  instructorName: string;
  tier: Tier;
  tags: string[];
  topic: string;
  published: boolean;
  rating: number;
  enrollmentCount: number;
  totalLessons: number;
  estimatedMinutes: number;
  createdAt: number;
  modules: Module[];
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  percentComplete: number;
  startedAt: number;
  completedAt?: number;
  lastViewedAt: number;
  videoPositions: Record<string, number>;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: number;
}

export interface LessonNote {
  id: string;
  userId: string;
  lessonId: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface PricingTier {
  id: Tier;
  name: string;
  priceMonthly: number;
  features: string[];
  highlight?: boolean;
  description: string;
}
