import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import Spinner from '../../ui/components/Spinner';
import PageHeader from '../../ui/layout/PageHeader';
import PlanForm from '../components/PlanForm';
import type { CreateTravelPlanRequest } from '../types/CreateTravelPlanRequest';
import type { TravelPlan } from '../types/TravelPlan';
import type { TravelPlanProps } from '../types/TravelPlanProps';


export default function EditPlanPage({ travelPlanApi }: TravelPlanProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<TravelPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id)
            return;

        travelPlanApi
            .getById(id)
            .then(setPlan)
            .catch(() => {
                toast.error('Failed to load plan');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleSubmit = async (data: CreateTravelPlanRequest) => {
        if (!id)
            return;

        setSaving(true);

        try {
            await travelPlanApi.update(id, data);
            toast.success('Plan updated!');
            navigate(`/plans/${id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return <Spinner fullScreen />;

    const initialValues: Partial<CreateTravelPlanRequest> = plan
        ? {
            name: plan.name,
            description: plan.description,
            startDate: plan.startDate.slice(0, 10),     // Slice to yyyy-MM-dd
            endDate: plan.endDate.slice(0, 10),
            budget: plan.budget,
            notes: plan.notes,
        }
        : {};

    return (
        <div className="p-8">
            <PageHeader
                title="Edit Plan"
                subtitle={plan?.name}
                actions={
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        ← Cancel
                    </Button>
                }
            />
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-card">
                <PlanForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    loading={saving}
                    submitLabel="Save Changes"
                />
            </div>
        </div>
    );
}