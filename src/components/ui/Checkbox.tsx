import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean | string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, disabled, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <label
        htmlFor={inputId}
        className={`flex items-start gap-3 select-none cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            aria-invalid={hasError ? 'true' : 'false'}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center bg-slate-950/80 
              peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-slate-900 
              peer-checked:bg-emerald-600 peer-checked:border-emerald-600 peer-checked:text-white
              ${
                hasError
                  ? 'border-rose-500'
                  : 'border-slate-700 group-hover:border-slate-500 peer-checked:group-hover:border-emerald-500'
              }`}
          >
            <Check className="w-3 h-3 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-slate-200 leading-tight group-hover:text-slate-100">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-400 mt-0.5 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
