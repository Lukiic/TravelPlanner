import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-bold text-white">
                        Travel<span className="text-teal-500">Planner</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Start planning your adventures</p>
                </div>

                {/* Card */}
                <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-card">
                    <h2 className="font-display text-xl font-semibold text-white mb-6">Create account</h2>
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}