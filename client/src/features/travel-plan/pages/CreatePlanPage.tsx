import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import PageHeader from '../../ui/layout/PageHeader';
import PlanForm from '../components/PlanForm';
import type { CreateTravelPlanRequest } from '../types/CreateTravelPlanRequest';
import type { TravelPlanProps } from '../types/TravelPlanProps';

export default function CreatePlanPage({ travelPlanApi }: TravelPlanProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: CreateTravelPlanRequest) => {
        setLoading(true);
        try {
            const plan = await travelPlanApi.create(data);
            toast.success('Travel plan created!');
            navigate(`/plans/${plan.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl">
            <PageHeader
                title="New Travel Plan"
                subtitle="Fill in the details to start planning your trip"
                actions={
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        ← Back
                    </Button>
                }
            />
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-card">
                <PlanForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    submitLabel="Create Plan"
                />
            </div>
        </div>
    );
}