import { useState, useEffect } from 'react';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';
import type { CreateTravelPlanRequest } from '../types/CreateTravelPlanRequest';

interface PlanFormProps {
    initialValues?: Partial<CreateTravelPlanRequest>;
    onSubmit: (data: CreateTravelPlanRequest) => Promise<void>;
    loading?: boolean;
    submitLabel?: string;
}

interface FormErrors {
    name?: string;
    startDate?: string;
    endDate?: string;
    budget?: string;
}

const empty: CreateTravelPlanRequest = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    notes: '',
};

export default function PlanForm({
    initialValues,
    onSubmit,
    loading = false,
    submitLabel = 'Save Plan',
}: PlanFormProps) {
    const [values, setValues] = useState<CreateTravelPlanRequest>({ ...empty, ...initialValues });
    const [errors, setErrors] = useState<FormErrors>({});

    // Sync when initialValues load (edit page async fetch)
    useEffect(() => {
        if (initialValues)
            setValues(v => ({ ...v, ...initialValues }));
    }, [initialValues]);

    const set = (field: keyof CreateTravelPlanRequest) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues(v => ({ ...v, [field]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!values.name.trim())
            e.name = 'Name is required';

        if (!values.startDate)
            e.startDate = 'Start date is required';

        if (!values.endDate)
            e.endDate = 'End date is required';
        else if (values.startDate && values.endDate < values.startDate)
            e.endDate = 'End date must be on or after start date';

        if (values.budget < 0)
            e.budget = 'Budget cannot be negative';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate())
            return;

        await onSubmit({ ...values, budget: Number(values.budget) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Plan Name"
                type="text"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Summer Europe Trip"
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={values.description}
                    onChange={set('description')}
                    rows={3}
                    placeholder="Briefly describe your trip..."
                    className="input-base resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Start Date"
                    type="date"
                    value={values.startDate}
                    onChange={set('startDate')}
                    error={errors.startDate}
                />
                <Input
                    label="End Date"
                    type="date"
                    value={values.endDate}
                    onChange={set('endDate')}
                    error={errors.endDate}
                    min={values.startDate || undefined}
                />
            </div>

            <Input
                label="Budget (USD)"
                type="number"
                value={values.budget.toString()}
                onChange={set('budget')}
                error={errors.budget}
                placeholder="0"
                min="0"
                step="1"
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Notes
                </label>
                <textarea
                    value={values.notes}
                    onChange={set('notes')}
                    rows={4}
                    placeholder="Packing list, reminders, ideas..."
                    className="input-base resize-none"
                />
            </div>

            <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}