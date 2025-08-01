import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, User, Calendar, Edit3, Trash2 } from 'lucide-react';

const ForumPage = ({ user, isAuthenticated }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [error, setError] = useState('');

  // const [editingPost, setEditingPost] = useState(null);
  // const [editForm, setEditForm] = useState({ title: '', content: '' });

  // const [replyingTo, setReplyingTo] = useState(null);
  // const [replyContent, setReplyContent] = useState('');
  // const [replies, setReplies] = useState({});

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
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          authorId: user.id,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        let errorMessage = 'Gagal membuat post';

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const text = await response.text();
          console.warn('Non-JSON error response:', text);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Post created:', data);
      fetchPosts(); // Refresh the posts list
      setNewPost({ title: '', content: '' }); // Reset form
      setShowCreateForm(false)
      // Bisa redirect atau update state
    } catch (error) {
      console.error('Error saat membuat post:', error.message);
      alert(error.message);
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

  // // ambil reply
  // const fetchReplies = async (postId) => {
  //   try {
  //     const response = await fetch(`/api/posts/${postId}/replies`);
  //     if (response.ok) {
  //       const repliesData = await response.json();
  //       setReplies(prev => ({ ...prev, [postId]: repliesData }));
  //     }
  //   } catch (error) {
  //     console.error('Error fetching replies:', error);
  //   }
  // };

  // // edit
  // const handleStartEdit = (post) => {
  //   setEditingPost(post.id);
  //   setEditForm({ title: post.title, content: post.content });
  // };

  // const handleUpdatePost = async (postId) => {
  //   if (!editForm.title.trim() || !editForm.content.trim()) {
  //     setError('Judul dan konten post tidak boleh kosong');
  //     return;
  //   }

  //   try {
  //     setError('');
  //     const response = await fetch(`/api/posts/${postId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         title: editForm.title,
  //         content: editForm.content,
  //         authorId: user.id
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Gagal mengupdate post');
  //     }

  //     const updatedPost = await response.json();
  //     setPosts(posts.map(post => 
  //       post.id === postId ? { ...post, ...updatedPost } : post
  //     ));
  //     setEditingPost(null);
  //     setEditForm({ title: '', content: '' });
  //   } catch (error) {
  //     console.error('Error updating post:', error);
  //     setError(error.message);
  //   }
  // };

  // const handleCancelEdit = () => {
  //   setEditingPost(null);
  //   setEditForm({ title: '', content: '' });
  //   setError('');
  // };

  // // nge reply
  // const handleStartReply = async (postId) => {
  //   setReplyingTo(postId);
  //   await fetchReplies(postId);
  // };

  // const handleSubmitReply = async (postId) => {
  //   if (!replyContent.trim()) {
  //     setError('Komentar tidak boleh kosong');
  //     return;
  //   }

  //   try {
  //     setError('');
  //     const response = await fetch(`/api/posts/${postId}/replies`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         content: replyContent,
  //         authorId: user.id
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Gagal mengirim komentar');
  //     }

  //     const newReply = await response.json();
  //     setReplies(prev => ({
  //       ...prev,
  //       [postId]: [...(prev[postId] || []), newReply]
  //     }));
  //     setReplyContent('');
  //     setReplyingTo(null);
  //   } catch (error) {
  //     console.error('Error submitting reply:', error);
  //     setError(error.message);
  //   }
  // };

  // const handleCancelReply = () => {
  //   setReplyingTo(null);
  //   setReplyContent('');
  //   setError('');
  // };

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
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">

          <div className="flex items-center gap-4 flex-grow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Forum Petani</h1>
              <p className="text-sm sm:text-base text-gray-600">Berbagi pengalaman dan saling berdiskusi!</p>
            </div>
          </div>


          {isAuthenticated && user ? (
            <div className="flex flex-col items-stretch text-center md:text-right md:items-end gap-2 mt-4 md:mt-0 md:flex-row md:items-center md:gap-3 flex-shrink-0">

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium w-full md:w-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Buat Post
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-4 md:mt-0 text-center md:text-right">
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
                  {/* {editingPost === post.id ? (
                    // Edit Form
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-semibold"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdatePost(post.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal Post Display
                    <> */}
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
                    {/* {post.updatedAt !== post.createdAt && (
                      <span className="text-xs text-gray-400">(diedit)</span>
                    )} */}
                  </div>
                    {/* </> */}
                  {/* )} */}
                </div>

                {isAuthenticated && user && user.id === post.author.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {/* TODO: Implement edit */ }}
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