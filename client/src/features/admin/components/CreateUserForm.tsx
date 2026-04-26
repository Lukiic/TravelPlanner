import { useState } from 'react';
import { toast } from 'react-toastify';
import type { User } from '../../auth/types/User';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { IAdminApi } from '../api/IAdminApi';

interface CreateUserFormProps {
    onSuccess: (user: User) => void;
    onCancel: () => void;
    adminApi: IAdminApi;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
}

export default function CreateUserForm({ onSuccess, onCancel, adminApi }: CreateUserFormProps) {
    const [values, setValues] = useState<CreateUserRequest>({
        name: '',
        email: '',
        password: '',
        role: 'User',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const set =
        (field: keyof CreateUserRequest) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setValues(v => ({ ...v, [field]: e.target.value }));

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!values.name.trim())
            e.name = 'Name is required';

        if (!values.email)
            e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(values.email))
            e.email = 'Enter a valid email';

        if (!values.password)
            e.password = 'Password is required';
        else if (values.password.length < 6)
            e.password = 'Minimum 6 characters';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate())
            return;

        setLoading(true);

        try {
            const user = await adminApi.createUser(values);
            toast.success('User created!');
            onSuccess(user);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" value={values.name} onChange={set('name')} error={errors.name} placeholder="Jane Smith" />
            <Input label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} placeholder="jane@example.com" />
            <Input label="Password" type="password" value={values.password} onChange={set('password')} error={errors.password} placeholder="Min. 6 characters" />

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Role</label>
                <div className="relative select-base-wrapper">
                    <select value={values.role} onChange={set('role')} className="select-base w-full">
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 justify-center">Cancel</Button>
                <Button type="submit" loading={loading} className="flex-1 justify-center">Create User</Button>
            </div>
        </form>
    );
}