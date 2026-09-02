import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-agri-900 text-white border-t border-agri-800 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* TOP MULTI-COLUMN SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* COLUMN 1: BRAND INTRO */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-agri-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">{t('brand.name')}</span>
            </Link>

            <p className="text-agri-200 text-xs leading-relaxed max-w-sm">
              {t('brand.subtagline')}
            </p>

            <div className="pt-2 flex items-center space-x-3 text-xs">
              <span className="text-agri-300 font-semibold">{t('nav.languageLabel')}</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${language === 'en' ? 'bg-agri-600 text-white' : 'bg-agri-800 text-agri-300 hover:text-white'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${language === 'kn' ? 'bg-agri-600 text-white' : 'bg-agri-800 text-agri-300 hover:text-white'}`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          {/* COLUMN 2: PRODUCT LINKS */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-agri-300 uppercase tracking-widest">{t('footer.product')}</h4>
            <ul className="space-y-2 text-xs text-agri-200 font-medium">
              <li><Link to="/" className="hover:text-white transition">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition">{t('nav.about')}</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition">{t('nav.howItWorks')}</a></li>
              <li><Link to="/crops" className="hover:text-white transition">{t('nav.marketplace')}</Link></li>
              <li><Link to="/products" className="hover:text-white transition">{t('nav.agroStore')}</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: FOR USERS */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-agri-300 uppercase tracking-widest">{t('footer.forUsers')}</h4>
            <ul className="space-y-2 text-xs text-agri-200 font-medium">
              <li><Link to="/register?role=farmer" className="hover:text-white transition">{t('roles.farmer')}</Link></li>
              <li><Link to="/register?role=worker" className="hover:text-white transition">{t('roles.worker')}</Link></li>
              <li><Link to="/register?role=store" className="hover:text-white transition">{t('roles.store')}</Link></li>
              <li><Link to="/register?role=trader" className="hover:text-white transition">{t('roles.trader')}</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: FEATURES & SUPPORT */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-agri-300 uppercase tracking-widest">{t('footer.features')}</h4>
            <ul className="space-y-2 text-xs text-agri-200 font-medium">
              <li>{t('aiFeatures.recTitle')}</li>
              <li>{t('aiFeatures.wageTitle')}</li>
              <li>{t('hero.ctaWageEstimator')}</li>
              <li>{t('marketplace.title')}</li>
              <li>{t('aiChat.headerTitle')}</li>
            </ul>
          </div>

        </div>

        {/* MIDDLE PRIVACY & TRUST BANNER */}
        <div className="bg-agri-800/80 p-4 rounded-2xl border border-agri-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3 text-agri-200">
            <ShieldCheck className="w-5 h-5 text-agri-400 shrink-0" />
            <span>{t('location.privacyNotice')}</span>
          </div>
          <div className="flex items-center space-x-2 text-agri-300 shrink-0">
            <MapPin className="w-4 h-4 text-agri-400" />
            <span>Karnataka, India</span>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-6 border-t border-agri-800 flex flex-col sm:flex-row justify-between items-center text-xs text-agri-400 gap-4">
          <p>{t('footer.copyright')}</p>
          
          <div className="flex items-center space-x-6">
            <span className="hover:text-agri-200 transition cursor-pointer">{t('footer.privacyPolicy')}</span>
            <span className="hover:text-agri-200 transition cursor-pointer">{t('footer.termsOfService')}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
