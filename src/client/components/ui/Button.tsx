import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm': variant === 'primary',
            'bg-zinc-100 text-zinc-900 hover:bg-zinc-200': variant === 'secondary',
            'border border-zinc-200 hover:bg-zinc-100 text-zinc-900': variant === 'outline',
            'hover:bg-zinc-100 text-zinc-700': variant === 'ghost',
            'h-8 px-3 text-sm rounded-md': size === 'sm',
            'h-10 px-4 py-2 rounded-md': size === 'md',
            'h-12 px-8 text-lg rounded-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
