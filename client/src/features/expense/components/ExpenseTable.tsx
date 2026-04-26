import { format, parseISO } from 'date-fns';
import CategoryBadge from './CategoryBadge';
import Button from '../../ui/components/Button';
import EmptyState from '../../ui/components/EmptyState';
import type { Expense } from '../types/Expense';

interface ExpenseTableProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean;
}

export default function ExpenseTable({ expenses, onEdit, onDelete, readOnly }: ExpenseTableProps) {
    if (expenses.length === 0) {
        return (
            <EmptyState
                icon="💰"
                title="No expenses yet"
                description="Track spending against your budget."
            />
        );
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-navy-700 bg-navy-800">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Name</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Category</th>
                        <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Amount</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Date</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Description</th>
                        {!readOnly && (
                            <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense, idx) => (
                        <tr
                            key={expense.id}
                            className={`border-b border-navy-800 hover:bg-navy-800/50 transition-colors group ${idx === expenses.length - 1 ? 'border-b-0' : ''
                                }`}
                        >
                            <td className="px-4 py-3 text-white font-medium">{expense.name}</td>
                            <td className="px-4 py-3">
                                <CategoryBadge category={expense.category} />
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-white">
                                ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                                {format(parseISO(expense.date), 'MMM d, yyyy')}
                            </td>
                            <td className="px-4 py-3 text-slate-400 max-w-[180px]">
                                <span className="truncate block">{expense.description || '—'}</span>
                            </td>
                            {!readOnly && (
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="secondary" onClick={() => onEdit(expense)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => onDelete(expense.id)}>Delete</Button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-navy-700 bg-navy-800/50">
                        <td
                            colSpan={readOnly ? 4 : 5}
                            className="px-4 py-3 text-right text-xs text-slate-500 uppercase tracking-wider"
                        >
                            Total
                        </td>
                        <td className={`px-4 py-3 font-mono font-semibold text-white ${readOnly ? '' : 'text-right'}`}>
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {!readOnly && <td />}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}