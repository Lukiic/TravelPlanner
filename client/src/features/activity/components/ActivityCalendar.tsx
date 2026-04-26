import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Activity } from '../types/Activity';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } });

interface Props {
    activities: Activity[];
    onSelectActivity: (activity: Activity) => void;
    onAddActivity: () => void;
}

export default function ActivityCalendar({ activities, onSelectActivity, onAddActivity }: Props) {
    const events = activities.map(a => ({
        id: a.id,
        title: `${a.time ? a.time + ' · ' : ''}${a.name}`,
        start: new Date(`${a.date}T${a.time || '00:00'}`),
        end: new Date(`${a.date}T${a.time || '00:00'}`),
        resource: a,
    }));

    return (
        <div style={{ height: 560 }}>
            <Calendar
                localizer={localizer}
                events={events}
                onSelectEvent={e => onSelectActivity(e.resource as Activity)}
                views={['month', 'week', 'day']}
                defaultView="month"
            />
        </div>
    );
}