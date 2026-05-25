import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-headline font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-ink text-paper hover:bg-ink-soft active:bg-ink-soft/95',
        terra: 'bg-terra text-paper hover:bg-terra-deep active:bg-terra-deep',
        outline: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
        ghost: 'bg-transparent text-ink hover:bg-paper-deep',
        link: 'text-ink underline-offset-4 hover:underline decoration-terra decoration-2',
        destructive: 'bg-danger text-paper hover:opacity-90',
        soft: 'bg-paper-deep text-ink hover:bg-rule-soft',
      },
      size: {
        sm: 'h-9 px-3 text-footnote',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-headline',
        xl: 'h-14 px-8 text-title3',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
