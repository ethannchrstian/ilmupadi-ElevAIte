import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, Leaf, Activity, MessageSquare, Newspaper, User, LogOut, Eye, EyeOff, icons } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('deteksi');
  const [prediction, setPrediction] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);


  // ini login regis nya buat mockup besok pagi aku mau ganti jd connect ke backendnya ~olga
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: 1,
        name: authForm.name || 'Pengguna',
        email: authForm.email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
    } catch (error) {
      console.error('Login error:', error);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: Date.now(),
        name: authForm.name,
        email: authForm.email
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('deteksi');
  };


  // ini submit gambarnya
  const handleSubmit = async (file) => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate API call since we can't actually connect to localhost
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock predictions for demo
      const mockPredictions = [
        'Healthy Rice Plant',
        'Brown Spot Disease Detected',
        'Leaf Blast Disease Detected',
        'Bacterial Blight Detected',
        'Tungro Virus Detected'
      ];
      const randomPrediction = mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
      setPrediction(randomPrediction);
    } catch (err) {
      setPrediction('Error getting prediction. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    handleSubmit(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setPrediction('');
    setImagePreview(null);
    setIsLoading(false);
  };

  const getPredictionStatus = () => {
    if (!prediction) return null;
    const isHealthy = prediction.toLowerCase().includes('healthy');
    return {
      isHealthy,
      icon: isHealthy ? CheckCircle : AlertCircle,
      color: isHealthy ? 'text-green-500' : 'text-red-500',
      bgColor: isHealthy ? 'bg-green-50' : 'bg-red-50',
      borderColor: isHealthy ? 'border-green-200' : 'border-red-200'
    };
  };

  const status = getPredictionStatus();

  // ini authentication (login register log out dll bsk pagi jga aku beresin ~olga)
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
        return renderDeteksiPage();
      case 'forum':
        return renderForumPage();
      case 'berita':
        return renderBeritaPage();
      default:
        return renderDeteksiPage();
    }
  };

  const renderDeteksiPage = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-green-600" />
                Unggah Gambar Padi
              </h2>

              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${dragActive
                  ? 'border-green-400 bg-green-50 scale-105'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileSelector}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Letakkan gambar Anda disini atau klik untuk memilih
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mendukung format JPG, PNG, dan format gambar lainnya
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-6">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Uploaded rice plant"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cara Kerja</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold text-xs">1</span>
                </div>
                <p>Unggah gambar yang jelas dari padi Anda</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold text-xs">2</span>
                </div>
                <p>AI kami akan menganalisis gambar untuk mendeteksi tanda penyakit pada padi Anda</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold text-xs">3</span>
                </div>
                <p>Dapatkan hasil dan rekomendasi secara instan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section ini nanti aja (masih belom fix juga) */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sedang menganalisis padi</h3>
                <p className="text-gray-600">AI kami sedang bekerja...</p>
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Results tapi ini nanti aja (masi blm fix) */}
          {prediction && !isLoading && status && (
            <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${status.borderColor}`}>
              <div className={`p-1 ${status.bgColor}`}></div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${status.bgColor} flex-shrink-0`}>
                    <status.icon className={`w-8 h-8 ${status.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Complete</h3>
                    <p className={`text-lg font-medium mb-3 ${status.color}`}>
                      {prediction}
                    </p>

                    {status.isHealthy ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">Great news! 🎉</h4>
                        <p className="text-green-700 text-sm">
                          Your rice plant appears to be healthy. Continue with regular care and monitoring.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Disease Detected ⚠️</h4>
                        <p className="text-red-700 text-sm mb-3">
                          We've identified signs of disease in your rice plant. Consider consulting with an agricultural expert for treatment options.
                        </p>
                        <div className="text-xs text-red-600">
                          <p className="font-medium">Recommended actions:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Isolate affected plants if possible</li>
                            <li>Consult with local agricultural extension services</li>
                            <li>Consider appropriate fungicide or treatment</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default State */}
          {!prediction && !isLoading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Siap untuk analisis</h3>
                <p>Unggah gambar untuk memulai deteksi kesehatan padi berbasis AI</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Didukung oleh Microsoft Azure</p>
      </div>
    </div>

  );

  const renderForumPage = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Forum</h3>
          <p>Halaman forum akan segera hadir</p>
        </div>
      </div>
    </div>
  )

  const renderBeritaPage = () => (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Berita</h3>
          <p>Halaman berita akan segera hadir</p>
        </div>
      </div>
    </div>
  );

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

            <div className="flex items-center gap-6">
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