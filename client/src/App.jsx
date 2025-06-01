import React, { useState, useEffect } from 'react';
import { Leaf, MessageSquare, Newspaper, User, LogOut, Menu, X, Lock, LayoutDashboard, RefreshCw } from 'lucide-react'; // Added RefreshCw for loading

import DeteksiPage from './pages/Deteksi';
import ForumPage from './pages/Forum';
import BeritaPage from './pages/Berita';
import UserDashboard from './pages/UserDashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [currentPage, setCurrentPage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('sahabatTaniUser');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData && typeof userData.id !== 'undefined' && userData.name && userData.email) {
          setUser(userData);
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        } else {
          localStorage.removeItem('sahabatTaniUser');
          setCurrentPage('deteksi');
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('sahabatTaniUser');
        setCurrentPage('deteksi');
      }
    } else {
      setCurrentPage('deteksi');
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sahabatTaniUser');
    setCurrentPage('deteksi');
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const navigationItem = [
    { id: 'deteksi', label: 'Deteksi', icon: Leaf },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'berita', label: 'Berita', icon: Newspaper }
  ];

  const AuthGuard = ({ children, requireAuth = false }) => {
    if (requireAuth && !isAuthenticated) {
      return (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Login Diperlukan</h2>
            <p className="text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk mengakses fitur ini.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuth(true)}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Login Sekarang
              </button>
              <div className="text-sm text-gray-500">
                <p>Belum punya akun? Daftar gratis untuk akses penuh ke semua fitur.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return children;
  };

  const renderContent = () => {
    if (!currentPage) {
      return (
        <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <RefreshCw className="w-10 h-10 text-green-600 animate-spin" />
        </div>
      );
    }
    switch (currentPage) {
      case 'deteksi':
        return (<AuthGuard requireAuth={true}><DeteksiPage user={user} isAuthenticated={isAuthenticated} /></AuthGuard>);
      case 'forum':
        return (<AuthGuard requireAuth={true}><ForumPage user={user} isAuthenticated={isAuthenticated} /></AuthGuard>);
      case 'berita':
        return <BeritaPage />;
      case 'dashboard':
        return (<AuthGuard requireAuth={true}><UserDashboard user={user} /></AuthGuard>);
      default:
        return (<AuthGuard requireAuth={true}><DeteksiPage user={user} isAuthenticated={isAuthenticated} /></AuthGuard>);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 cursor-pointer"
              onClick={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'deteksi')}
            >
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">Sahabat Tani</h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  Deteksi penyakit berbasis AI untuk tanaman padi
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 sm:gap-2">
              <nav className="flex gap-1 sm:gap-2">
                {navigationItem.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentPage === item.id;
                  const requiresAuth = item.id !== 'berita';
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (requiresAuth && !isAuthenticated) {
                          setShowAuth(true);
                        } else {
                          setCurrentPage(item.id);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all touch-manipulation relative ${isActive
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                      {requiresAuth && !isAuthenticated && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all touch-manipulation relative ${currentPage === 'dashboard'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                      }`}
                    title="Dashboard Saya"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Dashboard</span>
                  </button>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 rounded-lg">
                    <User className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-700 hidden sm:inline">
                      {user?.name || 'Pengguna'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 ml-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Masuk</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
            <div className="p-4 space-y-2">
              {navigationItem.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPage === item.id;
                const requiresAuth = item.id !== 'berita';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (requiresAuth && !isAuthenticated) {
                        setShowAuth(true);
                      } else {
                        setCurrentPage(item.id);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-manipulation ${isActive
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                    {requiresAuth && !isAuthenticated && (
                      <Lock className="w-3 h-3 text-gray-400 ml-auto" />
                    )}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-manipulation ${currentPage === 'dashboard'
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-100 rounded-lg">
                      <User className="w-5 h-5 text-green-700" />
                      <span className="text-sm font-medium text-green-700">
                        {user?.name || 'Pengguna'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAuth(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 font-medium rounded-lg transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>Masuk</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {renderContent()}


      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default App;