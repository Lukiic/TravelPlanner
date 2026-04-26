import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import Button from '../../ui/components/Button';
import type { TravelPlan } from '../types/TravelPlan';

interface PlanCardProps {
    plan: TravelPlan;
    onDelete: (id: string) => void;
}

export default function PlanCard({ plan, onDelete }: PlanCardProps) {
    const navigate = useNavigate();
    const duration = differenceInDays(parseISO(plan.endDate), parseISO(plan.startDate));

    return (
        <div className="bg-navy-900 border border-navy-700 rounded-2xl shadow-card overflow-hidden hover:border-navy-600 transition-colors group">
            <div className="h-1 bg-gradient-to-r from-teal-600 to-teal-400" />

            <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-white mb-1 truncate">{plan.name}</h3>
                {plan.description && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{plan.description}</p>
                )}

                <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>📅</span>
                        <span className="font-mono">
                            {format(parseISO(plan.startDate), 'MMM d')} – {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>⏱</span>
                        <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full">
                        <span>💰</span>
                        <span className="font-mono">${plan.budget.toLocaleString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigate(`/plans/${plan.id}`)} className="flex-1 justify-center">View</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/plans/${plan.id}/edit`)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(plan.id)}>Delete</Button>
                </div>
            </div>
        </div>
    );
}