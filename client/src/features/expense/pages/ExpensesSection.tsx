import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../ui/components/Button';
import ConfirmDialog from '../../ui/components/ConfirmDialog';
import Modal from '../../ui/components/Modal';
import Spinner from '../../ui/components/Spinner';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import type { BudgetSummary } from '../types/BudgetSummary';
import type { CreateExpenseRequest } from '../types/CreateExpenseRequest';
import type { Expense } from '../types/Expense';
import BudgetSummaryCard from '../components/BudgetSummaryCard';
import type { IExpenseApi } from '../api/IExpenseApi';


interface ExpensesSectionProps {
    planId: string;
    readOnly?: boolean;
    expenseApi: IExpenseApi;
}

export default function ExpensesSection({ planId, readOnly = false, expenseApi }: ExpensesSectionProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchAll = async () => {
        try {
            const [expensesData, summaryData] = await Promise.all([
                expenseApi.getAll(planId),
                expenseApi.getBudgetSummary(planId),
            ]);
            setExpenses(expensesData);
            setSummary(summaryData);
        } catch {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [planId]);

    const openAdd = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (expense: Expense) => { setEditing(expense); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSubmit = async (data: CreateExpenseRequest) => {
        setSaving(true);
        try {
            if (editing) {
                const updated = await expenseApi.update(planId, editing.id, data);
                setExpenses(prev => prev.map(e => (e.id === editing.id ? updated : e)));
                toast.success('Expense updated!');
            } else {
                const created = await expenseApi.create(planId, data);
                setExpenses(prev => [...prev, created]);
                toast.success('Expense added!');
            }
            // Refresh budget summary
            const newSummary = await expenseApi.getBudgetSummary(planId);
            setSummary(newSummary);
            closeModal();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await expenseApi.delete(planId, deleteTarget);
            setExpenses(prev => prev.filter(e => e.id !== deleteTarget));
            const newSummary = await expenseApi.getBudgetSummary(planId);
            setSummary(newSummary);
            toast.success('Expense removed');
        } catch {
            toast.error('Failed to delete expense');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            {summary && <BudgetSummaryCard summary={summary} />}

            {!readOnly && (
                <div className="flex justify-end mb-5">
                    <Button onClick={openAdd}>+ Add Expense</Button>
                </div>
            )}

            <ExpenseTable
                expenses={expenses}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                readOnly={readOnly}
            />

            {!readOnly && (
                <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Expense' : 'Add Expense'} size="md">
                    <ExpenseForm
                        initialValues={editing ?? undefined}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        loading={saving}
                    />
                </Modal>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Remove expense?"
                message="This expense will be permanently deleted."
            />
        </div>
    );
}