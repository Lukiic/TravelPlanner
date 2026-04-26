import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                {label}
            </label>
        )}
        <input
            ref={ref}
            className={`input-base ${error ? 'border-red-500 focus:border-red-400' : ''} ${className}`}
            {...rest}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
));
Input.displayName = 'Input';
export default Input;