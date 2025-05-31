import { useState } from 'react';
import { Leaf, MessageSquare, Newspaper, User, LogOut, Menu, X } from 'lucide-react';

import DeteksiPage from './pages/Deteksi';
import ForumPage from './pages/Forum';
import BeritaPage from './pages/Berita';
import AuthModal from './components/AuthModal';

function App() {
  const [currentPage, setCurrentPage] = useState('deteksi');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('deteksi');
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
      <div className="bg-white/70 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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

            <div className="hidden lg:flex items-center gap-6">
              {/* Navbar */}
              <nav className="flex gap-2">
                {navigationItem.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all touch-manipulation ${isActive
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User auth */}
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
            <div className="p-4 space-y-2">
              {navigationItem.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-manipulation ${isActive
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-100 rounded-lg">
                      <User className="w-5 h-5 text-green-700" />
                      <span className="text-sm font-medium text-green-700">
                        {user?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuth(true);
                      setIsMobileMenuOpen(false);
                    }}
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

      {/* Auth Modal Component */}
      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
      />
    </div>
  );
}

export default App;

