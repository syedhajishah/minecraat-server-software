import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Play, Square } from 'lucide-react';
import { useServerStore } from '@/store/serverStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

const ServersPage: React.FC = () => {
  const { servers, fetchServers, startServer, stopServer, deleteServer } = useServerStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    port: 25565,
  });

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleCreateServer = async () => {
    // Implement server creation
    setShowCreateModal(false);
  };

  const handleStart = async (id: string) => {
    setLoading(true);
    try {
      await startServer(id);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (id: string) => {
    setLoading(true);
    try {
      await stopServer(id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      setLoading(true);
      try {
        await deleteServer(id);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Servers</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} className="mr-2" />
          Create Server
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {servers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-400 mb-4">No servers yet.</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Server
              </Button>
            </CardContent>
          </Card>
        ) : (
          servers.map((server) => (
            <Card key={server.id}>
              <div className="flex items-center justify-between p-6">
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/servers/${server.id}`)}>
                  <h3 className="text-lg font-bold text-white hover:text-blue-400">
                    {server.name}
                  </h3>
                  <p className="text-sm text-slate-400">Port {server.port}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <Badge
                      variant={
                        server.status === 'RUNNING'
                          ? 'success'
                          : server.status === 'CRASHED'
                          ? 'danger'
                          : 'gray'
                      }
                    >
                      {server.status}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {server.status !== 'RUNNING' ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStart(server.id)}
                        isLoading={loading}
                      >
                        <Play size={16} />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStop(server.id)}
                        isLoading={loading}
                      >
                        <Square size={16} />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(server.id)}
                      isLoading={loading}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        title="Create Server"
        onClose={() => setShowCreateModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Server Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Server"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Port</label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25565"
            />
          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={handleCreateServer}
            isLoading={loading}
          >
            Create Server
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ServersPage;
