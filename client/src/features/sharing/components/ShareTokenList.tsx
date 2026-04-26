import { format, parseISO } from 'date-fns';
import Button from '../../ui/components/Button';
import EmptyState from '../../ui/components/EmptyState';
import type { ShareToken } from '../types/ShareToken';


interface ShareTokenListProps {
    tokens: ShareToken[];
    onRevoke: (token: string) => void;
    revoking: string | null;
}

export default function ShareTokenList({ tokens, onRevoke, revoking }: ShareTokenListProps) {
    if (tokens.length === 0) {
        return (
            <EmptyState
                icon="🔗"
                title="No active links"
                description="Create a share link to let others view or edit this plan."
            />
        );
    }

    return (
        <div className="space-y-2">
            {tokens.map(token => (
                <div
                    key={token.token}
                    className="flex items-center gap-4 px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl"
                >
                    {/* Access type */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${token.accessType === 'EDIT'
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'bg-slate-700/50 text-slate-400'
                        }`}>
                        {token.accessType}
                    </span>

                    {/* Token */}
                    <span className="font-mono text-xs text-slate-500 flex-1 truncate">
                        {token.token}
                    </span>

                    {/* Created date */}
                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">
                        {format(parseISO(token.createdAt), 'MMM d, yyyy')}
                    </span>

                    {/* Revoke */}
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onRevoke(token.token)}
                        loading={revoking === token.token}
                    >
                        Revoke
                    </Button>
                </div>
            ))}
        </div>
    );
}