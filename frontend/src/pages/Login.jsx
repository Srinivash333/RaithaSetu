import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Mail, Key, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';

export default function Login() {
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

    if (!email) {
      setError('Please enter your registered email address or mobile phone number.');
      return;
    }
    if (!password) {
      setError(t('auth.valPassReq'));
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (res.success && res.user) {
        navigateToRole(res.user.role);
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRole = (role) => {
    switch (role) {
      case 'farmer': navigate('/farmer-dashboard'); break;
      case 'worker': navigate('/worker-dashboard'); break;
      case 'store': navigate('/store-dashboard'); break;
      case 'trader': navigate('/trader-dashboard'); break;
      case 'admin': navigate('/admin-dashboard'); break;
      default: navigate('/');
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-agri-200 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12">
        
        {/* LEFT SPLIT: AUTHENTIC FARMER PHOTOGRAPHY & BRANDING */}
        <div className="md:col-span-5 bg-agri-900 text-white p-8 relative flex flex-col justify-between overflow-hidden min-h-[360px] md:min-h-[540px]">
          <img
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
            alt="Traditional Indian Farmer with Bullocks Plowing Field"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          
          <div className="relative z-10 space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-agri-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-black">{t('brand.name')}</span>
            </Link>
            <h2 className="text-2xl font-black leading-tight">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-xs text-agri-200 leading-relaxed">
              {t('auth.welcomeDesc')}
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-agri-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Secure Login</span>
            </div>
            <p className="text-agri-200 text-[11px]">
              Access your agricultural platform dashboard using your registered credentials.
            </p>
          </div>
        </div>

        {/* RIGHT SPLIT: CREDENTIALS FORM ONLY (NO OTP) */}
        <div className="md:col-span-7 p-8 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-agri-900">
              {t('nav.login')}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your email address and password to sign in.
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold animate-fade-in">
              {error}
            </div>
          )}

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.loginMobileOrEmail')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer.ramesh@raithasetu.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth={true} variant="primary">
              <span>{t('auth.loginButton')} →</span>
            </Button>
          </form>

          {/* QUICK DEMO CREDENTIAL CARDS */}
          <div className="space-y-2 border-t border-agri-100 pt-4">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              {t('auth.quickDemoTitle')} (Click to fill)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('farmer.ramesh@raithasetu.com')}
                className="p-2.5 bg-agri-50/80 hover:bg-agri-100 border border-agri-200 rounded-xl text-left transition"
              >
                <span className="font-extrabold text-xs block text-agri-900">{t('roles.farmer')}</span>
                <span className="text-[10px] text-gray-600 truncate block">farmer.ramesh</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('worker.manju@raithasetu.com')}
                className="p-2.5 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition"
              >
                <span className="font-extrabold text-xs block text-amber-900">{t('roles.worker')}</span>
                <span className="text-[10px] text-gray-600 truncate block">worker.manju</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('store.kaveri@raithasetu.com')}
                className="p-2.5 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition"
              >
                <span className="font-extrabold text-xs block text-blue-900">{t('roles.store')}</span>
                <span className="text-[10px] text-gray-600 truncate block">store.kaveri</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('trader.annapurna@raithasetu.com')}
                className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition"
              >
                <span className="font-extrabold text-xs block text-emerald-900">{t('roles.trader')}</span>
                <span className="text-[10px] text-gray-600 truncate block">trader.annapurna</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-bold text-agri-700 hover:underline">
              {t('nav.register')}
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
