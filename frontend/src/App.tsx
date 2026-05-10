import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ServersPage from '@/pages/ServersPage';
import ServerDetailPage from '@/pages/ServerDetailPage';
import FilesPage from '@/pages/FilesPage';
import SettingsPage from '@/pages/SettingsPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated && window.location.pathname !== '/login') {
        return <LoginPage />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <DashboardLayout>
                                <Routes>
                                    <Route path="/" element={<DashboardPage />} />
                                    <Route path="/servers" element={<ServersPage />} />
                                    <Route path="/servers/:id" element={<ServerDetailPage />} />
                                    <Route path="/files" element={<FilesPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                </Routes>
                            </DashboardLayout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
