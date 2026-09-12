import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  helperText?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  required,
  helperText,
  hint,
  error,
  className = '',
  children,
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const effectiveHelper = hint || helperText;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={fieldId}
            className="text-xs font-medium text-slate-300 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-400 font-bold" aria-hidden="true">*</span>}
          </label>
        </div>
      )}
      
      {/* Clone or wrap children if needed, or render as is */}
      <div>{children}</div>

      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-rose-400 mt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : effectiveHelper ? (
        <p id={helperId} className="text-xs text-slate-400 mt-0.5">
          {effectiveHelper}
        </p>
      ) : null}
    </div>
  );
}
