import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div className="p-8">
            {/* Sub-navigation */}
            <div className="flex gap-2 mb-8 border-b border-navy-800 pb-4">
                {[
                    { to: '/admin/users', label: '👥 Users' },
                    { to: '/admin/plans', label: '📋 All Plans' },
                ].map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-navy-800 text-white' : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <Outlet />
        </div>
    );
}