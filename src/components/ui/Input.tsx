import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const baseClasses =
      'w-full bg-slate-950/70 border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 ' +
      'transition-colors duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900';

    const borderClasses = hasError
      ? 'border-rose-500/80 focus-visible:ring-rose-500 focus-visible:border-rose-500'
      : 'border-slate-800 hover:border-slate-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500';

    const paddingClasses = `${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`;
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`relative ${widthClass}`}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          className={`${baseClasses} ${borderClasses} ${paddingClasses} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  value?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', value, onChange, onClear, placeholder = 'Search roles, skills, platforms...', ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4" aria-hidden="true" />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
