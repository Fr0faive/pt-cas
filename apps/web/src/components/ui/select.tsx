import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-12 w-full appearance-none rounded-xl border border-[#85c3db] bg-[#f0f8fc] px-4 py-2 pr-10 text-base text-[#1e293b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] focus-visible:border-[#236f86] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#236f86] opacity-70" />
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
