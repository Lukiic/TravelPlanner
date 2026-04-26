interface BadgeProps {
    label: string;
    color?: 'teal' | 'blue' | 'yellow' | 'green' | 'red' | 'slate';
}

const colors = {
    teal: 'bg-teal-500/20 text-teal-400',
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    slate: 'bg-slate-700/50 text-slate-400',
};

export default function Badge({ label, color = 'slate' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${colors[color]}`}>
            {label}
        </span>
    );
}