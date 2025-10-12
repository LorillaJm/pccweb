'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Plus, Edit, Trash2, Save, X, Image, Calendar } from 'lucide-react';

interface FacebookPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function FacebookPostManager() {
  const [posts, setPosts] = useState<FacebookPost[]>([
    {
      id: '1',
      title: 'Welcome to the New Academic Year 2025!',
      content: 'We are excited to welcome all our students back to campus for another year of learning and growth. This semester brings new opportunities, updated facilities, and exciting programs designed to enhance your educational experience.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      date: new Date().toISOString().split('T')[0],
      likes: 245,
      comments: 32,
      shares: 18
    }
  ]);

  const [editingPost, setEditingPost] = useState<FacebookPost | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = (post: FacebookPost) => {
    if (post.id === 'new') {
      const newPost = { ...post, id: Date.now().toString() };
      setPosts([newPost, ...posts]);
    } else {
      setPosts(posts.map(p => p.id === post.id ? post : p));
    }
    setEditingPost(null);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const PostForm = ({ post, onSave, onCancel }: {
    post: FacebookPost;
    onSave: (post: FacebookPost) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(post);

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Facebook className="h-5 w-5 text-blue-600 mr-2" />
              {post.id === 'new' ? 'Add New Post' : 'Edit Post'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your post content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="h-4 w-4 inline mr-1" />
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Post Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Likes
                </label>
                <input
                  type="number"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <input
                  type="number"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shares
                </label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Post
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Facebook className="h-6 w-6 text-blue-600 mr-3" />
          Facebook Posts Manager
        </h3>
        <button
          onClick={() => {
            setEditingPost({
              id: 'new',
              title: '',
              content: '',
              image: '',
              date: new Date().toISOString().split('T')[0],
              likes: 0,
              comments: 0,
              shares: 0
            });
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <div className="flex space-x-4">
                <span>👍 {post.likes}</span>
                <span>💬 {post.comments}</span>
                <span>🔄 {post.shares}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Facebook className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No posts yet. Add your first Facebook-style post!</p>
        </div>
      )}

      {editingPost && (
        <PostForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => {
            setEditingPost(null);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}