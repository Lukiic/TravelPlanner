import { useState, useEffect } from 'react';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';
import type { CreateDestinationRequest } from '../types/CreateDestinationRequest';
import type { Destination } from '../types/Destination';

interface DestinationFormProps {
    initialValues?: Destination;
    onSubmit: (data: CreateDestinationRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface FormErrors {
    name?: string;
    location?: string;
    arrivalDate?: string;
    departureDate?: string;
}

const empty: CreateDestinationRequest = {
    name: '',
    location: '',
    arrivalDate: '',
    departureDate: '',
    description: '',
};

export default function DestinationForm({
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
}: DestinationFormProps) {
    const [values, setValues] = useState<CreateDestinationRequest>({
        ...empty,
        ...(initialValues
            ? {
                name: initialValues.name,
                location: initialValues.location,
                arrivalDate: initialValues.arrivalDate.slice(0, 10),
                departureDate: initialValues.departureDate.slice(0, 10),
                description: initialValues.description,
            }
            : {}),
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (initialValues) {
            setValues({
                name: initialValues.name,
                location: initialValues.location,
                arrivalDate: initialValues.arrivalDate.slice(0, 10),
                departureDate: initialValues.departureDate.slice(0, 10),
                description: initialValues.description,
            });
        }
    }, [initialValues]);

    const set = (field: keyof CreateDestinationRequest) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues(v => ({ ...v, [field]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!values.name.trim())
            e.name = 'Name is required';

        if (!values.location.trim())
            e.location = 'Location is required';

        if (!values.arrivalDate)
            e.arrivalDate = 'Arrival date is required';

        if (!values.departureDate)
            e.departureDate = 'Departure date is required';
        else if (values.arrivalDate && values.departureDate < values.arrivalDate)
            e.departureDate = 'Departure must be on or after arrival';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate())
            return;

        await onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Destination Name"
                type="text"
                value={values.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="Paris"
            />
            <Input
                label="Location / Country"
                type="text"
                value={values.location}
                onChange={set('location')}
                error={errors.location}
                placeholder="France"
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Arrival Date"
                    type="date"
                    value={values.arrivalDate}
                    onChange={set('arrivalDate')}
                    error={errors.arrivalDate}
                />
                <Input
                    label="Departure Date"
                    type="date"
                    value={values.departureDate}
                    onChange={set('departureDate')}
                    error={errors.departureDate}
                    min={values.arrivalDate || undefined}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    value={values.description}
                    onChange={set('description')}
                    rows={3}
                    placeholder="What are you planning to do here?"
                    className="input-base resize-none"
                />
            </div>
            <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">
                    Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1 justify-center">
                    {initialValues ? 'Save Changes' : 'Add Destination'}
                </Button>
            </div>
        </form>
    );
}