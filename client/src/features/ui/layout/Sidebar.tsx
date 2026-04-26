import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const navItems = [
    { to: '/', label: 'Dashboard', icon: '🧭' },
    { to: '/plans/new', label: 'New Plan', icon: '✈️' },
];

const adminItems = [
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/plans', label: 'All Plans', icon: '📋' },
];

export default function Sidebar() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 min-h-screen bg-navy-900 border-r border-navy-800 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-navy-800">
                <span className="font-display text-xl font-bold text-white">
                    Travel<span className="text-teal-500">Planner</span>
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 pl-[10px]'
                                : 'text-slate-400 hover:bg-navy-800 hover:text-white'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2 px-3">
                            <span className="text-xs uppercase tracking-wider text-slate-600 font-medium">Admin</span>
                        </div>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 pl-[10px]'
                                        : 'text-slate-400 hover:bg-navy-800 hover:text-white'
                                    }`
                                }
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-navy-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-semibold">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}