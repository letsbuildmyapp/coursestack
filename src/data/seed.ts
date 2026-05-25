import type { AppUser, Course, Lesson, Module, Progress, Enrollment, LessonNote } from '@/types';

const now = Date.now();
const day = 86400000;

const COVER = {
  business: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&q=80&auto=format&fit=crop',
  coding: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop',
  marketing: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&q=80&auto=format&fit=crop',
  photo: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=1200&q=80&auto=format&fit=crop',
  productivity: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80&auto=format&fit=crop',
};

const PORTRAITS = {
  ada: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop&fm=jpg&sat=-100',
  marco: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop&fm=jpg&sat=-100',
  remy: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80&auto=format&fit=crop&fm=jpg&sat=-100',
  isla: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop&fm=jpg&sat=-100',
  felix: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80&auto=format&fit=crop&fm=jpg&sat=-100',
};

const SAMPLE_VIDEOS = [
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
];

export const seedUsers: AppUser[] = [
  {
    id: 'u_admin',
    email: 'admin@coursestack.demo',
    displayName: 'Alex Rivera',
    avatarUrl: PORTRAITS.felix,
    bio: 'Platform operator. Ex-product at three EdTech startups.',
    roles: ['admin', 'instructor'],
    tier: 'team',
    subscriptionStatus: 'active',
    createdAt: now - 365 * day,
  },
  {
    id: 'u_inst_ada',
    email: 'ada@coursestack.demo',
    displayName: 'Ada Okafor',
    avatarUrl: PORTRAITS.ada,
    bio: 'Brand strategist. Built two D2C brands from scratch. Teaches what actually moves revenue, not what looks good in a deck.',
    roles: ['instructor'],
    tier: 'team',
    subscriptionStatus: 'active',
    createdAt: now - 280 * day,
  },
  {
    id: 'u_inst_marco',
    email: 'marco@coursestack.demo',
    displayName: 'Marco Lindqvist',
    avatarUrl: PORTRAITS.marco,
    bio: 'Senior engineer turned teacher. Twelve years across fintech and infra. Believes the only way to learn to code is to ship.',
    roles: ['instructor'],
    tier: 'team',
    subscriptionStatus: 'active',
    createdAt: now - 250 * day,
  },
  {
    id: 'u_inst_remy',
    email: 'remy@coursestack.demo',
    displayName: 'Remy Sato',
    avatarUrl: PORTRAITS.remy,
    bio: 'Product designer. Previously at a Series-B health platform. Obsessed with the moment a UI starts feeling like a tool, not a screen.',
    roles: ['instructor'],
    tier: 'team',
    subscriptionStatus: 'active',
    createdAt: now - 200 * day,
  },
  {
    id: 'u_member_free',
    email: 'free@coursestack.demo',
    displayName: 'Jules Hartwell',
    avatarUrl: PORTRAITS.isla,
    bio: 'Curious learner. Browsing.',
    roles: ['member'],
    tier: 'free',
    subscriptionStatus: 'none',
    createdAt: now - 14 * day,
  },
  {
    id: 'u_member_pro',
    email: 'pro@coursestack.demo',
    displayName: 'Sasha Lin',
    avatarUrl: PORTRAITS.isla,
    bio: 'Designer at a small studio. Two courses deep into the catalog.',
    roles: ['member'],
    tier: 'pro',
    subscriptionStatus: 'active',
    stripeCustomerId: 'cus_demo_pro',
    currentPeriodEnd: now + 14 * day,
    createdAt: now - 90 * day,
  },
  {
    id: 'u_member_team',
    email: 'team@coursestack.demo',
    displayName: 'Priya Bhatt',
    avatarUrl: PORTRAITS.ada,
    bio: 'Engineering manager. Runs a 4-person team learning together.',
    roles: ['member'],
    tier: 'team',
    subscriptionStatus: 'active',
    stripeCustomerId: 'cus_demo_team',
    currentPeriodEnd: now + 21 * day,
    createdAt: now - 120 * day,
  },
];

