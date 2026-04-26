import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../api/auth.api';
import Button from '../../ui/components/Button';
import Input from '../../ui/components/Input';

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};

        if (!email)
            e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email))
            e.email = 'Enter a valid email';

        if (!password)
            e.password = 'Password is required';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate())
            return;

        setLoading(true);

        try {
            const { token, user } = await authApi.login({ email, password });
            login(token, user);
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="••••••••" />
            <Button type="submit" loading={loading} className="w-full justify-center">Sign In</Button>
            <p className="text-center text-sm text-slate-500">
                No account?{' '}
                <Link to="/register" className="text-teal-400 hover:text-teal-300">Register</Link>
            </p>
        </form>
    );
}