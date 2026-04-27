import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';
import ActivitiesSection from '../../activity/pages/ActivitiesSection';
import ChecklistSection from '../../checklist/pages/ChecklistSection';
import DestinationsSection from '../../destination/pages/DestinationsSection';
import ExpensesSection from '../../expense/pages/ExpensesSection';
import ShareSection from '../../sharing/pages/ShareSection';
import Button from '../../ui/components/Button';
import Spinner from '../../ui/components/Spinner';
import type { TravelPlan } from '../types/TravelPlan';
import type { ITravelPlanApi } from '../api/ITravelPlanApi';
import type { IDestinationApi } from '../../destination/api/IDestinationApi';
import type { IActivityApi } from '../../activity/api/IActivityApi';
import type { IChecklistApi } from '../../checklist/api/IChecklistApi';
import type { IExpenseApi } from '../../expense/api/IExpenseApi';
import type { ISharingApi } from '../../sharing/api/ISharingApi';
import { useAuth } from '../../../context/AuthContext';


type Tab = 'overview' | 'destinations' | 'activities' | 'expenses' | 'checklist' | 'share';

const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'destinations', label: 'Destinations', icon: '📍' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'share', label: 'Share', icon: '🔗' },
];

interface PlanDetailPageProps {
    travelPlanApi: ITravelPlanApi;
    destinationApi: IDestinationApi;
    activityApi: IActivityApi;
    checklistApi: IChecklistApi;
    expenseApi: IExpenseApi;
    sharingApi: ISharingApi;
}

export default function PlanDetailPage({ travelPlanApi, destinationApi, activityApi, checklistApi, expenseApi, sharingApi }: PlanDetailPageProps) {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<TravelPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [exportingPdf, setExportingPdf] = useState(false);

    const isOwner = plan ? plan.userId === user?.id : false;
    const isAdminViewer = !isOwner && user?.role === 'Admin';   // Admin should not see 'Share' tab of users plans
    const visibleTabs = tabs.filter(tab => !(tab.id === 'share' && isAdminViewer));

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

    const handleExportPdf = async () => {
        if (!id || !plan)
            return;

        setExportingPdf(true);

        try {
            const blob = await travelPlanApi.exportPdf(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${plan.name}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to export PDF');
        } finally {
            setExportingPdf(false);
        }
    };

    if (loading) return <Spinner fullScreen />;
    if (!plan) return null;

    const duration = differenceInDays(parseISO(plan.endDate), parseISO(plan.startDate));

    return (
        <div className="p-8">
            {/* Page header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-slate-500 hover:text-slate-300 mb-2 flex items-center gap-1 transition-colors"
                    >
                        ← All plans
                    </button>
                    <h1 className="font-display text-3xl font-bold text-white">{plan.name}</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleExportPdf} loading={exportingPdf} size="sm">
                        ↓ PDF
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/plans/${id}/edit`)} size="sm">
                        Edit Plan
                    </Button>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 border-b border-navy-800 mb-8 overflow-x-auto">
                {visibleTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab.id
                            ? 'text-white border-teal-500'
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {activeTab === 'overview' && (
                    <OverviewTab plan={plan} duration={duration} />
                )}
                {activeTab === 'destinations' && (
                    <DestinationsSection
                        planId={plan.id}
                        travelPlanStartDate={plan.startDate.slice(0, 10)}
                        travelPlanEndDate={plan.endDate.slice(0, 10)}
                        destinationApi={destinationApi} />
                )}
                {activeTab === 'activities' && (
                    <ActivitiesSection
                        planId={plan.id}
                        travelPlanStartDate={plan.startDate.slice(0, 10)}
                        travelPlanEndDate={plan.endDate.slice(0, 10)}
                        activityApi={activityApi} />
                )}
                {activeTab === 'expenses' && (
                    <ExpensesSection planId={plan.id}
                        expenseApi={expenseApi} />
                )}
                {activeTab === 'checklist' && (
                    <ChecklistSection planId={plan.id}
                        checklistApi={checklistApi} />
                )}
                {activeTab === 'share' && (
                    <ShareSection planId={plan.id} sharingApi={sharingApi} />
                )}
            </div>
        </div>
    );
}

interface OverviewTabProps {
    plan: TravelPlan;
    duration: number;
}

function OverviewTab({ plan, duration }: OverviewTabProps) {
    const startFormatted = format(parseISO(plan.startDate), 'MMMM d, yyyy');
    const endFormatted = format(parseISO(plan.endDate), 'MMMM d, yyyy');

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap gap-3">
                <InfoChip icon="📅" label={`${startFormatted} → ${endFormatted}`} />
                <InfoChip icon="⏱" label={`${duration} day${duration !== 1 ? 's' : ''}`} />
                <InfoChip icon="💰" label={`$${plan.budget.toLocaleString()} budget`} highlight />
            </div>

            {/* Description */}
            {plan.description && (
                <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-medium">Description</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{plan.description}</p>
                </div>
            )}

            {/* Notes */}
            {plan.notes && (
                <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-medium">Notes</p>
                    <div className="border-l-2 border-teal-600 pl-4">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{plan.notes}</p>
                    </div>
                </div>
            )}

            {/* Created date */}
            <p className="text-xs text-slate-600 font-mono">
                Created {format(parseISO(plan.createdAt), 'PPP')}
            </p>
        </div>
    );
}

function InfoChip({ icon, label, highlight }: { icon: string; label: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${highlight
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
            : 'bg-navy-900 border border-navy-700 text-slate-300'
            }`}>
            <span>{icon}</span>
            <span className="font-body">{label}</span>
        </div>
    );
}