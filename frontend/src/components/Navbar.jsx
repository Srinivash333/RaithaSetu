import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sprout, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import LocationButton from './LocationButton';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'farmer': return '/farmer-dashboard';
      case 'worker': return '/worker-dashboard';
      case 'store': return '/store-dashboard';
      case 'trader': return '/trader-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-agri-200 shadow-sm transition-all duration-200 min-h-[72px] sm:min-h-[80px] flex items-center">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. BRAND LOGO SECTION (LEFT) */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0" aria-label="RaithaSetu Home">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-agri-600 flex items-center justify-center text-white shadow-md group-hover:bg-agri-700 transition shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="shrink-0">
              <span className="text-xl sm:text-2xl font-black text-agri-900 tracking-tight block leading-none">
                {t('brand.name')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-agri-600 uppercase tracking-widest block mt-0.5 sm:mt-1">
                {t('brand.subname')}
              </span>
            </div>
          </Link>

          {/* 2. CENTER MAIN NAVIGATION LINKS - COLLAPSE BEFORE OVERFLOW */}
          <nav className="hidden xl:flex items-center gap-x-2 2xl:gap-x-4 text-[11px] 2xl:text-xs font-bold text-agri-900 shrink min-w-0" aria-label="Main Navigation">
            <Link 
              to="/" 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap shrink-0"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/about" 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap shrink-0"
            >
              {t('nav.about')}
            </Link>
            <button 
              type="button"
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer font-bold shrink-0"
            >
              {t('nav.howItWorks')}
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('ai-features')} 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer font-bold shrink-0"
            >
              {t('nav.features')}
            </button>
            <Link 
              to="/crops" 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap shrink-0"
            >
              {t('nav.marketplace')}
            </Link>
            <Link 
              to="/jobs" 
              className="hover:text-agri-600 transition py-1 tracking-wide whitespace-nowrap shrink-0"
            >
              {t('nav.workforceJobs')}
            </Link>
          </nav>

          {/* 3. RIGHT-SIDE ACTIONS: LOGIN -> REGISTER -> LOCATION -> LANGUAGE */}
          <div className="hidden xl:flex items-center gap-x-1.5 2xl:gap-x-2.5 shrink-0">
            
            {/* AUTH BUTTONS OR DASHBOARD */}
            {user ? (
              <div className="flex items-center space-x-1.5 shrink-0">
                <Link
                  to={getDashboardPath(user.role)}
                  className="flex items-center space-x-1.5 bg-agri-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-agri-700 transition shadow-sm whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="capitalize font-bold">{user.role} {t('nav.dashboard')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title={t('nav.logout')}
                  aria-label={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-bold text-agri-900 hover:bg-agri-50 rounded-xl transition whitespace-nowrap"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-agri-600 text-white rounded-xl hover:bg-agri-700 transition shadow-sm whitespace-nowrap"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* CURRENT LOCATION (MUST BE AFTER REGISTER) */}
            <div className="shrink-0">
              <LocationButton compact={true} />
            </div>

            {/* LANGUAGE SELECTOR PILL [ EN | ಕನ್ನಡ ] (MUST BE AFTER LOCATION) */}
            <div className="flex items-center bg-agri-50 p-1 rounded-xl border border-agri-200 text-xs font-bold shrink-0" role="region" aria-label="Language selector">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
                className={`px-2 py-0.5 rounded-lg transition font-bold ${
                  language === 'en'
                    ? 'bg-agri-600 text-white shadow-sm'
                    : 'text-agri-900 hover:text-agri-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                aria-label="Switch to Kannada"
                className={`px-2 py-0.5 rounded-lg transition font-bold ${
                  language === 'kn'
                    ? 'bg-agri-600 text-white shadow-sm'
                    : 'text-agri-900 hover:text-agri-600'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

          </div>

          {/* MOBILE / TABLET HAMBURGER BUTTON (COLLAPSE BEFORE OVERFLOW) */}
          <div className="flex xl:hidden items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="px-2.5 py-1 bg-agri-50 border border-agri-200 rounded-lg text-xs font-bold text-agri-900"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'ಕನ್ನಡ' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-agri-900 rounded-xl hover:bg-agri-50 transition"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE / TABLET NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed top-[72px] sm:top-[80px] inset-x-0 bg-white border-b border-agri-200 shadow-xl p-5 space-y-4 animate-fade-in z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col space-y-3 text-base font-bold text-agri-900">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-bold hover:text-agri-600 py-1">{t('nav.home')}</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="font-bold hover:text-agri-600 py-1">{t('nav.about')}</Link>
            <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-agri-600 py-1 font-bold">{t('nav.howItWorks')}</button>
            <button onClick={() => scrollToSection('ai-features')} className="text-left hover:text-agri-600 py-1 font-bold">{t('nav.features')}</button>
            <Link to="/crops" onClick={() => setMobileMenuOpen(false)} className="font-bold hover:text-agri-600 py-1">{t('nav.marketplace')}</Link>
            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="font-bold hover:text-agri-600 py-1">{t('nav.workforceJobs')}</Link>
          </nav>

          <div className="pt-3 border-t border-agri-100 space-y-3">
            
            {/* AUTH / DASHBOARD IN MOBILE MENU */}
            {user ? (
              <Link
                to={getDashboardPath(user.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-agri-600 text-white font-bold py-3 rounded-xl text-sm shadow-sm"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 bg-agri-50 border border-agri-200 text-agri-900 rounded-xl text-sm font-bold"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 bg-agri-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* CURRENT LOCATION IN MOBILE MENU */}
            <div className="pt-1">
              <LocationButton compact={false} />
            </div>

            {/* LANGUAGE SELECTOR IN MOBILE MENU */}
            <div className="flex items-center justify-between text-sm font-bold bg-agri-50 p-2.5 rounded-xl border border-agri-200">
              <span className="text-agri-900 font-bold">{t('nav.languageLabel')}</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${language === 'en' ? 'bg-agri-600 text-white shadow-sm' : 'text-agri-900'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('kn')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${language === 'kn' ? 'bg-agri-600 text-white shadow-sm' : 'text-agri-900'}`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
