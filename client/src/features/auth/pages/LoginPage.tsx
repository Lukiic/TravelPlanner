import LoginForm from "../components/LoginForm";
import type { AuthProps } from "../types/AuthProps";

export default function LoginPage({ authApi }: AuthProps) {
    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-bold text-white">
                        Travel<span className="text-teal-500">Planner</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Plan your next adventure</p>
                </div>
                {/* Card */}
                <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 shadow-card">
                    <h2 className="font-display text-xl font-semibold text-white mb-6">Welcome back</h2>
                    <LoginForm authApi={authApi} />
                </div>
            </div>
        </div>
    );
}