import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: boolean | string;
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options = [],
      placeholder,
      error,
      fullWidth = true,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    const baseClasses =
      'appearance-none w-full bg-slate-950/70 border rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-100 ' +
      'transition-colors duration-150 cursor-pointer ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900';

    const borderClasses = hasError
      ? 'border-rose-500/80 focus-visible:ring-rose-500'
      : 'border-slate-800 hover:border-slate-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500';

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`relative ${widthClass}`}>
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          className={`${baseClasses} ${borderClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-slate-900 text-slate-100 py-1"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
