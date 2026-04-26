import type { BudgetSummary } from "../types/BudgetSummary";
import type { ExpenseCategory } from "../types/ExpenseCategory";
import CategoryBadge from "./CategoryBadge";


interface Props { summary: BudgetSummary }

export default function BudgetSummaryCard({ summary }: Props) {
    const pct = summary.totalBudget > 0
        ? Math.min((summary.totalSpent / summary.totalBudget) * 100, 100)
        : 0;

    const barColor = pct < 80 ? 'bg-green-500' : pct < 100 ? 'bg-yellow-500' : 'bg-red-500';
    const remainColor = summary.remainingBudget >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-card mb-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                    { label: 'Budget', value: summary.totalBudget, className: 'text-white' },
                    { label: 'Spent', value: summary.totalSpent, className: 'text-white' },
                    { label: 'Remaining', value: summary.remainingBudget, className: remainColor },
                ].map(({ label, value, className }) => (
                    <div key={label} className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`font-mono text-xl font-semibold ${className}`}>
                            ${value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-navy-800 rounded-full overflow-hidden mb-5">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500 text-right mb-4">{pct.toFixed(1)}% of budget used</p>

            {/* Category breakdown */}
            {Object.keys(summary.spentByCategory).length > 0 && (
                <div className="space-y-2 border-t border-navy-800 pt-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">By category</p>
                    {Object.entries(summary.spentByCategory).map(([cat, amount]) => (
                        <div key={cat} className="flex items-center justify-between text-sm">
                            <CategoryBadge category={cat as ExpenseCategory} />
                            <span className="font-mono text-slate-300">${amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}