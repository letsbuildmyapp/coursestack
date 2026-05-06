import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-caption font-medium tracking-[0.05em] uppercase whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-ink text-paper',
        outline: 'border border-rule text-ink-soft bg-transparent',
        terra: 'bg-terra text-paper',
        soft: 'bg-paper-deep text-ink-soft',
        sage: 'bg-sage/30 text-ink',
        success: 'bg-success/15 text-success',
        danger: 'bg-danger/15 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