const TEXT_LESSON_BODY_BUSINESS = `The brand is not the logo. The logo is one of the cheapest, easiest things to change about your business — and one of the least important. The brand is the **story your customer tells themselves about why they bought from you.** Everything you do, every email, every receipt, every shipping box, is either reinforcing that story or eroding it.

## Three things that build the story faster than a logo

1. **Naming.** A name that says what you do is forgettable. A name that says how you feel is not. "Patagonia" doesn't tell you it sells jackets. It tells you what kind of person buys jackets there.
2. **Voice.** Read your last five customer emails out loud. Do they sound like a person, or like a brand pretending to be a person? Customers can tell instantly. Speak like a human who happens to work there.
3. **Receipts.** The literal receipt. The shipping confirmation. The "your order is on the way" email. These are read more carefully than your homepage. Most companies waste them.

> The brand is what people say about you when you're not in the room. — Bezos

## What to do this week

Open your last 100 customer emails. Group them by theme. The most common complaint is your real positioning problem. The most common compliment is your real value prop. Most founders are running a brand exercise that has nothing to do with what their actual customers feel.

That gap — between the brand you describe in your investor deck and the brand your customer experiences in their inbox — is the only brand audit that matters. Close it before you spend a dollar on a rebrand.`;

const TEXT_LESSON_BODY_DESIGN = `Composition is the difference between a layout that feels designed and one that feels arranged. Most beginning designers get the elements right and the relationships between them wrong. The fix is to stop thinking about objects and start thinking about **the negative space between them.**

## The grid is a tool, not a religion

A 12-column grid is great until it isn't. The fastest way to make a layout feel premium is to break the grid in exactly one place — let one element bleed past it, sit half a column off, or punch through the gutter. The rest of the page reads as orderly *because* of the break, not despite it.

This is also why pure-grid layouts often feel cheap: there's no tension. Every element is in its assigned seat. The eye has nothing to land on.

## Type sets the tempo

If you change one thing on your page today, change the line-height. Body text at 1.4 reads as efficient. The same text at 1.7 reads as considered. The same text at 2.0 reads as luxurious. None of them are wrong; you're picking what the page should *feel* like before you pick what it should *say*.

Type size hierarchy follows a similar logic. The default is to make headings big and body small. The result is screens that look like every other screen. Try the inverse: small, all-caps eyebrows above large, restrained body text. The page slows down. Readers stay longer. They believe what's on it more.`;

const TEXT_LESSON_BODY_CODE = `Most bugs are not bugs in the code you wrote. They're bugs in the **mental model you had when you wrote it.** When you fix a bug by patching a symptom, the model is still wrong, and the next bug is already in the codebase — you just haven't found it yet.

## A debugging method that actually works

1. **Predict.** Before you run anything, write down what you expect to happen. If you can't, you don't understand the code well enough to fix it yet.
2. **Run.** Reproduce the failure with the smallest possible input.
3. **Diff.** Compare your prediction to what actually happened. The diff is the bug — not in the code, but in your model.
4. **Fix the model first.** Then change the code to match the corrected model.

This sounds slower. It is, the first time. After that, you stop introducing entire classes of bugs because you stopped writing code from a wrong model.

## What to actually print

\`console.log\` everywhere is a sign you don't trust your model. The fix is not less logging — it's printing the *one* value that disambiguates between your prediction and reality. If you can't pick that one value, your prediction wasn't specific enough.

> "I will not write more than three lines without testing them." Hold yourself to that for one week. Your bug count goes to zero.`;

