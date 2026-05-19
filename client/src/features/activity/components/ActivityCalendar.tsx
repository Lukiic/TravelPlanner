import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Activity } from '../types/Activity';
import type { ActivityStatus } from '../types/ActivityStatus';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
});

const STATUS_COLORS: Record<ActivityStatus, string> = {
    Planned: '#3b82f6',
    Reserved: '#f59e0b',
    Completed: '#22c55e',
    Cancelled: '#6b7280',
};

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Activity;
}

interface Props {
    activities: Activity[];
    onSelectActivity: (activity: Activity) => void;
    readOnly?: boolean;
}

export default function ActivityCalendar({
    activities,
    onSelectActivity,
    readOnly,
}: Props) {
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<View>('month');

    const events: CalendarEvent[] = activities.map(a => {
        const timeStr = a.time && a.time.length >= 5 ? a.time.slice(0, 5) : '09:00';
        const start = new Date(`${a.date.slice(0, 10)}T${timeStr}:00`);
        // Give each event a 1-hour duration so it renders as a visible block
        const end = addMinutes(start, 60);
        return {
            id: a.id,
            title: a.name,
            start,
            end,
            resource: a,
        };
    });

    return (
        <div className="h-[640px]">
            <Calendar
                localizer={localizer}
                events={events}
                date={date}
                onNavigate={setDate}
                view={view}
                onView={setView}
                onSelectEvent={e => {
                    if (readOnly) return;
                    onSelectActivity(e.resource);
                }}
                eventPropGetter={event => ({
                    style: {
                        backgroundColor: STATUS_COLORS[event.resource.status as ActivityStatus] ?? '#0d9488',
                        borderColor: 'transparent',
                        borderRadius: '4px',
                        fontSize: '12px',
                        padding: '1px 6px',
                        cursor: readOnly ? 'default' : 'pointer',
                    },
                })}
                tooltipAccessor={event => {
                    const a = event.resource;
                    const parts: string[] = [a.status];
                    if (a.location)
                        parts.push(a.location);
                    if (a.estimatedCost > 0)
                        parts.push(`$${a.estimatedCost}`);
                    return parts.join('  ·  ');
                }}
                views={['month', 'week', 'day']}
                popup
                popupOffset={30}
            />
        </div>
    );
}