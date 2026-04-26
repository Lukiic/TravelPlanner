import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-navy-950">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}