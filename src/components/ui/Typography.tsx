import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export function Heading({ level = 1, className = '', children, ...props }: HeadingProps) {
  const baseClasses = 'font-semibold tracking-tight text-slate-100';
  
  const sizeClasses = {
    1: 'text-2xl sm:text-3xl font-bold',
    2: 'text-xl sm:text-2xl font-semibold',
    3: 'text-lg sm:text-xl font-semibold',
    4: 'text-base sm:text-lg font-medium',
    5: 'text-sm sm:text-base font-medium',
    6: 'text-xs sm:text-sm font-medium uppercase tracking-wider text-slate-400',
  }[level];

  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={`${baseClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'lead' | 'muted' | 'subtext' | 'caption' | 'code';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'normal',
  className = '',
  children,
  ...props
}: TextProps) {
  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight];

  const variantClass = {
    lead: 'text-base sm:text-lg text-slate-300 leading-relaxed',
    body: 'text-sm sm:text-base text-slate-200 leading-relaxed',
    muted: 'text-sm text-slate-400 leading-normal',
    subtext: 'text-xs text-slate-400 leading-relaxed',
    caption: 'text-[11px] text-slate-500 uppercase tracking-wider',
    code: 'font-mono text-xs text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60',
  }[variant];

  return (
    <p className={`${variantClass} ${weightClass} ${className}`} {...props}>
      {children}
    </p>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800 ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Heading level={1} className="text-xl sm:text-2xl">
            {title}
          </Heading>
          {badge}
        </div>
        {description && (
          <Text variant="muted" className="text-sm">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
