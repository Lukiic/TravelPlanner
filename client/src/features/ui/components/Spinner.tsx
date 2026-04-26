interface SpinnerProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ fullScreen, size = 'md' }: SpinnerProps) {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
    const spinner = (
        <div className={`${sizes[size]} border-2 border-navy-700 border-t-teal-500 rounded-full animate-spin`} />
    );
    if (fullScreen) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                {spinner}
            </div>
        );
    }
    return <div className="flex items-center justify-center p-8">{spinner}</div>;
}