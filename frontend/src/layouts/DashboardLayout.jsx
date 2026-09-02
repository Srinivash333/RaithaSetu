import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation as useGeoLocation } from '../context/LocationContext';
import { Sprout, LayoutDashboard, Briefcase, ShoppingBag, Store, User, LogOut, MapPin, Globe, Sparkles } from 'lucide-react';
import AIChatbot from '../components/AIChatbot';
import LocationButton from '../components/LocationButton';

export default function DashboardLayout({ children, activeTab = 'overview' }) {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { coords, locationName } = useGeoLocation();
  const navigate = useNavigate();

  const getDashboardHome = (role) => {
    switch (role) {
      case 'farmer': return '/farmer-dashboard';
      case 'worker': return '/worker-dashboard';
      case 'store': return '/store-dashboard';
      case 'trader': return '/trader-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'farmer': return { title: t('roles.farmer'), bg: 'bg-agri-600' };
      case 'worker': return { title: t('roles.worker'), bg: 'bg-amber-600' };
      case 'store': return { title: t('roles.store'), bg: 'bg-blue-600' };
      case 'trader': return { title: t('roles.trader'), bg: 'bg-emerald-600' };
      case 'admin': return { title: t('roleAdmin'), bg: 'bg-agri-900' };
      default: return { title: 'User', bg: 'bg-gray-600' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAF8]">
      
      {/* MODERN SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-agri-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="p-5 space-y-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-agri-600 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-agri-900 tracking-tight block leading-none">
                {t('brand.name')}
              </span>
              <span className="text-[10px] font-semibold text-agri-600 uppercase tracking-widest block mt-0.5">
                {t('nav.dashboard')}
              </span>
            </div>
          </Link>

          {/* User Profile Card */}
          <div className="p-3 bg-agri-50 rounded-xl border border-agri-200 space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-agri-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-xs text-agri-900 block truncate">{user?.name}</span>
                <span className={`inline-block text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase ${badge.bg}`}>
                  {badge.title}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold text-gray-700">
            <Link
              to={getDashboardHome(user?.role)}
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl bg-agri-600 text-white font-bold shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('nav.dashboard')}</span>
            </Link>

            <Link
              to="/jobs"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-agri-50 hover:text-agri-800 transition"
            >
              <Briefcase className="w-4 h-4 text-agri-600" />
              <span>{t('nav.workforceJobs')}</span>
            </Link>

            <Link
              to="/crops"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-agri-50 hover:text-agri-800 transition"
            >
              <ShoppingBag className="w-4 h-4 text-agri-600" />
              <span>{t('nav.marketplace')}</span>
            </Link>

            <Link
              to="/products"
              className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-agri-50 hover:text-agri-800 transition"
            >
              <Store className="w-4 h-4 text-agri-600" />
              <span>{t('nav.agroStore')}</span>
            </Link>
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-agri-100 space-y-2 text-xs">
          <div className="flex items-center justify-between px-3 py-2 bg-agri-50 border border-agri-200 text-agri-900 rounded-xl font-semibold text-xs">
            <span className="flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-agri-600" />
              <span>{t('nav.languageLabel')}</span>
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === 'en' ? 'bg-agri-600 text-white' : 'text-gray-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === 'kn' ? 'bg-agri-600 text-white' : 'text-gray-700'}`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-agri-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2 text-xs text-agri-900 font-extrabold">
            <Sprout className="w-4 h-4 text-agri-600 shrink-0" />
            <span>{t('brand.name')}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 font-bold">{t('nav.dashboard')}</span>
          </div>

          <LocationButton compact={true} />
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>

      </div>

      <AIChatbot />
    </div>
  );
}
