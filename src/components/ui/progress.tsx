import * as RadixProgress from '@radix-ui/react-progress';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Progress = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixProgress.Root>
>(({ className, value = 0, ...props }, ref) => (
  <RadixProgress.Root
    ref={ref}
    className={cn('relative h-1 w-full overflow-hidden rounded-full bg-paper-deep', className)}
    {...props}
  >
    <RadixProgress.Indicator
      className="h-full bg-terra transition-transform duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </RadixProgress.Root>
));
Progress.displayName = 'Progress';
