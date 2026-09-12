import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
  className?: string;
  key?: React.Key;
  children: React.ReactNode;
}

export function Card({
  interactive = false,
  padded = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseClasses = 'bg-slate-950/60 border border-slate-800/80 rounded-xl transition-colors';
  const interactiveClasses = interactive
    ? 'hover:border-slate-700 hover:bg-slate-900/40 cursor-pointer'
    : '';
  const paddingClass = padded ? 'p-5 sm:p-6' : '';

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div className={`p-5 sm:p-6 pb-3 border-b border-slate-800/60 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3 className={`text-base font-semibold text-slate-100 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p className={`text-xs text-slate-400 leading-normal ${className}`} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={`p-4 sm:p-6 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
