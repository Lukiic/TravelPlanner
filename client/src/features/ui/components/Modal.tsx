import { type ReactNode, useEffect } from 'react';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            {/* Panel */}
            <div className={`relative w-full ${sizeClasses[size]} bg-navy-900 border border-navy-700 rounded-2xl shadow-card overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
                    <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
                {/* Body */}
                <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}