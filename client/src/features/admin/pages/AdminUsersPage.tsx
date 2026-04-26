import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import type { User } from '../../auth/types/User';
import Badge from '../../ui/components/Badge';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import EmptyState from '../../ui/components/EmptyState';
import Modal from '../../ui/components/Modal';
import Spinner from '../../ui/components/Spinner';
import PageHeader from '../../ui/layout/PageHeader';
import { adminApi } from '../api/admin.api';
import CreateUserForm from '../components/CreateUserForm';


export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        adminApi
            .getAllUsers()
            .then(setUsers)
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget)
            return;

        setDeleting(true);

        try {
            await adminApi.deleteUser(deleteTarget);
            setUsers(prev => prev.filter(u => u.id !== deleteTarget));
            toast.success('User deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <PageHeader
                title="User Management"
                subtitle={`${users.length} registered users`}
                actions={<Button onClick={() => setModalOpen(true)}>+ Add User</Button>}
            />

            {users.length === 0 ? (
                <EmptyState icon="👥" title="No users found" />
            ) : (
                <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-navy-700 bg-navy-800">
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Name</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Email</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Role</th>
                                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => {
                                const isSelf = user.id === currentUser?.id;
                                return (
                                    <tr
                                        key={user.id}
                                        className={`border-b border-navy-800 hover:bg-navy-800/50 transition-colors ${idx === users.length - 1 ? 'border-b-0' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-semibold flex-shrink-0">
                                                    {user.name[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{user.name}</span>
                                                {isSelf && (
                                                    <span className="text-xs bg-navy-700 text-slate-400 px-2 py-0.5 rounded-full">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                label={user.role}
                                                color={user.role === 'Admin' ? 'teal' : 'slate'}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                disabled={isSelf}
                                                onClick={() => setDeleteTarget(user.id)}
                                                title={isSelf ? 'You cannot delete your own account' : undefined}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add User Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create User" size="sm">
                <CreateUserForm
                    onSuccess={user => {
                        setUsers(prev => [...prev, user]);
                        setModalOpen(false);
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Delete user?"
                message="This will permanently remove the user account."
            />
        </div>
    );
}