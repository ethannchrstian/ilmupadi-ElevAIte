import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, User, Calendar, Edit3, Trash2 } from 'lucide-react';

const ForumPage = ({ user, isAuthenticated }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  // const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  // Get current user from localStorage (after login)
  // useEffect(() => {
  //   const userData = localStorage.getItem('user');
  //   if (userData) {
  //     setCurrentUser(JSON.parse(userData));
  //   }
  // }, []);

  // Fetch posts dari API
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data posts');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Gagal memuat posts. Silakan refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Judul dan konten tidak boleh kosong');
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          authorId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat post');
      }

      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!confirm('Yakin ingin menghapus post ini?')) return;

    if (!isAuthenticated || !user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus post');
      }

      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Memuat forum...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 text-sm mt-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Forum Petani</h1>
              <p className="text-gray-600">Berbagi pengalaman dan diskusi pertanian</p>
            </div>
          </div>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Halo, {user.name}!</span>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buat Post
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p>Login untuk membuat post</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Form */}
      {showCreateForm && isAuthenticated && user && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Buat Post Baru</h3>
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Judul post..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Tulis konten post..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreatePost}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Posting
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPost({ title: '', content: '' });
                  setError('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Belum ada post</h3>
              <p>Jadilah yang pertama membuat post di forum ini!</p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {isAuthenticated && user && user.id === post.author.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {/* TODO: Implement edit */}}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Balas (0 komentar)
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchPosts}
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          Refresh Posts
        </button>
      </div>
    </div>
  );
};

export default ForumPage;