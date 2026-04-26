import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { TravelPlan } from '../types/TravelPlan';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import EmptyState from '../../ui/components/EmptyState';
import Spinner from '../../ui/components/Spinner';
import PageHeader from '../../ui/layout/PageHeader';
import { travelPlanApi } from '../api/travel-plan.api';
import PlanCard from '../components/PlanCard';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<TravelPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        travelPlanApi.getAll().then(setPlans).catch(() => toast.error('Failed to load plans')).finally(() => setLoading(false));
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget)
            return;

        setDeleting(true);

        try {
            await travelPlanApi.delete(deleteTarget);
            setPlans(p => p.filter(x => x.id !== deleteTarget));
            toast.success('Plan deleted');
        } catch {
            toast.error('Failed to delete plan');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="p-8">
            <PageHeader
                title="My Travel Plans"
                subtitle={`${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
                actions={<Button onClick={() => navigate('/plans/new')}>+ New Plan</Button>}
            />

            {loading ? (
                <Spinner />
            ) : plans.length === 0 ? (
                <EmptyState
                    icon="🗺️"
                    title="No travel plans yet"
                    description="Start planning your next adventure."
                    action={{ label: 'Create your first plan', onClick: () => navigate('/plans/new') }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {plans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} onDelete={setDeleteTarget} />
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Delete travel plan?"
                message="All destinations, activities, expenses, and checklist items will be permanently deleted."
            />
        </div>
    );
}