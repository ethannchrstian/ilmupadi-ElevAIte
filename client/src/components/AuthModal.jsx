import { useState } from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';

const AuthModal = ({
    showAuth,
    setShowAuth,
    setIsAuthenticated,
    setUser
}) => {
    const [authMode, setAuthMode] = useState('login');
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
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: authForm.email,
                    password: authForm.password
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || 'Login failed');

            setUser(data);
            setIsAuthenticated(true);
            setShowAuth(false);
            setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
            alert('Login berhasil!');
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
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: authForm.name,
                    email: authForm.email,
                    password: authForm.password
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || 'Register failed');

            setUser(data);
            setIsAuthenticated(true);
            setShowAuth(false);
            setAuthForm({ email: '', password: '', name: '', confirmPassword: '' });
            alert('Registrasi berhasil!');
        } catch (error) {
            console.error('Register error:', error.message);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                            className="text-gray-500 hover:text-gray-900 text-xl font-bold"
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
                                className="ml-2 text-green-700 bg-green-100 px-3 py-1 rounded font-medium hover:bg-green-200 transition-colors"
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

export default AuthModal;