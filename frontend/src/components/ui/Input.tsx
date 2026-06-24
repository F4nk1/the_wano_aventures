import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`w-full bg-[var(--bg-surface)] border ${error ? 'border-[var(--danger)] focus:ring-[var(--danger)]' : 'border-[var(--border-subtle)] focus:border-[var(--border-active)]'} rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all text-sm font-medium ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-[var(--danger)]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-[var(--text-muted)]">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
