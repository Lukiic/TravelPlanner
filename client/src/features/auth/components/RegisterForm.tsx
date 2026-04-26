import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../api/auth.api';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
}

export default function RegisterForm() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        const e: FormErrors = {};

        if (!name.trim())
            e.name = 'Name is required';

        if (!email)
            e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email))
            e.email = 'Enter a valid email address';

        if (!password)
            e.password = 'Password is required';
        else if (password.length < 6)
            e.password = 'Password must be at least 6 characters';

        if (!confirm)
            e.confirm = 'Please confirm your password';
        else if (confirm !== password)
            e.confirm = 'Passwords do not match';

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate())
            return;

        setLoading(true);

        try {
            const { token, user } = await authApi.register({ name: name.trim(), email, password });
            login(token, user);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                error={errors.name}
                placeholder="Jane Smith"
                autoComplete="name"
            />
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
            />
            <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                error={errors.confirm}
                placeholder="Repeat password"
                autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full justify-center">
                Create Account
            </Button>
            <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
                    Sign in
                </Link>
            </p>
        </form>
    );
}