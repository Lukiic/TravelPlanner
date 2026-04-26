import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Spinner from '../../ui/components/Spinner';
import { sharingApi } from '../api/sharing.api';
import ShareModal from '../components/ShareModal';
import ShareTokenList from '../components/ShareTokenList';
import type { AccessType } from '../types/AccessType';
import type { ShareResponse } from '../types/ShareResponse';
import type { ShareToken } from '../types/ShareToken';


interface ShareSectionProps {
    planId: string;
}

export default function ShareSection({ planId }: ShareSectionProps) {
    const [tokens, setTokens] = useState<ShareToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState<AccessType | null>(null);
    const [shareResult, setShareResult] = useState<ShareResponse | null>(null);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

    useEffect(() => {
        sharingApi
            .getTokens(planId)
            .then(setTokens)
            .catch(() => toast.error('Failed to load share tokens'))
            .finally(() => setLoading(false));
    }, [planId]);

    const handleCreate = async (accessType: AccessType) => {
        setCreating(accessType);
        try {
            const result = await sharingApi.createToken(planId, accessType);
            setShareResult(result);
            // Refresh token list
            const updated = await sharingApi.getTokens(planId);
            setTokens(updated);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create share link');
        } finally {
            setCreating(null);
        }
    };

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        setRevoking(revokeTarget);
        try {
            await sharingApi.revokeToken(revokeTarget);
            setTokens(prev => prev.filter(t => t.token !== revokeTarget));
            toast.success('Link revoked');
        } catch {
            toast.error('Failed to revoke link');
        } finally {
            setRevoking(null);
            setRevokeTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            {/* Create buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 bg-navy-900 border border-navy-700 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-display font-semibold text-white mb-1">View link</h3>
                            <p className="text-slate-400 text-sm">Recipients can view all plan details but cannot make changes.</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCreate('VIEW')}
                            loading={creating === 'VIEW'}
                            className="flex-shrink-0"
                        >
                            Create
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-navy-900 border border-teal-700/50 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-display font-semibold text-white mb-1">Edit link</h3>
                            <p className="text-slate-400 text-sm">Recipients can add, edit and delete activities.</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleCreate('EDIT')}
                            loading={creating === 'EDIT'}
                            className="flex-shrink-0"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </div>

            {/* Active tokens */}
            <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
                    Active links ({tokens.length})
                </h3>
                <ShareTokenList
                    tokens={tokens}
                    onRevoke={setRevokeTarget}
                    revoking={revoking}
                />
            </div>

            {/* Share result modal */}
            {shareResult && (
                <ShareModal
                    isOpen={!!shareResult}
                    onClose={() => setShareResult(null)}
                    result={shareResult}
                    planId={planId}
                />
            )}

            {/* Revoke confirm */}
            <ConfirmDialog
                isOpen={!!revokeTarget}
                onClose={() => setRevokeTarget(null)}
                onConfirm={handleRevoke}
                loading={!!revoking}
                title="Revoke share link?"
                message="Anyone using this link will immediately lose access."
            />
        </div>
    );
}