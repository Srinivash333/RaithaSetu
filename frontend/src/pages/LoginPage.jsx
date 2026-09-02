import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogIn, Key, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        switch (res.user.role) {
          case 'farmer': navigate('/farmer-dashboard'); break;
          case 'worker': navigate('/worker-dashboard'); break;
          case 'store': navigate('/store-dashboard'); break;
          case 'trader': navigate('/trader-dashboard'); break;
          case 'admin': navigate('/admin-dashboard'); break;
          default: navigate('/');
        }
      } else {
        setError(res.error || 'Invalid login credentials');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl border border-agri-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-agri-600 text-white flex items-center justify-center mx-auto shadow-md">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-agri-900">{t('navLogin')}</h2>
          <p className="text-xs text-gray-500">Access your RaithaSetu AI dashboard</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. farmer.ramesh@raithasetu.com"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
          >
            {loading ? 'Authenticating...' : t('navLogin')}
          </button>
        </form>

        {/* Demo Fast Login Preset Buttons */}
        <div className="pt-4 border-t border-agri-100">
          <div className="flex items-center space-x-1 mb-2.5 text-xs font-bold text-agri-800">
            <Sparkles className="w-3.5 h-3.5 text-agri-600" />
            <span>Quick Demo Credentials (Click to fill)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickDemo('farmer.ramesh@raithasetu.com')}
              className="p-2 bg-agri-50 hover:bg-agri-100 border border-agri-200 rounded-lg text-left text-agri-900 transition"
            >
              <strong className="block text-xs">🌾 Farmer</strong>
              <span>farmer.ramesh</span>
            </button>

            <button
              onClick={() => handleQuickDemo('worker.manju@raithasetu.com')}
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-left text-amber-900 transition"
            >
              <strong className="block text-xs">🔨 Worker</strong>
              <span>worker.manju</span>
            </button>

            <button
              onClick={() => handleQuickDemo('store.kaveri@raithasetu.com')}
              className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left text-blue-900 transition"
            >
              <strong className="block text-xs">🏪 Store</strong>
              <span>store.kaveri</span>
            </button>

            <button
              onClick={() => handleQuickDemo('trader.annapurna@raithasetu.com')}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-left text-emerald-900 transition"
            >
              <strong className="block text-xs">📈 Trader</strong>
              <span>trader.annapurna</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-agri-700 hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}
