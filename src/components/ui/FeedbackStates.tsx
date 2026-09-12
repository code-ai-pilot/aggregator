import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return <Loader2 className={`animate-spin text-emerald-400 ${sizeClasses} ${className}`} aria-hidden="true" />;
}

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-xs text-slate-400 font-medium">{message}</p>
    </div>
  );
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-rose-200">{title}</h4>
          <p className="text-xs text-rose-300/90 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button size="xs" variant="danger" onClick={onRetry} className="shrink-0 self-start sm:self-center">
          Try Again
        </Button>
      )}
    </div>
  );
}

export interface SuccessBannerProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessBanner({
  title,
  message,
  onDismiss,
  className = '',
}: SuccessBannerProps) {
  return (
    <div
      className={`p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-200 flex items-start justify-between gap-3 ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          {title && <h4 className="text-xs font-semibold text-emerald-200">{title}</h4>}
          <p className="text-xs text-emerald-300/90 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-emerald-400 hover:text-emerald-200 text-xs p-1"
        >
          &times;
        </button>
      )}
    </div>
  );
}
