import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Modal from '../../ui/components/Modal';
import Spinner from '../../ui/components/Spinner';
import { destinationApi } from '../api/destination.api';
import type { CreateDestinationRequest } from '../types/CreateDestinationRequest';
import type { Destination } from '../types/Destination';
import DestinationForm from '../components/DestinationForm';
import DestinationList from '../components/DestinationList';


interface DestinationsSectionProps {
    planId: string;
    readOnly?: boolean;
}

export default function DestinationsSection({ planId, readOnly = false }: DestinationsSectionProps) {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Destination | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        destinationApi
            .getAll(planId)
            .then(setDestinations)
            .catch(() => toast.error('Failed to load destinations'))
            .finally(() => setLoading(false));
    }, [planId]);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (destination: Destination) => {
        setEditing(destination);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const handleSubmit = async (data: CreateDestinationRequest) => {
        setSaving(true);
        try {
            if (editing) {
                const updated = await destinationApi.update(planId, editing.id, data);
                setDestinations(prev => prev.map(d => (d.id === editing.id ? updated : d)));
                toast.success('Destination updated!');
            } else {
                const created = await destinationApi.create(planId, data);
                setDestinations(prev => [...prev, created]);
                toast.success('Destination added!');
            }
            closeModal();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save destination');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await destinationApi.delete(planId, deleteTarget);
            setDestinations(prev => prev.filter(d => d.id !== deleteTarget));
            toast.success('Destination removed');
        } catch {
            toast.error('Failed to delete destination');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            {/* Header row */}
            {!readOnly && (
                <div className="flex justify-end mb-5">
                    <Button onClick={openAdd}>+ Add Destination</Button>
                </div>
            )}

            <DestinationList
                destinations={destinations}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                readOnly={readOnly}
            />

            {/* Add / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Destination' : 'Add Destination'}
                size="md"
            >
                <DestinationForm
                    initialValues={editing ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    loading={saving}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Remove destination?"
                message="This destination will be permanently removed from the plan."
            />
        </div>
    );
}