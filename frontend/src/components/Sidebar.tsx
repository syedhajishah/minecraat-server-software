import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Server,
    FileText,
    Settings,
    X,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/servers', label: 'Servers', icon: Server },
        { href: '/files', label: 'Files', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (href: string) => location.pathname === href;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
                    onClick={onClose}
                />
            )}

            <aside
                className={clsx(
                    'fixed lg:static w-64 h-screen bg-slate-800 border-r border-slate-700 transition-transform',
                    isOpen ? 'translate-x-0 z-40' : '-translate-x-full lg:translate-x-0',
                )}
            >
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">MCPanel</h1>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-6 space-y-2">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <button
                            key={href}
                            onClick={() => {
                                navigate(href);
                                onClose();
                            }}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                                isActive(href)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700',
                            )}
                        >
                            <Icon size={20} />
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
