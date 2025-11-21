import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    secondary: 'bg-surface border border-border text-text hover:bg-white/10',
    ghost: 'bg-transparent text-text hover:bg-white/5',
    danger: 'bg-red-900/50 text-red-200 border border-red-900 hover:bg-red-900/70',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg font-semibold',
  };

  return (
    <button
      className={cn(
        'rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('bg-surface border border-border rounded-xl overflow-hidden', className)} {...props} />
);

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-text border border-white/10', className)}>
    {children}
  </span>
);

export const StatBar: React.FC<{ label: string; value: number; colorClass?: string }> = ({ label, value, colorClass = "bg-blue-500" }) => (
  <div className="w-full mb-1">
    <div className="flex justify-between text-xs mb-0.5 text-muted">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
      <div 
        className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);
