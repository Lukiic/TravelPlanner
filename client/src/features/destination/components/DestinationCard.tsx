import { format, parseISO } from 'date-fns';
import Button from '../../ui/components/Button';
import type { Destination } from '../types/Destination';

interface DestinationCardProps {
    destination: Destination;
    onEdit: (destination: Destination) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean;
}

export default function DestinationCard({ destination, onEdit, onDelete, readOnly }: DestinationCardProps) {
    const arrival = format(parseISO(destination.arrivalDate), 'MMM d, yyyy');
    const departure = format(parseISO(destination.departureDate), 'MMM d, yyyy');

    return (
        <div className="flex gap-4 p-4 bg-navy-900 border border-navy-700 rounded-xl hover:border-navy-600 transition-colors group">
            {/* Left teal accent bar */}
            <div className="w-1 bg-gradient-to-b from-teal-500 to-teal-700 rounded-full flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-display font-semibold text-white text-base truncate">
                            {destination.name}
                        </h3>
                        <p className="text-teal-400 text-sm flex items-center gap-1 mt-0.5">
                            <span>📍</span>
                            <span className="truncate">{destination.location}</span>
                        </p>
                    </div>

                    {/* Actions — visible on hover when not readOnly */}
                    {!readOnly && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <Button size="sm" variant="secondary" onClick={() => onEdit(destination)}>
                                Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => onDelete(destination.id)}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                    <span>{arrival}</span>
                    <span className="text-navy-600">→</span>
                    <span>{departure}</span>
                </div>

                {/* Description */}
                {destination.description && (
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{destination.description}</p>
                )}
            </div>
        </div>
    );
}