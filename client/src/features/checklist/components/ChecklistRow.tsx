import type { ChecklistItem } from "../types/ChecklistItem";

interface ChecklistRowProps {
    item: ChecklistItem;
    onToggle: () => void;
    onDelete: () => void;
    readOnly?: boolean;
}

export default function ChecklistRow({ item, onToggle, onDelete, readOnly }: ChecklistRowProps) {
    return (
        <div className="flex items-center gap-3 py-2.5 group">
            {/* Custom checkbox */}
            <button
                type="button"
                onClick={readOnly ? undefined : onToggle}
                disabled={readOnly}
                className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 ${item.isCompleted
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-navy-600 hover:border-teal-500 bg-transparent'
                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
                {item.isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {/* Label */}
            <span
                className={`flex-1 text-sm transition-all duration-200 ${item.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
            >
                {item.name}
            </span>

            {/* Delete — only visible on hover, hidden when readOnly */}
            {!readOnly && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 text-xs px-1 py-0.5 rounded"
                >
                    ✕
                </button>
            )}
        </div>
    );
}