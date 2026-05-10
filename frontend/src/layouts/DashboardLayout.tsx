import React, { useState } from 'react';
import { Menu, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-900">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
                <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>

                        <h1 className="text-xl font-bold text-white">Minecraft Panel</h1>

                        <div className="flex items-center gap-4">
                            <span className="text-slate-300 text-sm">{user?.email}</span>
                            <button
                                onClick={() => navigate('/settings')}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
