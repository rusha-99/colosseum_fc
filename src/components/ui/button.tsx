import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-colosseum-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#c5a059] text-[#0a0a0a] shadow-gold-sm hover:brightness-110 border border-[#f3cf55]/40',
        outline:
          'border border-colosseum-gold/40 bg-[#171717] text-colosseum-gold hover:bg-colosseum-gold/15 hover:border-colosseum-gold',
        secondary:
          'bg-[#1f1f1f] text-[#f5f5f5] border border-[#2e2614] hover:border-colosseum-gold/50 hover:text-colosseum-gold',
        destructive:
          'bg-red-950/80 text-red-300 border border-red-700/50 hover:bg-red-900/80',
        ghost:
          'text-neutral-400 hover:text-colosseum-gold hover:bg-colosseum-gold/10'
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
