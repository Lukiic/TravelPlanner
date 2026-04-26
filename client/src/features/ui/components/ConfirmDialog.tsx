import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen, onClose, onConfirm, loading,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
            </div>
        </Modal>
    );
}
