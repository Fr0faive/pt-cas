import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236f86] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#236f86] text-white hover:bg-[#1c5b6e] active:bg-[#174a5a] shadow-xs',
        outline: 'border border-[#85c3db] bg-white text-[#236f86] hover:bg-[#f0f8fc] active:bg-[#e0f2f9]',
        secondary: 'bg-[#f0f8fc] text-[#236f86] hover:bg-[#e1f3fa] active:bg-[#d0ebf6]',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        link: 'text-[#236f86] underline-offset-4 hover:underline p-0 h-auto',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-7 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
