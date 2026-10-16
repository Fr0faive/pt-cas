import * as React from 'react';
import { cn } from '@/lib/utils.js';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border border-[#85c3db] bg-[#f0f8fc] px-4 py-2 text-base text-[#1e293b] placeholder:text-[#94a3b8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] focus-visible:border-[#236f86] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
