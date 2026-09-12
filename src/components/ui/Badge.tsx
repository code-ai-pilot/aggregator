import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'category';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
  title?: string;
  key?: React.Key;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'sm',
  icon,
  dot,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-md tracking-normal select-none whitespace-nowrap';

  const sizeClasses: Record<BadgeSize, string> = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700',
    neutral: 'bg-slate-800/60 text-slate-300 border border-slate-700/60',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
    purple: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
    category: 'bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono text-[11px]',
  };

  const dotClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
    purple: 'bg-violet-400',
    category: 'bg-teal-400',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
