import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { ChecklistItem } from '../types/ChecklistItem';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Spinner from '../../ui/components/Spinner';
import { checklistApi } from '../api/checklist.api';
import ChecklistRow from '../components/ChecklistRow';
import ChecklistSuggestions from '../components/ChecklistSuggestions';


interface ChecklistSectionProps {
    planId: string;
    readOnly?: boolean;
}

export default function ChecklistSection({ planId, readOnly = false }: ChecklistSectionProps) {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [adding, setAdding] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checklistApi
            .getAll(planId)
            .then(setItems)
            .catch(() => toast.error('Failed to load checklist'))
            .finally(() => setLoading(false));
    }, [planId]);

    const handleToggle = async (item: ChecklistItem) => {
        // Optimistic update
        setItems(prev =>
            prev.map(i => (i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i))
        );
        try {
            await checklistApi.toggle(planId, item.id, item.isCompleted);
        } catch {
            // Revert on error
            setItems(prev =>
                prev.map(i => (i.id === item.id ? { ...i, isCompleted: item.isCompleted } : i))
            );
            toast.error('Failed to update item');
        }
    };

    const handleAdd = async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setAdding(true);
        try {
            const created = await checklistApi.create(planId, trimmed);
            setItems(prev => [...prev, created]);
            setNewItemName('');
            inputRef.current?.focus();
        } catch {
            toast.error('Failed to add item');
        } finally {
            setAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(newItemName);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await checklistApi.delete(planId, deleteTarget);
            setItems(prev => prev.filter(i => i.id !== deleteTarget));
        } catch {
            toast.error('Failed to delete item');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    const completed = items.filter(i => i.isCompleted).length;
    const total = items.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div>
            {/* Progress */}
            {total > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-400">
                            <span className="text-white font-medium">{completed}</span> of{' '}
                            <span className="text-white font-medium">{total}</span> items completed
                        </p>
                        <span className="text-xs font-mono text-teal-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Item list */}
            <div className="bg-navy-900 border border-navy-700 rounded-2xl px-5 divide-y divide-navy-800">
                {items.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-3xl mb-3">✅</p>
                        <p className="text-slate-400 text-sm">Your checklist is empty.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <ChecklistRow
                            key={item.id}
                            item={item}
                            onToggle={() => handleToggle(item)}
                            onDelete={() => setDeleteTarget(item.id)}
                            readOnly={readOnly}
                        />
                    ))
                )}

                {/* Quick add input */}
                {!readOnly && (
                    <div className="flex items-center gap-3 py-3">
                        <div className="w-5 h-5 flex-shrink-0 rounded border-2 border-dashed border-navy-600" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add an item..."
                            className="flex-1 bg-transparent text-sm text-slate-400 placeholder-slate-600 focus:outline-none focus:text-white transition-colors"
                        />
                        {newItemName.trim() && (
                            <button
                                type="button"
                                onClick={() => handleAdd(newItemName)}
                                disabled={adding}
                                className="text-xs text-teal-400 hover:text-teal-300 font-medium disabled:opacity-50 transition-colors"
                            >
                                {adding ? '...' : 'Add'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {!readOnly && (
                <ChecklistSuggestions
                    existing={items.map(i => i.name)}
                    onAdd={name => handleAdd(name)}
                />
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Remove item?"
                message="This checklist item will be permanently deleted."
            />
        </div>
    );
}