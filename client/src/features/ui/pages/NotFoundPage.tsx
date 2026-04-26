import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-center p-4">
            <span className="font-mono text-8xl font-bold text-navy-800 mb-4">404</span>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Page not found</h1>
            <p className="text-slate-400 mb-8">That destination doesn't exist on our map.</p>
            <Link to="/login" className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-medium transition-colors">
                Go home
            </Link>
        </div>
    );
}