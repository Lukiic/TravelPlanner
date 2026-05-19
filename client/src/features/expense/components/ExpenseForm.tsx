import { useState, useEffect } from 'react';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';
import type { CreateExpenseRequest } from '../types/CreateExpenseRequest';
import type { Expense } from '../types/Expense';
import type { ExpenseCategory } from '../types/ExpenseCategory';


interface ExpenseFormProps {
    initialValues?: Expense;
    onSubmit: (data: CreateExpenseRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface FormErrors {
    name?: string;
    amount?: string;
    date?: string;
}

const CATEGORIES: ExpenseCategory[] = ['Transport', 'Accommodation', 'Food', 'Tickets', 'Shopping', 'Other', 'Activities'];

const empty: CreateExpenseRequest = {
    name: '',
    category: 'Other',
    amount: 0,
    date: '',
    description: '',
};

export default function ExpenseForm({
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
}: ExpenseFormProps) {
    const [values, setValues] = useState<CreateExpenseRequest>({
        ...empty,
        ...(initialValues
            ? {
                name: initialValues.name,
                category: initialValues.category,
                amount: initialValues.amount,
                date: initialValues.date.slice(0, 10),
                description: initialValues.description,
            }
            : {}),
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (initialValues) {
            setValues({
                name: initialValues.name,
                category: initialValues.category,
                amount: initialValues.amount,
                date: initialValues.date.slice(0, 10),
                description: initialValues.description,
            });
        }
    }, [initialValues]);

    const set =
        (field: keyof CreateExpenseRequest) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                setValues(v => ({ ...v, [field]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!values.name.trim())
            e.name = 'Name is required';

        if (!values.amount || Number(values.amount) <= 0)
            e.amount = 'Amount must be greater than 0';

        if (!values.date)
            e.date = 'Date is required';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate())
            return;

        await onSubmit({ ...values, amount: Number(values.amount) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Expense Name"
                type="text"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Train tickets"
            />

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Category
                    </label>
                    <div className="relative select-base-wrapper">
                        <select value={values.category} onChange={set('category')} className="select-base w-full">
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Input
                    label="Amount (USD)"
                    type="number"
                    value={values.amount.toString()}
                    onChange={set('amount')}
                    error={errors.amount}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                />
            </div>

            <Input
                label="Date"
                type="date"
                value={values.date}
                onChange={set('date')}
                error={errors.date}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={values.description}
                    onChange={set('description')}
                    rows={2}
                    placeholder="Optional notes..."
                    className="input-base resize-none"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">
                    Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1 justify-center">
                    {initialValues ? 'Save Changes' : 'Add Expense'}
                </Button>
            </div>
        </form>
    );
}