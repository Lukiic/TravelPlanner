import { format, parseISO } from 'date-fns';
import Button from '../../ui/components/Button';
import EmptyState from '../../ui/components/EmptyState';
import type { Activity } from '../types/Activity';
import StatusBadge from './StatusBadge';


interface ActivityListProps {
    activities: Activity[];
    onEdit: (activity: Activity) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean;
}

export default function ActivityList({ activities, onEdit, onDelete, readOnly }: ActivityListProps) {
    if (activities.length === 0) {
        return (
            <EmptyState
                icon="🎯"
                title="No activities yet"
                description="Add activities to build your daily itinerary."
            />
        );
    }

    // Group by date
    const grouped = activities.reduce<Record<string, Activity[]>>((acc, activity) => {
        const dateKey = activity.date.slice(0, 10);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(activity);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="space-y-6">
            {sortedDates.map(dateKey => (
                <div key={dateKey}>
                    {/* Date header */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-medium font-mono">
                            {format(parseISO(dateKey), 'EEEE, MMMM d')}
                        </span>
                        <div className="flex-1 h-px bg-navy-800" />
                    </div>

                    {/* Activities for this date */}
                    <div className="space-y-2">
                        {grouped[dateKey]
                            .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
                            .map(activity => (
                                <ActivityRow
                                    key={activity.id}
                                    activity={activity}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    readOnly={readOnly}
                                />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ActivityRowProps {
    activity: Activity;
    onEdit: (a: Activity) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean;
}

function ActivityRow({ activity, onEdit, onDelete, readOnly }: ActivityRowProps) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl hover:border-navy-600 transition-colors group">
            {/* Time */}
            <div className="w-14 text-xs font-mono text-slate-500 flex-shrink-0">
                {activity.time ? activity.time.slice(0, 5) : '—'}
            </div>

            {/* Name + location */}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{activity.name}</p>
                {activity.location && (
                    <p className="text-slate-500 text-xs truncate mt-0.5">📍 {activity.location}</p>
                )}
            </div>

            {/* Cost */}
            <div className="text-sm font-mono text-slate-400 flex-shrink-0">
                {activity.estimatedCost > 0 ? `$${activity.estimatedCost.toLocaleString()}` : '—'}
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
                <StatusBadge status={activity.status} />
            </div>

            {/* Actions */}
            {!readOnly && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(activity)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(activity.id)}>Delete</Button>
                </div>
            )}
        </div>
    );
}