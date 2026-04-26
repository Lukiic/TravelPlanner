import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import type { TravelPlan } from '../../travel-plan/types/TravelPlan';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import EmptyState from '../../ui/components/EmptyState';
import Spinner from '../../ui/components/Spinner';
import PageHeader from '../../ui/layout/PageHeader';
import { adminApi } from '../api/admin.api';


export default function AdminPlansPage() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<TravelPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        adminApi
            .getAllPlans()
            .then(setPlans)
            .catch(() => toast.error('Failed to load plans'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget)
            return;

        setDeleting(true);

        try {
            await adminApi.deletePlan(deleteTarget);
            setPlans(prev => prev.filter(p => p.id !== deleteTarget));
            toast.success('Plan deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete plan');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <PageHeader
                title="All Plans"
                subtitle={`${plans.length} total travel plans`}
            />

            {plans.length === 0 ? (
                <EmptyState icon="📋" title="No plans found" />
            ) : (
                <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-navy-700 bg-navy-800">
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Plan Name</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Dates</th>
                                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Budget</th>
                                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan, idx) => (
                                <tr
                                    key={plan.id}
                                    className={`border-b border-navy-800 hover:bg-navy-800/50 transition-colors ${idx === plans.length - 1 ? 'border-b-0' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium">{plan.name}</p>
                                        {plan.description && (
                                            <p className="text-slate-500 text-xs truncate max-w-[240px]">{plan.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                                        {format(parseISO(plan.startDate), 'MMM d, yyyy')}
                                        <span className="text-navy-600 mx-1">→</span>
                                        {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-white">
                                        ${plan.budget.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="secondary" onClick={() => navigate(`/plans/${plan.id}`)}>
                                                View
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(plan.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Delete travel plan?"
                message="This will permanently delete the plan and all its data."
            />
        </div>
    );
}