import { useState, useEffect } from 'react';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';
import type { Activity } from '../types/Activity';
import type { ActivityStatus } from '../types/ActivityStatus';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';

interface ActivityFormProps {
    initialValues?: Activity;
    onSubmit: (data: CreateActivityRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface FormErrors {
    name?: string;
    date?: string;
    estimatedCost?: string;
}

const STATUSES: ActivityStatus[] = ['Planned', 'Reserved', 'Completed', 'Cancelled'];

const empty: CreateActivityRequest = {
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    estimatedCost: 0,
    status: 'Planned',
};

export default function ActivityForm({
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
}: ActivityFormProps) {
    const [values, setValues] = useState<CreateActivityRequest>({
        ...empty,
        ...(initialValues
            ? {
                name: initialValues.name,
                date: initialValues.date.slice(0, 10),
                time: initialValues.time ?? '',
                location: initialValues.location,
                description: initialValues.description,
                estimatedCost: initialValues.estimatedCost,
                status: initialValues.status,
            }
            : {}),
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (initialValues) {
            setValues({
                name: initialValues.name,
                date: initialValues.date.slice(0, 10),
                time: initialValues.time ?? '',
                location: initialValues.location,
                description: initialValues.description,
                estimatedCost: initialValues.estimatedCost,
                status: initialValues.status,
            });
        }
    }, [initialValues]);

    const set =
        (field: keyof CreateActivityRequest) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                setValues(v => ({ ...v, [field]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!values.name.trim())
            e.name = 'Name is required';

        if (!values.date)
            e.date = 'Date is required';

        if (values.estimatedCost < 0)
            e.estimatedCost = 'Cost cannot be negative';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit({ ...values, estimatedCost: Number(values.estimatedCost) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Activity Name"
                type="text"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Eiffel Tower visit"
            />

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={set('date')}
                    error={errors.date}
                />
                <Input
                    label="Time (optional)"
                    type="time"
                    value={values.time}
                    onChange={set('time')}
                />
            </div>

            <Input
                label="Location"
                type="text"
                value={values.location}
                onChange={set('location')}
                placeholder="Champ de Mars, Paris"
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

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Estimated Cost (USD)"
                    type="number"
                    value={values.estimatedCost.toString()}
                    onChange={set('estimatedCost')}
                    error={errors.estimatedCost}
                    min="0"
                    step="0.01"
                    placeholder="0"
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                    </label>
                    <div className="relative select-base-wrapper">
                        <select
                            value={values.status}
                            onChange={set('status')}
                            className="select-base w-full"
                        >
                            {STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">
                    Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1 justify-center">
                    {initialValues ? 'Save Changes' : 'Add Activity'}
                </Button>
            </div>
        </form>
    );
}