function quizQuestions(topic: string) {
  if (topic === 'business') {
    return [
      {
        id: 'q1',
        prompt: 'Which of the following most reliably builds brand?',
        options: ['A new logo', 'Consistent customer voice across receipts and emails', 'A celebrity endorsement', 'A larger ad budget'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        prompt: 'A name that "says how you feel" is preferred to one that "says what you do" because:',
        options: ['It is shorter', 'It is more memorable and emotional', 'It is easier to trademark', 'It performs better in SEO'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        prompt: 'The most useful brand audit is:',
        options: ['Comparing your logo to competitors', 'Reading your investor deck', 'Reading your last 100 customer emails', 'Hiring an agency'],
        correctIndex: 2,
      },
    ];
  }
  if (topic === 'design') {
    return [
      {
        id: 'q1',
        prompt: 'A premium-feeling layout often:',
        options: ['Strictly follows the grid', 'Breaks the grid in exactly one place', 'Uses no grid at all', 'Uses a 16-column grid'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        prompt: 'Increasing body line-height from 1.4 to 1.7 makes the page feel:',
        options: ['More efficient', 'Less premium', 'More considered', 'Less readable'],
        correctIndex: 2,
      },
      {
        id: 'q3',
        prompt: 'Hierarchy is best built using:',
        options: ['Color alone', 'Opacity alone', 'Size and weight together', 'Animation'],
        correctIndex: 2,
      },
    ];
  }
  return [
    {
      id: 'q1',
      prompt: 'Most bugs are bugs in:',
      options: ['The framework', 'The code you wrote', 'The mental model you had', 'The compiler'],
      correctIndex: 2,
    },
    {
      id: 'q2',
      prompt: 'The first step in the debugging method is:',
      options: ['Run the code', 'Predict what you expect', 'Add logging', 'Ask an LLM'],
      correctIndex: 1,
    },
    {
      id: 'q3',
      prompt: 'Logging is most useful when it:',
      options: ['Is everywhere', 'Disambiguates prediction from reality', 'Is hidden behind a feature flag', 'Is removed before commit'],
      correctIndex: 1,
    },
  ];
}

interface CourseSeed {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  instructorId: string;
  instructorName: string;
  tier: 'free' | 'pro' | 'team';
  tags: string[];
  topic: 'business' | 'design' | 'coding' | 'marketing' | 'photo' | 'productivity';
  rating: number;
  enrollmentCount: number;
  modules: { title: string; lessons: { title: string; type: 'video' | 'text' | 'quiz'; duration: number }[] }[];
}

const courseSeeds: CourseSeed[] = [
  {
    slug: 'brand-as-system',
    title: 'The Brand as a System',
    subtitle: 'Stop chasing logos. Start engineering the story.',
    description: 'A working strategist\'s playbook for building a brand that compounds. Six modules covering positioning, voice, naming, and the operational hooks that make a brand actually feel like a brand to a customer.',
    cover: COVER.business,
    instructorId: 'u_inst_ada',
    instructorName: 'Ada Okafor',
    tier: 'pro',
    tags: ['brand', 'strategy', 'positioning'],
    topic: 'business',
    rating: 4.8,
    enrollmentCount: 1342,
    modules: [
      {
        title: 'Positioning before pixels',
        lessons: [
          { title: 'Why the logo is the cheapest part', type: 'video', duration: 8 },
          { title: 'Reading your customer\'s actual story', type: 'text', duration: 12 },
          { title: 'A 30-minute positioning audit', type: 'video', duration: 14 },
          { title: 'Module check', type: 'quiz', duration: 5 },
        ],
      },
      {
        title: 'Voice and naming',
        lessons: [
          { title: 'How a name carries weight', type: 'video', duration: 11 },
          { title: 'The voice exercise that finds your tone', type: 'text', duration: 9 },
          { title: 'Naming workshop walkthrough', type: 'video', duration: 18 },
        ],
      },
      {
        title: 'Operational brand',
        lessons: [
          { title: 'The receipt as a brand surface', type: 'text', duration: 7 },
          { title: 'Your top 5 customer touchpoints', type: 'video', duration: 13 },
          { title: 'Putting it together: a brand book that holds', type: 'video', duration: 21 },
          { title: 'Final exam', type: 'quiz', duration: 8 },
        ],
      },
    ],
  },
  {
    slug: 'composition-for-product-designers',
    title: 'Composition for Product Designers',
    subtitle: 'Layouts that feel designed, not arranged.',
    description: 'Practical composition for product UI. Grids, hierarchy, type, negative space — and the small craft moves that separate good designers from great ones.',
    cover: COVER.design,
    instructorId: 'u_inst_remy',
    instructorName: 'Remy Sato',
    tier: 'pro',
    tags: ['design', 'ui', 'composition'],
    topic: 'design',
    rating: 4.9,
    enrollmentCount: 2104,
    modules: [
      {
        title: 'Grid as a contract',
        lessons: [
          { title: 'Why grids exist', type: 'video', duration: 9 },
          { title: 'Breaking the grid intentionally', type: 'text', duration: 10 },
          { title: 'Live redesign: a SaaS dashboard', type: 'video', duration: 22 },
        ],
      },
      {
        title: 'Type as tempo',
        lessons: [
          { title: 'Line-height changes everything', type: 'video', duration: 8 },
          { title: 'Hierarchy without color', type: 'text', duration: 11 },
          { title: 'Type pairing without picking favorites', type: 'video', duration: 14 },
          { title: 'Module check', type: 'quiz', duration: 6 },
        ],
      },
      {
        title: 'Density and craft',
        lessons: [
          { title: 'When density is the feature', type: 'video', duration: 12 },
          { title: 'The four spacing decisions on every screen', type: 'text', duration: 13 },
          { title: 'Polish pass: how pros finish a screen', type: 'video', duration: 19 },
        ],
      },
      {
        title: 'Course wrap',
        lessons: [
          { title: 'A composition rubric you can use', type: 'video', duration: 10 },
          { title: 'Final exam', type: 'quiz', duration: 8 },
        ],
      },
    ],
  },
  {
    slug: 'shipping-typescript-in-anger',
    title: 'Shipping TypeScript in Anger',
    subtitle: 'For engineers who want to be trusted with production.',
    description: 'TypeScript at the level a senior engineer actually writes it. Generics, type-driven design, narrowing, and the patterns you only learn after burning yourself in production once or twice.',
    cover: COVER.coding,
    instructorId: 'u_inst_marco',
    instructorName: 'Marco Lindqvist',
    tier: 'pro',
    tags: ['typescript', 'engineering', 'production'],
    topic: 'coding',
    rating: 4.7,
    enrollmentCount: 3198,
    modules: [
      {
        title: 'Mental model first',
        lessons: [
          { title: 'TypeScript is not a linter', type: 'video', duration: 10 },
          { title: 'The model behind the model', type: 'text', duration: 14 },
          { title: 'A debugging method that scales', type: 'video', duration: 17 },
        ],
      },
      {
        title: 'Type-driven design',
        lessons: [
          { title: 'Designing the types first', type: 'video', duration: 13 },
          { title: 'Narrowing without nesting', type: 'text', duration: 9 },
          { title: 'Generics by example', type: 'video', duration: 22 },
          { title: 'Module check', type: 'quiz', duration: 7 },
        ],
      },
      {
        title: 'Production patterns',
        lessons: [
          { title: 'Result types over thrown errors', type: 'video', duration: 16 },
          { title: 'Branded types for IDs', type: 'text', duration: 8 },
          { title: 'When to use any (yes, sometimes)', type: 'video', duration: 11 },
          { title: 'Final exam', type: 'quiz', duration: 9 },
        ],
      },
    ],
  },
  {
    slug: 'cold-outbound-that-converts',
    title: 'Cold Outbound That Converts',
    subtitle: 'Get on the calendar of people who don\'t know you exist.',
    description: 'A field-tested system for booking meetings with the people who can buy from you. Targeting, sequencing, message craft, and the actual templates that worked.',
    cover: COVER.marketing,
    instructorId: 'u_inst_ada',
    instructorName: 'Ada Okafor',
    tier: 'team',
    tags: ['sales', 'outbound', 'B2B'],
    topic: 'marketing',
    rating: 4.6,
    enrollmentCount: 873,
    modules: [
      {
        title: 'Who, before what',
        lessons: [
          { title: 'Targeting beats messaging', type: 'video', duration: 9 },
          { title: 'Building a 200-person ICP list', type: 'text', duration: 12 },
          { title: 'Walkthrough: a real list', type: 'video', duration: 16 },
        ],
      },
      {
        title: 'Sequence design',
        lessons: [
          { title: 'The four-touch baseline', type: 'video', duration: 11 },
          { title: 'When to break sequence', type: 'text', duration: 7 },
          { title: 'Module check', type: 'quiz', duration: 6 },
        ],
      },
      {
        title: 'Message craft',
        lessons: [
          { title: 'Subject lines that don\'t lie', type: 'video', duration: 8 },
          { title: 'The 90-word email', type: 'text', duration: 10 },
          { title: 'Template review (real ones)', type: 'video', duration: 18 },
        ],
      },
    ],
  },
  {
    slug: 'available-light',
    title: 'Available Light',
    subtitle: 'Photography for the camera you already have.',
    description: 'A working photographer\'s guide to making strong images without studio gear. Composition, exposure, color, and the editing pass that turns a snapshot into a photograph.',
    cover: COVER.photo,
    instructorId: 'u_inst_remy',
    instructorName: 'Remy Sato',
    tier: 'free',
    tags: ['photography', 'craft', 'beginner'],
    topic: 'photo',
    rating: 4.5,
    enrollmentCount: 4521,
    modules: [
      {
        title: 'Seeing first',
        lessons: [
          { title: 'How photographers actually look', type: 'video', duration: 10 },
          { title: 'The walking exercise', type: 'text', duration: 7 },
          { title: 'A free preview lesson on composition', type: 'video', duration: 12 },
        ],
      },
      {
        title: 'Exposure',
        lessons: [
          { title: 'Light as the only subject', type: 'video', duration: 11 },
          { title: 'Reading the histogram fast', type: 'text', duration: 9 },
          { title: 'Module check', type: 'quiz', duration: 5 },
        ],
      },
      {
        title: 'Edit',
        lessons: [
          { title: 'A 90-second edit walkthrough', type: 'video', duration: 14 },
          { title: 'Color grades that don\'t age', type: 'video', duration: 16 },
        ],
      },
    ],
  },
  {
    slug: 'systems-not-streaks',
    title: 'Systems, Not Streaks',
    subtitle: 'Productivity for people who already tried productivity.',
    description: 'A grown-up system for getting things done that survives a bad week. No streaks, no shame, no morning routine evangelism — just calendars, queues, and a once-a-week review.',
    cover: COVER.productivity,
    instructorId: 'u_inst_marco',
    instructorName: 'Marco Lindqvist',
    tier: 'free',
    tags: ['productivity', 'habits', 'systems'],
    topic: 'productivity',
    rating: 4.7,
    enrollmentCount: 2987,
    modules: [
      {
        title: 'Why most systems fail',
        lessons: [
          { title: 'The streak trap', type: 'video', duration: 8 },
          { title: 'Calendar over to-do list', type: 'text', duration: 10 },
        ],
      },
      {
        title: 'The weekly review',
        lessons: [
          { title: 'A 25-minute review you\'ll actually do', type: 'video', duration: 14 },
          { title: 'Templates and prompts', type: 'text', duration: 8 },
          { title: 'Module check', type: 'quiz', duration: 6 },
        ],
      },
      {
        title: 'Recovery weeks',
        lessons: [
          { title: 'Designing for the bad week', type: 'video', duration: 11 },
          { title: 'The two-line journal', type: 'text', duration: 6 },
        ],
      },
    ],
  },
];

function bodyForTopic(topic: string) {
  if (topic === 'business' || topic === 'marketing') return TEXT_LESSON_BODY_BUSINESS;
  if (topic === 'design' || topic === 'photo') return TEXT_LESSON_BODY_DESIGN;
  if (topic === 'coding' || topic === 'productivity') return TEXT_LESSON_BODY_CODE;
  return TEXT_LESSON_BODY_BUSINESS;
}

function buildCourse(seed: CourseSeed, idx: number): Course {
  const courseId = `c_${seed.slug}`;
  const modules: Module[] = seed.modules.map((m, mi) => {
    const moduleId = `${courseId}_m${mi}`;
    const lessons: Lesson[] = m.lessons.map((l, li) => {
      const lessonId = `${moduleId}_l${li}`;
      const isFreePreview = mi === 0 && li === 0;
      const base: Lesson = {
        id: lessonId,
        courseId,
        moduleId,
        title: l.title,
        order: li,
        type: l.type,
        content: l.type === 'text' ? bodyForTopic(seed.topic) : '',
        durationMinutes: l.duration,
        isFreePreview,
      };
      if (l.type === 'video') {
        base.videoUrl = SAMPLE_VIDEOS[(idx + mi + li) % SAMPLE_VIDEOS.length];
      }
      if (l.type === 'quiz') {
        base.questions = quizQuestions(seed.topic);
      }
      return base;
    });
    return { id: moduleId, courseId, title: m.title, order: mi, lessons };
  });

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const estimatedMinutes = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + l.durationMinutes, 0),
    0,
  );

  return {
    id: courseId,
    slug: seed.slug,
    title: seed.title,
    subtitle: seed.subtitle,
    description: seed.description,
    coverImage: seed.cover,
    instructorId: seed.instructorId,
    instructorName: seed.instructorName,
    tier: seed.tier,
    tags: seed.tags,
    topic: seed.topic,
    published: true,
    rating: seed.rating,
    enrollmentCount: seed.enrollmentCount,
    totalLessons,
    estimatedMinutes,
    createdAt: now - (180 - idx * 10) * day,
    modules,
  };
}

export const seedCourses: Course[] = courseSeeds.map((s, i) => buildCourse(s, i));

export const seedProgress: Progress[] = (() => {
  const proCourse = seedCourses[1]!; // composition
  const proCourse2 = seedCourses[2]!; // typescript
  const teamCourse = seedCourses[0]!; // brand
  const result: Progress[] = [];

  // Pro user: in-progress on composition, finished a course
  result.push({
    userId: 'u_member_pro',
    courseId: proCourse.id,
    completedLessonIds: [
      proCourse.modules[0]!.lessons[0]!.id,
      proCourse.modules[0]!.lessons[1]!.id,
      proCourse.modules[0]!.lessons[2]!.id,
      proCourse.modules[1]!.lessons[0]!.id,
    ],
    lastLessonId: proCourse.modules[1]!.lessons[1]!.id,
    percentComplete: 4 / proCourse.totalLessons,
    startedAt: now - 21 * day,
    lastViewedAt: now - 1 * day,
    videoPositions: {},
  });

  result.push({
    userId: 'u_member_pro',
    courseId: seedCourses[5]!.id, // systems
    completedLessonIds: seedCourses[5]!.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    lastLessonId: seedCourses[5]!.modules.at(-1)!.lessons.at(-1)!.id,
    percentComplete: 1,
    startedAt: now - 60 * day,
    completedAt: now - 30 * day,
    lastViewedAt: now - 30 * day,
    videoPositions: {},
  });

  // Team user
  result.push({
    userId: 'u_member_team',
    courseId: teamCourse.id,
    completedLessonIds: [teamCourse.modules[0]!.lessons[0]!.id, teamCourse.modules[0]!.lessons[1]!.id],
    lastLessonId: teamCourse.modules[0]!.lessons[2]!.id,
    percentComplete: 2 / teamCourse.totalLessons,
    startedAt: now - 5 * day,
    lastViewedAt: now - 2 * 3600_000,
    videoPositions: {},
  });

  result.push({
    userId: 'u_member_team',
    courseId: proCourse2.id,
    completedLessonIds: [proCourse2.modules[0]!.lessons[0]!.id],
    lastLessonId: proCourse2.modules[0]!.lessons[0]!.id,
    percentComplete: 1 / proCourse2.totalLessons,
    startedAt: now - 8 * day,
    lastViewedAt: now - 8 * day,
    videoPositions: {},
  });

  return result;
})();

export const seedEnrollments: Enrollment[] = seedProgress.map((p) => ({
  userId: p.userId,
  courseId: p.courseId,
  enrolledAt: p.startedAt,
}));

export const seedNotes: LessonNote[] = [
  {
    id: 'n_1',
    userId: 'u_member_pro',
    lessonId: seedCourses[1]!.modules[0]!.lessons[0]!.id,
    body: 'The "grid is a tool, not a religion" line — bring this to next design crit.',
    createdAt: now - 7 * day,
    updatedAt: now - 7 * day,
  },
];

// Demo password — same for every seeded user
export const SEED_PASSWORD = 'coursestack';
