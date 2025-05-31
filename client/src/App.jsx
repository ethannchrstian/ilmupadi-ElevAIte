import { useState} from 'react';
import {Leaf, Activity, MessageSquare, Newspaper, User, LogOut, Eye, EyeOff} from 'lucide-react';

import DeteksiPage from './pages/Deteksi';
import ForumPage from './pages/Forum';
import BeritaPage from './pages/Berita';

function App() {
  const [currentPage, setCurrentPage] = useState('deteksi');


  // ini login regis nya
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleAuthInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data);
      setIsAuthenticated(true);
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
    } catch (error) {
      console.error('Login error:', error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    if (authForm.password !== authForm.confirmPassword) {
      alert('Password tidak sama!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');

      setUser(data);
      setIsAuthenticated(true);
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
    } catch (error) {
      console.error('Register error:', error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('deteksi');
  };


  // ini authentication 
  const renderAuthModal = () => {
    if (!showAuth) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {authMode === 'login' ? 'Masuk' : 'Daftar'}
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-500 hover:text-gray-900 text-sm"
              >
                ×
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthInputChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={handleAuthInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Masukkan ulang password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-green-700 bg-green-200 hover:bg-green-700 disabled:bg-green-400 hover:text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    {authMode === 'login' ? 'Sedang masuk...' : 'Sedang mendaftar...'}
                  </>
                ) : (
                  authMode === 'login' ? 'Masuk' : 'Daftar'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {authMode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="ml-5 text-green-700 bg-green-100 font-medium"
                  
                >
                  {authMode === 'login' ? 'Daftar disini' : 'Masuk disini'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const navigationItem = [
    { id: 'deteksi', label: 'Deteksi', icon: Leaf },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'berita', label: 'Berita', icon: Newspaper }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'deteksi':
        return <DeteksiPage />;
      case 'forum':
        return <ForumPage />;
      case 'berita':
        return <BeritaPage />;
      default:
        return <DeteksiPage />;
    }
  };


  

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-100 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Alat Pendeteksi Penyakit Padi</h1>
                <p className="text-gray-600 text-sm">Deteksi penyakit berbasis AI untuk tanaman padi</p>
              </div>
            </div>

            <div className="flex items-center gap-6 ">
              {/* Navigation Menu */}
              <nav className="flex gap-2">
                {navigationItem.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Authentication  ini bsk pagi jga aku beresin ~o*/}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                    <User className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-700 hidden sm:inline">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Masuk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderContent()}
      {renderAuthModal()}
    </div>
  );
}

export default App;