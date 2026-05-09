import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const ServerDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Server Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Console</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 p-4 rounded text-sm text-slate-300 overflow-auto h-96">
            Server console output will appear here...
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerDetailPage;
