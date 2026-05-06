import type { PricingTier } from '@/types';

export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Reader',
    priceMonthly: 0,
    description: 'Browse the entire catalog and read one free preview lesson per course. Forever.',
    features: [
      'Full catalog browsing',
      '1 free preview lesson per course',
      'Course outlines & instructor bios',
      'Newsletter: The Quarterly editor\'s note',
    ],
  },
  {
    id: 'pro',
    name: 'Member',
    priceMonthly: 29,
    description: 'Every course in the Member library. New courses every quarter, included.',
    highlight: true,
    features: [
      'Everything in Reader',
      'Unlimited access to Member courses',
      'AI study buddy on every lesson',
      'Saved notes, progress, certificates',
      'Cancel any time, no clawbacks',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 79,
    description: 'For 3–5 people learning together. Adds the Team-tier deep-dives and group dashboards.',
    features: [
      'Everything in Member',
      'Team-tier deep-dive courses',
      'Up to 5 seats',
      'Cohort dashboard for managers',
      'Priority email from the editors',
    ],
  },
];

export const TIER_RANK: Record<string, number> = { free: 1, pro: 2, team: 3 };
