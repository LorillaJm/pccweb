'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Content {
  _id: string;
  title: string;
  content: string;
  contentType?: string;
  category?: string;
  priority: string;
  targetAudience: string;
  isPublished: boolean;
  eventDate?: string;
  eventLocation?: string;
  featured?: boolean;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateContentData {
  title: string;
  content: string;
  type: string;
  category?: string;
  priority: string;
  targetAudience: string;
  isPublished: boolean;
  eventDate?: string;
  eventLocation?: string;
}

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    type: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchContents();
  }, [filters, pagination.page]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type })
      });

      const response = await api.get(`/admin/announcements?${params}`);
      setContents(response.data.data.announcements);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (contentData: CreateContentData) => {
    try {
      await api.post('/admin/content', contentData);
      setShowCreateModal(false);
      fetchContents();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create content');
    }
  };

  const handleUpdateContent = async (contentId: string, contentData: Partial<Content>) => {
    try {
      await api.put(`/announcements/${contentId}`, contentData);
      setEditingContent(null);
      fetchContents();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update content');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await api.delete(`/announcements/${contentId}`);
      fetchContents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  const CreateContentModal = () => {
    const [formData, setFormData] = useState<CreateContentData>({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'normal',
      targetAudience: 'all',
      isPublished: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setFormError(null);
        await handleCreateContent(formData);
      } catch (err: any) {
        setFormError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl transform transition-all animate-slideUp">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Create New Content</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">

            {formError && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl shadow-md animate-shake">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Content Type</label>
                  <select
                    className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    value={formData.type}
                    onChange={(e) => {
                      if (e.target.value === 'event') {
                        alert('For events with QR ticketing, please use the dedicated Events Management system.\n\nRedirecting you to /admin/events...');
                        window.location.href = '/admin/events';
                        return;
                      }
                      setFormData({ ...formData, type: e.target.value });
                    }}
                  >
                    <option value="announcement">Announcement</option>
                    <option value="news">News</option>
                    <option value="event">Event (Redirects to Events Management)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Priority</label>
                  <select
                    className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Content</label>
                <textarea
                  required
                  rows={6}
                  className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Academic, Sports, General"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Target Audience</label>
                  <select
                    className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              {formData.type === 'event' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Date</label>
                    <input
                      type="datetime-local"
                      className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      value={formData.eventDate || ''}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Location</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      value={formData.eventLocation || ''}
                      onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                      placeholder="e.g., Main Auditorium"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                <input
                  type="checkbox"
                  id="isPublished"
                  className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded-md cursor-pointer transition-all duration-200"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label htmlFor="isPublished" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : 'Create Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-4 pb-6 px-3 md:px-4 lg:px-6">
      <div className="max-w-full mx-auto space-y-4">
        {/* Header with enhanced styling */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border border-white/20">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Content Management
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 ml-8">
              Manage news, events, and announcements
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-200 text-sm w-full md:w-auto justify-center"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium">Create Content</span>
          </button>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-md border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Content Type</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="announcement">Announcements</option>
                <option value="news">News</option>
                <option value="event">Events</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Category</label>
              <input
                type="text"
                placeholder="Search category..."
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Status</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                onClick={fetchContents}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-1.5 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Content Table */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading content...</p>
            </div>
          ) : error ? (
            <div className="m-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Type
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Priority
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                        Author
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Created
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {contents.map((content, index) => (
                      <tr 
                        key={content._id || `content-${index}`} 
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                      >
                        <td className="px-3 py-3">
                          <div className="max-w-xs">
                            <div className="text-xs md:text-sm font-semibold text-gray-900 truncate mb-1">
                              {content.title}
                            </div>
                            <div className="text-xs text-gray-600 truncate hidden md:block">
                              {content.content.substring(0, 60)}...
                            </div>
                            {content.category && (
                              <div className="flex items-center gap-1 mt-1 md:mt-2">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                  {content.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getContentTypeColor(content.contentType || 'announcement')}`}>
                            {content.contentType || 'announcement'}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(content.priority)}`}>
                            {content.priority}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${content.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${content.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="hidden sm:inline">{content.isPublished ? 'Published' : 'Draft'}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {content.authorId?.firstName?.[0]}{content.authorId?.lastName?.[0]}
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {content.authorId?.firstName} {content.authorId?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 hidden lg:table-cell">
                          {new Date(content.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button
                              onClick={() => setEditingContent(content)}
                              className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 font-medium"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="hidden md:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContent(content._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden md:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-bold text-blue-600">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-bold text-blue-600">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                      <span className="font-bold text-blue-600">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm gap-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md">
                        Page {pagination.page} of {pagination.pages}
                      </div>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
        </div>

        {/* Modals */}
        {showCreateModal && <CreateContentModal />}
      </div>
    </div>
  );
}
