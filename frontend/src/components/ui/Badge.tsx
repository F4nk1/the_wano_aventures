import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gold';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border';

  const variants = {
    primary: 'bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)]',
    secondary: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    success: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    danger: 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20',
    warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
    info: 'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20',
    gold: 'bg-gold-gradient/10 text-[var(--gold)] border-[var(--gold)]/20',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
