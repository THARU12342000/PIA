import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Phone, Mail, MessageSquare, 
  Clock, AlertCircle, CheckCircle, FileText, Plus 
} from 'lucide-react';
import { api } from '../services/api';
import { toast } from '../components/ui/Toast';

interface Interaction {
  id: string;
  description: string;
  reason: string;
  status: string;
  direction: string;
  priority: string;
  interactionDate: {
    startDateTime: string;
    endDateTime?: string;
  };
  relatedParty: Array<{
    role: string;
    partyOrPartyRole: {
      id: string;
      name: string;
      referredType: string;
    };
  }>;
  relatedChannel: Array<{
    channel: {
      name: string;
    };
  }>;
  interactionItem: Array<{
    id: string;
    reason: string;
    resolution?: string;
    status: string;
    itemDate: {
      startDateTime: string;
      endDateTime?: string;
    };
  }>;
  note: Array<{
    id: string;
    text: string;
    author: string;
    date: string;
  }>;
  attachment: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
  }>;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

const InteractionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState({ text: '', author: '' });
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInteraction();
    }
  }, [id]);

  const fetchInteraction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/partyInteraction/${id}`);
      setInteraction(response.data);
    } catch (error) {
      console.error('Error fetching interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.text.trim() || !newNote.author.trim()) return;

    try {
      setAddingNote(true);
      await api.post(`/partyInteraction/${id}/notes`, newNote);
      setNewNote({ text: '', author: '' });
      fetchInteraction(); // Refresh to get the new note
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) return;
    try {
      await api.delete(`/partyInteraction/${id}`);
      toast.success('Interaction deleted successfully');
      navigate('/interactions');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete interaction');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opened': return 'bg-red-100 text-red-800';
      case 'inProgress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!interaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Interaction not found</p>
        <Link to="/interactions" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Back to Interactions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/interactions"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{interaction.description}</h1>
          <p className="text-gray-600 mt-1">{interaction.reason}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interaction.status)}`}>
            {interaction.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(interaction.priority)}`}>
            {interaction.priority}
          </span>
          <button
            className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
            onClick={() => navigate(`/interactions/${interaction.id}/edit`)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(interaction.interactionDate.startDateTime).toLocaleString()}</p>
                </div>
              </div>
              
              {interaction.interactionDate.endDateTime && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{new Date(interaction.interactionDate.endDateTime).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full ${
                  interaction.direction === 'inbound' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-500">Direction</p>
                  <p className="font-medium capitalize">{interaction.direction}</p>
                </div>
              </div>

              {interaction.duration && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{interaction.duration} minutes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interaction Items */}
          {interaction.interactionItem.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Interaction Items</h2>
              <div className="space-y-4">
                {interaction.interactionItem.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.reason}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    {item.resolution && (
                      <p className="text-gray-600 mb-2">{item.resolution}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(item.itemDate.startDateTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newNote.author}
                  onChange={(e) => setNewNote(prev => ({ ...prev, author: e.target.value }))}
                />
                <textarea
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={newNote.text}
                  onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))}
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.text.trim() || !newNote.author.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addingNote ? 'Adding...' : 'Add Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-4">
              {interaction.note.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              ) : (
                interaction.note.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{note.author}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(note.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Parties */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Parties</h3>
            <div className="space-y-3">
              {interaction.relatedParty.map((party, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{party.partyOrPartyRole.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{party.role} • {party.partyOrPartyRole.referredType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          {interaction.relatedChannel.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Channels</h3>
              <div className="space-y-3">
                {interaction.relatedChannel.map((channel, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getChannelIcon(channel.channel.name)}
                    <span className="font-medium text-gray-900 capitalize">{channel.channel.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {interaction.attachment.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-3">
                {interaction.attachment.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">{attachment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">{new Date(interaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(interaction.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Interaction ID</p>
                <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{interaction.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionDetail;