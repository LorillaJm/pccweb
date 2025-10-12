'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PortalLayout } from '@/components/PortalLayout';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info' | 'event' | 'general';
  priority: 'high' | 'medium' | 'low';
  targetAudience: string[];
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'urgent' | 'info' | 'event' | 'general',
    priority: 'medium' as 'high' | 'medium' | 'low',
    targetAudience: [] as string[],
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const { api } = await import('@/lib/api');
      const response = await api.get('/admin/announcements');
      const fetchedAnnouncements = response.data.data.announcements || [];
      // Ensure all announcements have required fields with defaults
      const normalizedAnnouncements = fetchedAnnouncements.map((ann: any) => ({
        ...ann,
        type: ann.type || 'general',
        priority: ann.priority || 'medium',
        targetAudience: ann.targetAudience || [],
        isActive: ann.isActive !== undefined ? ann.isActive : true,
        createdBy: ann.createdBy || { firstName: 'Unknown', lastName: 'User' }
      }));
      setAnnouncements(normalizedAnnouncements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { api } = await import('@/lib/api');
      
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, formData);
      } else {
        await api.post('/admin/announcements', formData);
      }
      
      await fetchAnnouncements();
      resetForm();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const { api } = await import('@/lib/api');
      await api.delete(`/admin/announcements/${id}`);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { api } = await import('@/lib/api');
      await api.put(`/admin/announcements/${id}`, { isActive: !currentStatus });
      await fetchAnnouncements();
    } catch (error) {
      console.error('Failed to toggle announcement status:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement._id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      isActive: announcement.isActive,
      startDate: announcement.startDate.split('T')[0],
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetAudience: [],
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || announcement.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <ProtectedRoute requiredRole="admin">
      <PortalLayout title="Announcements Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Announcements Management</h1>
                <p className="text-blue-100">Create and manage campus-wide announcements</p>
              </div>
              <Bell className="h-16 w-16 opacity-20" />
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="urgent">Urgent</option>
                  <option value="info">Info</option>
                  <option value="event">Event</option>
                  <option value="general">General</option>
                </select>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                New Announcement
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">
                {editingId ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter announcement content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="urgent">Urgent</option>
                      <option value="info">Information</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'} Announcement
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading announcements...</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first announcement to get started'}
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Announcement
                  </button>
                )}
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(announcement.priority || 'medium')}`}></div>
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(announcement.type || 'general')}`}>
                          {(announcement.type || 'general').toUpperCase()}
                        </span>
                        {announcement.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(announcement.startDate).toLocaleDateString()}
                          {announcement.endDate && ` - ${new Date(announcement.endDate).toLocaleDateString()}`}
                        </div>
                        <div>
                          By {announcement.createdBy.firstName} {announcement.createdBy.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(announcement._id, announcement.isActive)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PortalLayout>
    </ProtectedRoute>
  );
}
