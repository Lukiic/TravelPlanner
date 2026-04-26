import type { TravelPlan } from '../types/TravelPlan';
import PlanCard from './PlanCard';

interface PlanGridProps {
    plans: TravelPlan[];
    onDelete: (id: string) => void;
}

export default function PlanGrid({ plans, onDelete }: PlanGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} onDelete={onDelete} />
            ))}
        </div>
    );
}