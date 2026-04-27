import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { sharingApi } from '../api/SharingApi';
import { createSharedApis } from '../api/SharedApiFactory';
import type { SharedPlanData } from '../types/SharedPlanData';
import DestinationsSection from '../../destination/pages/DestinationsSection';
import ActivitiesSection from '../../activity/pages/ActivitiesSection';
import ExpensesSection from '../../expense/pages/ExpensesSection';
import ChecklistSection from '../../checklist/pages/ChecklistSection';
import Spinner from '../../ui/components/Spinner';

type Tab = 'overview' | 'destinations' | 'activities' | 'expenses' | 'checklist';

const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'destinations', label: 'Destinations', icon: '📍' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
];

export default function SharedPlanPage() {
    const { token } = useParams<{ token: string }>();
    const [data, setData] = useState<SharedPlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const sharedApis = useMemo(
        () => token ? createSharedApis(token) : null,
        [token]
    );

    useEffect(() => {
        if (!token)
            return;

        sharingApi
            .getSharedPlan(token)
            .then(setData)
            .catch(err => {
                setError(
                    err.response?.status === 404
                        ? 'This link is invalid or has been revoked.'
                        : 'Failed to load the shared plan.'
                );
            })
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <Spinner fullScreen />;

    if (error || !data || !sharedApis) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <span className="text-5xl mb-4 block">🔒</span>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">Link unavailable</h2>
                    <p className="text-slate-400 text-sm">{error ?? 'This shared link is no longer valid.'}</p>
                </div>
            </div>
        );
    }

    const { plan, accessType } = data;
    const isEdit = accessType === 'EDIT';
    const duration = differenceInDays(parseISO(plan.endDate), parseISO(plan.startDate));

    return (
        <div className="min-h-screen bg-navy-950">
            <header className="border-b border-navy-800 px-8 py-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-white">
                    Travel<span className="text-teal-500">Planner</span>
                </span>
                <span className="text-xs text-slate-500">Shared Plan</span>
            </header>

            <div className={`px-8 py-3 border-b text-sm font-medium flex items-center gap-2 ${isEdit
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                : 'bg-navy-900 border-navy-800 text-slate-400'
                }`}>
                <span>{isEdit ? '✏️' : '👁️'}</span>
                {isEdit
                    ? 'You have edit access to this shared plan.'
                    : 'You are viewing this plan in read-only mode.'}
            </div>

            <div className="p-8">
                <div className="mb-6">
                    <h1 className="font-display text-3xl font-bold text-white mb-1">{plan.name}</h1>
                    {plan.description && <p className="text-slate-400 text-sm">{plan.description}</p>}
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-navy-900 border border-navy-700 text-slate-300">
                        <span>📅</span>
                        <span className="font-mono text-xs">
                            {format(parseISO(plan.startDate), 'MMM d')} – {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-navy-900 border border-navy-700 text-slate-300">
                        <span>⏱</span>
                        <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-teal-500/10 border border-teal-500/30 text-teal-400">
                        <span>💰</span>
                        <span className="font-mono">${plan.budget.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-1 border-b border-navy-800 mb-8 overflow-x-auto">
                    {tabs.map(tab => (
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

                {activeTab === 'overview' && plan.notes && (
                    <div className="max-w-2xl bg-navy-900 border border-navy-700 rounded-2xl p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Notes</p>
                        <div className="border-l-2 border-teal-600 pl-4">
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{plan.notes}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'destinations' && (
                    <DestinationsSection
                        planId={plan.id}
                        readOnly={!isEdit}
                        travelPlanStartDate={plan.startDate.slice(0, 10)}
                        travelPlanEndDate={plan.endDate.slice(0, 10)}
                        destinationApi={sharedApis.destinationApi}
                    />
                )}
                {activeTab === 'activities' && (
                    <ActivitiesSection
                        planId={plan.id}
                        readOnly={!isEdit}
                        travelPlanStartDate={plan.startDate.slice(0, 10)}
                        travelPlanEndDate={plan.endDate.slice(0, 10)}
                        activityApi={sharedApis.activityApi}
                    />
                )}
                {activeTab === 'expenses' && (
                    <ExpensesSection
                        planId={plan.id}
                        readOnly={!isEdit}
                        expenseApi={sharedApis.expenseApi}
                    />
                )}
                {activeTab === 'checklist' && (
                    <ChecklistSection
                        planId={plan.id}
                        readOnly={!isEdit}
                        checklistApi={sharedApis.checklistApi}
                    />
                )}
            </div>
        </div>
    );
}