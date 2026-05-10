import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useServerStore } from '@/store/serverStore';
import { Server, Cpu, HardDrive, Users } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { servers, fetchServers } = useServerStore();
    const [cpuData, setCpuData] = useState<any[]>([]);
    const [ramData, setRamData] = useState<any[]>([]);

    useEffect(() => {
        fetchServers();

        // Generate mock data for charts
        const mockCpuData = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: Math.floor(Math.random() * 80) + 10,
        }));
        const mockRamData = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: Math.floor(Math.random() * 60) + 20,
        }));

        setCpuData(mockCpuData);
        setRamData(mockRamData);
    }, [fetchServers]);

    const runningServers = servers.filter((s) => s.status === 'RUNNING').length;
    const totalPlayers = servers.reduce((sum, s) => sum + (s.playerCount || 0), 0);
    const totalDisk = '2.5 TB';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Server size={28} />}
                    label="Running Servers"
                    value={runningServers}
                    trend={{ value: 0, direction: 'up' }}
                />
                <StatCard
                    icon={<Users size={28} />}
                    label="Online Players"
                    value={totalPlayers}
                    trend={{ value: 5, direction: 'up' }}
                />
                <StatCard
                    icon={<Cpu size={28} />}
                    label="Avg CPU Usage"
                    value="34%"
                    trend={{ value: 2, direction: 'down' }}
                />
                <StatCard
                    icon={<HardDrive size={28} />}
                    label="Disk Usage"
                    value={totalDisk}
                    trend={{ value: 3, direction: 'up' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>CPU Usage (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={cpuData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>RAM Usage (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ramData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="value" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Server List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {servers.length === 0 ? (
                            <p className="text-slate-400">No servers created yet.</p>
                        ) : (
                            servers.map((server) => (
                                <div
                                    key={server.id}
                                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-white">{server.name}</p>
                                        <p className="text-xs text-slate-400">Port {server.port}</p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${server.status === 'RUNNING'
                                                    ? 'bg-green-900 text-green-200'
                                                    : 'bg-red-900 text-red-200'
                                                }`}
                                        >
                                            {server.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;
