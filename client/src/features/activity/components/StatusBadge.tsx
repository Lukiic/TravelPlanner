import Badge from "../../ui/components/Badge";
import type { ActivityStatus } from "../types/ActivityStatus";

const statusConfig: Record<ActivityStatus, { color: 'blue' | 'yellow' | 'green' | 'red'; label: string }> = {
    Planned: { color: 'blue', label: 'Planned' },
    Reserved: { color: 'yellow', label: 'Reserved' },
    Completed: { color: 'green', label: 'Completed' },
    Cancelled: { color: 'red', label: 'Cancelled' },
};

export default function StatusBadge({ status }: { status: ActivityStatus }) {
    const { color, label } = statusConfig[status];
    return <Badge label={label} color={color} />;
}