import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'gold' | 'chicha';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--border-active)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-[var(--border-active)] hover:bg-opacity-80 text-[var(--text-primary)] border border-[var(--border-active)] shadow-md',
    secondary: 'bg-[var(--bg-elevated)] hover:bg-opacity-80 text-[var(--text-primary)] border border-[var(--border-subtle)]',
    danger: 'bg-[var(--danger)] hover:bg-opacity-90 text-slate-900 font-bold shadow-md',
    success: 'bg-[var(--success)] hover:bg-opacity-90 text-slate-900 font-bold shadow-md',
    ghost: 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    gold: 'bg-gold-gradient text-slate-900 font-extrabold shadow-lg border border-[var(--gold-light)]',
    chicha: 'bg-chicha-gradient text-[var(--text-primary)] font-extrabold shadow-lg text-shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full font-bold' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
