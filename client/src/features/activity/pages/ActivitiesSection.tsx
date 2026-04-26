import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Modal from '../../ui/components/Modal';
import Spinner from '../../ui/components/Spinner';
import { activityApi } from '../api/activity.api';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import type { Activity } from '../types/Activity';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';
import ActivityCalendar from '../components/ActivityCalendar';


type View = 'list' | 'calendar';

interface ActivitiesSectionProps {
    planId: string;
    readOnly?: boolean;
    onActivityUpdate?: (id: string, data: Partial<CreateActivityRequest>) => Promise<Activity>;
    travelPlanStartDate?: string;
    travelPlanEndDate?: string;
}

export default function ActivitiesSection({
    planId,
    readOnly = false,
    onActivityUpdate,
    travelPlanStartDate,
    travelPlanEndDate
}: ActivitiesSectionProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('list');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Activity | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        activityApi
            .getAll(planId)
            .then(setActivities)
            .catch(() => toast.error('Failed to load activities'))
            .finally(() => setLoading(false));
    }, [planId]);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (activity: Activity) => {
        setEditing(activity);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleSubmit = async (data: CreateActivityRequest) => {
        setSaving(true);
        try {
            if (editing) {
                let updated: Activity;
                if (onActivityUpdate) {
                    updated = await onActivityUpdate(editing.id, data);
                } else {
                    updated = await activityApi.update(planId, editing.id, data);
                }
                setActivities(prev => prev.map(a => (a.id === editing.id ? updated : a)));
                toast.success('Activity updated!');
            } else {
                const created = await activityApi.create(planId, data);
                setActivities(prev => [...prev, created]);
                toast.success('Activity added!');
            }
            closeModal();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save activity');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await activityApi.delete(planId, deleteTarget);
            setActivities(prev => prev.filter(a => a.id !== deleteTarget));
            toast.success('Activity removed');
        } catch {
            toast.error('Failed to delete activity');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
                {/* View toggle */}
                <div className="flex items-center bg-navy-800 rounded-lg p-1 gap-1">
                    {(['list', 'calendar'] as View[]).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${view === v
                                ? 'bg-navy-700 text-white'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {v === 'list' ? '☰ List' : '📅 Calendar'}
                        </button>
                    ))}
                </div>

                {!readOnly && (
                    <Button onClick={openAdd}>+ Add Activity</Button>
                )}
            </div>

            {/* Content */}
            {view === 'list' ? (
                <ActivityList
                    activities={activities}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    readOnly={readOnly}
                />
            ) : (
                <ActivityCalendar
                    activities={activities}
                    onSelectActivity={readOnly ? () => { } : openEdit}
                    onAddActivity={readOnly ? () => { } : openAdd}
                />
            )}

            {/* Modal */}
            {!readOnly && (
                <Modal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    title={editing ? 'Edit Activity' : 'Add Activity'}
                    size="md"
                >
                    <ActivityForm
                        initialValues={editing ?? undefined}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        loading={saving}
                        travelPlanStartDate={travelPlanStartDate}
                        travelPlanEndDate={travelPlanEndDate}
                    />
                </Modal>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Remove activity?"
                message="This activity will be permanently deleted."
            />
        </div>
    );
}