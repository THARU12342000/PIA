import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, CheckCircle, AlertCircle, Phone, Mail, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

interface Stats {
  summary: {
    total: number;
    opened: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    inbound: number;
    outbound: number;
  };
  channelBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/partyInteraction/stats/summary');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'chat': return <MessageSquare className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          TMF683 Party Interaction API
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.summary.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.summary.inProgress || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats?.summary.completed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Issues</p>
              <p className="text-3xl font-bold text-red-600">{stats?.summary.opened || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Opened', value: stats?.summary.opened || 0, color: 'bg-red-500' },
              { label: 'In Progress', value: stats?.summary.inProgress || 0, color: 'bg-orange-500' },
              { label: 'Completed', value: stats?.summary.completed || 0, color: 'bg-green-500' },
              { label: 'Cancelled', value: stats?.summary.cancelled || 0, color: 'bg-gray-500' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Breakdown</h3>
          <div className="space-y-4">
            {stats?.channelBreakdown.map((channel) => (
              <div key={channel._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-500">
                    {getChannelIcon(channel._id)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {channel._id || 'Unknown'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{channel.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direction Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Direction</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats?.summary.inbound || 0}</p>
            <p className="text-sm text-blue-700">Inbound</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats?.summary.outbound || 0}</p>
            <p className="text-sm text-purple-700">Outbound</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;