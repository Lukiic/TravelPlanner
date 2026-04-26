interface ChecklistSuggestionsProps {
    existing: string[];
    onAdd: (name: string) => void;
}

const SUGGESTIONS = [
    'Passport',
    'Flight tickets',
    'Hotel reservation',
    'Travel insurance',
    'Charger & cables',
    'Camera',
    'Sunscreen',
    'First aid kit',
    'Local currency',
    'Power adapter',
    'Medications',
    'Snacks',
];

export default function ChecklistSuggestions({ existing, onAdd }: ChecklistSuggestionsProps) {
    const existingLower = existing.map(n => n.toLowerCase());

    const available = SUGGESTIONS.filter(
        s => !existingLower.includes(s.toLowerCase())
    );

    if (available.length === 0) return null;

    return (
        <div className="mt-5 pt-5 border-t border-navy-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick add suggestions</p>
            <div className="flex flex-wrap gap-2">
                {available.map(suggestion => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => onAdd(suggestion)}
                        className="px-3 py-1.5 text-xs bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-teal-600 text-slate-400 hover:text-teal-400 rounded-full transition-all duration-200"
                    >
                        + {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}