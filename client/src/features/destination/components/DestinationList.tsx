import EmptyState from "../../ui/components/EmptyState";
import type { Destination } from "../types/Destination";
import DestinationCard from "./DestinationCard";

interface DestinationListProps {
    destinations: Destination[];
    onEdit: (destination: Destination) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean;
}

export default function DestinationList({ destinations, onEdit, onDelete, readOnly }: DestinationListProps) {
    if (destinations.length === 0) {
        return (
            <EmptyState
                icon="📍"
                title="No destinations yet"
                description="Add the places you'll be visiting on this trip."
            />
        );
    }

    return (
        <div className="space-y-3">
            {destinations.map(d => (
                <DestinationCard
                    key={d.id}
                    destination={d}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    readOnly={readOnly}
                />
            ))}
        </div>
    );
}