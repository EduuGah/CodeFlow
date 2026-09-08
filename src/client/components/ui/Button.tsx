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
          "inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-ink text-white hover:bg-brand-900': variant === 'primary',
            'bg-sunken text-ink hover:bg-line': variant === 'secondary',
            'border border-line hover:bg-sunken text-ink': variant === 'outline',
            'hover:bg-sunken text-ink-soft': variant === 'ghost',
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
