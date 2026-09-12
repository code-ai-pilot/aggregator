import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children: React.ReactNode;
}

export function Container({ size = 'lg', className = '', children, ...props }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
}

export function Section({ className = '', children, ...props }: SectionProps) {
  return (
    <section className={`py-6 sm:py-8 ${className}`} {...props}>
      {children}
    </section>
  );
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Grid({ cols = 3, gap = 'md', className = '', children, ...props }: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols];

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  }[gap];

  return (
    <div className={`grid ${colsClasses} ${gapClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

export function Stack({
  direction = 'col',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
  children,
  ...props
}: StackProps) {
  const dirClass = direction === 'row' ? 'flex flex-row' : 'flex flex-col';

  const gapClasses = {
    xs: 'gap-1.5',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[justify];

  return (
    <div
      className={`${dirClass} ${gapClasses} ${alignClasses} ${justifyClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  vertical?: boolean;
  className?: string;
}

export function Divider({ vertical = false, className = '', ...props }: DividerProps) {
  if (vertical) {
    return (
      <div
        className={`inline-block w-px self-stretch bg-slate-800 my-1 ${className}`}
        aria-hidden="true"
        role="separator"
      />
    );
  }

  return (
    <hr
      className={`border-0 border-t border-slate-800 my-4 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
