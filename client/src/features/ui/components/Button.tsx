import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: ReactNode;
}

const variants = {
    primary: 'bg-teal-500 hover:bg-teal-400 text-white hover:shadow-teal',
    secondary: 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600',
    danger: 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/40',
    ghost: 'bg-transparent hover:bg-navy-800 text-slate-400 hover:text-white',
};
const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...rest }: ButtonProps) {
    return (
        <button
            {...rest}
            disabled={disabled || loading}
            className={`inline-flex items-center gap-2 font-body font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {children}
        </button>
    );
}