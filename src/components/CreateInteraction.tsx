import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { api } from '../services/api';
import { toast } from '../components/ui/Toast';

const CreateInteraction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    reason: '',
    direction: 'inbound',
    priority: 'medium',
    status: 'opened',
    interactionDate: {
      startDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: ''
    },
    relatedParty: [
      {
        role: 'customer',
        partyOrPartyRole: {
          id: '',
          name: '',
          referredType: 'Individual'
        }
      }
    ],
    relatedChannel: [
      {
        role: 'primary',
        channel: {
          id: '1',
          name: 'phone'
        }
      }
    ],
    interactionItem: [],
    note: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.relatedParty[0].partyOrPartyRole.name.trim()) {
      toast.error('Please provide customer information');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/partyInteraction', formData);
      toast.success('Interaction created successfully');
      navigate(`/interactions/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating interaction:', error);
      toast.error(error.response?.data?.error || 'Failed to create interaction');
    } finally {
      setLoading(false);
    }
  };

  const addInteractionItem = () => {
    setFormData(prev => ({
      ...prev,
      interactionItem: [
        ...prev.interactionItem,
        {
          reason: '',
          resolution: '',
          status: 'pending',
          itemDate: {
            startDateTime: new Date().toISOString().slice(0, 16)
          }
        }
      ]
    }));
  };

  const removeInteractionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interactionItem: prev.interactionItem.filter((_, i) => i !== index)
    }));
  };

  const updateInteractionItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      interactionItem: prev.interactionItem.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      note: [
        ...prev.note,
        {
          text: '',
          author: ''
        }
      ]
    }));
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      note: prev.note.filter((_, i) => i !== index)
    }));
  };

  const updateNote = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      note: prev.note.map((note, i) => 
        i === index ? { ...note, [field]: value } : note
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/interactions')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Interaction</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the interaction"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Detailed reason for the interaction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.direction}
                onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}
              >
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.interactionDate.startDateTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  interactionDate: { ...prev.interactionDate, startDateTime: e.target.value }
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.interactionDate.endDateTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  interactionDate: { ...prev.interactionDate, endDateTime: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.relatedParty[0].partyOrPartyRole.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  relatedParty: [{
                    ...prev.relatedParty[0],
                    partyOrPartyRole: {
                      ...prev.relatedParty[0].partyOrPartyRole,
                      name: e.target.value
                    }
                  }]
                }))}
                placeholder="Customer full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.relatedParty[0].partyOrPartyRole.id}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  relatedParty: [{
                    ...prev.relatedParty[0],
                    partyOrPartyRole: {
                      ...prev.relatedParty[0].partyOrPartyRole,
                      id: e.target.value
                    }
                  }]
                }))}
                placeholder="Customer ID or reference"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.relatedParty[0].partyOrPartyRole.referredType}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  relatedParty: [{
                    ...prev.relatedParty[0],
                    partyOrPartyRole: {
                      ...prev.relatedParty[0].partyOrPartyRole,
                      referredType: e.target.value
                    }
                  }]
                }))}
              >
                <option value="Individual">Individual</option>
                <option value="Organization">Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.relatedChannel[0].channel.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  relatedChannel: [{
                    ...prev.relatedChannel[0],
                    channel: {
                      ...prev.relatedChannel[0].channel,
                      name: e.target.value
                    }
                  }]
                }))}
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="chat">Chat</option>
                <option value="store">Store</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interaction Items */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Interaction Items</h2>
            <button
              type="button"
              onClick={addInteractionItem}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          {formData.interactionItem.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No interaction items added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.interactionItem.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeInteractionItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={item.reason}
                        onChange={(e) => updateInteractionItem(index, 'reason', e.target.value)}
                        placeholder="Reason for this item"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={item.status}
                        onChange={(e) => updateInteractionItem(index, 'status', e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        value={item.resolution}
                        onChange={(e) => updateInteractionItem(index, 'resolution', e.target.value)}
                        placeholder="Resolution details (if applicable)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Initial Notes</h2>
            <button
              type="button"
              onClick={addNote}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
          </div>

          {formData.note.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notes added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.note.map((note, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Note {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeNote(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={note.author}
                        onChange={(e) => updateNote(index, 'author', e.target.value)}
                        placeholder="Note author"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note Text
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        value={note.text}
                        onChange={(e) => updateNote(index, 'text', e.target.value)}
                        placeholder="Note content"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/interactions')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Creating...' : 'Create Interaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInteraction;