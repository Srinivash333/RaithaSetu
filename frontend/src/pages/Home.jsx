import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Users, ShoppingBag, Store, Sparkles, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Calculator, UserCheck, Search, Award } from 'lucide-react';
import WageEstimatorModal from '../components/WageEstimatorModal';

export default function Home() {
  const { t } = useLanguage();
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION WITH AUTHENTIC INDIAN FARMER PHOTOGRAPHY */}
      <section className="relative bg-gradient-to-b from-agri-100/90 via-agri-50/60 to-white pt-12 pb-20 border-b border-agri-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT TEXT & CALL TO ACTIONS */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 bg-agri-600/10 text-agri-800 px-4 py-1.5 rounded-full text-xs font-bold border border-agri-600/20 shadow-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-agri-600 fill-current" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-agri-900 tracking-tight leading-tight">
                {t('hero.title')}
                <span className="block text-2xl sm:text-3xl font-bold text-agri-700 mt-2">
                  {t('hero.subtitle')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
                {t('hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.ctaGetStarted')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button
                  onClick={() => setIsWageModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white border border-agri-300 text-agri-800 hover:bg-agri-50 font-bold rounded-xl text-sm shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-4 h-4 text-agri-600" />
                  <span>{t('hero.ctaWageEstimator')}</span>
                </button>
              </div>

              <div className="pt-6 flex flex-wrap items-center gap-6 text-xs font-bold text-agri-800 border-t border-agri-200/60">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-agri-600" />
                  <span>{t('hero.featureDecay')}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-agri-600" />
                  <span>{t('hero.featureMatchReasons')}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-agri-600" />
                  <span>{t('hero.featureBilingual')}</span>
                </div>
              </div>

            </div>

            {/* RIGHT HERO PHOTOGRAPH - AUTHENTIC INDIAN FARMER */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-agri-600 to-agri-400 opacity-30 blur-xl"></div>
                <div className="relative bg-white p-3 rounded-3xl shadow-2xl border border-agri-200">
                  <img
                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
                    alt="Indian Farmer with Ox Plowing Agricultural Field"
                    className="w-full h-[400px] object-cover rounded-2xl"
                    loading="eager"
                  />

                  {/* Floating AI Highlight Badge */}
                  <div className="absolute -bottom-5 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-agri-200 shadow-xl flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-yellow-300 fill-current" />
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold text-agri-900 block">{t('recCard.title')}</span>
                      <span className="text-gray-600 text-[11px]">Ramesh Kumar • <strong className="text-agri-700">92% {t('recCard.match')}</strong> (2.4 {t('location.kmAway')})</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHAT IS RAITHASETU AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-agri-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
              alt="Rural Indian Agriculture & Farmers"
              className="w-full h-72 object-cover rounded-2xl shadow-md"
              loading="lazy"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-agri-600">{t('about.badge')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-900">
              {t('about.title')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {t('about.description')}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-agri-50 p-3 rounded-xl border border-agri-200">
                <span className="font-bold text-agri-900 block">{t('about.hiringTitle')}</span>
                <span className="text-gray-600 text-[11px]">{t('about.hiringDesc')}</span>
              </div>
              <div className="bg-agri-50 p-3 rounded-xl border border-agri-200">
                <span className="font-bold text-agri-900 block">{t('about.marketTitle')}</span>
                <span className="text-gray-600 text-[11px]">{t('about.marketDesc')}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS - 7 STEP VISUAL PROCESS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-900">{t('howItWorks.title')}</h2>
          <p className="text-xs sm:text-sm text-gray-600">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { step: '01', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
            { step: '02', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
            { step: '03', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
            { step: '04', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') },
            { step: '05', title: t('howItWorks.step5Title'), desc: t('howItWorks.step5Desc') },
            { step: '06', title: t('howItWorks.step6Title'), desc: t('howItWorks.step6Desc') },
            { step: '07', title: t('howItWorks.step7Title'), desc: t('howItWorks.step7Desc') }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl border border-agri-200 text-center space-y-1.5 shadow-sm hover:border-agri-400 transition">
              <span className="w-8 h-8 rounded-full bg-agri-600 text-white font-extrabold text-xs flex items-center justify-center mx-auto">
                {item.step}
              </span>
              <h4 className="font-bold text-xs text-agri-900 pt-1">{item.title}</h4>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. USER ROLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-900">{t('roles.title')}</h2>
          <p className="text-xs sm:text-sm text-gray-600">{t('roles.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-700 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roles.farmer')}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>• {t('roles.farmerF1')}</li>
              <li>• {t('roles.farmerF2')}</li>
              <li>• {t('roles.farmerF3')}</li>
              <li>• {t('roles.farmerF4')}</li>
            </ul>
            <Link to="/register?role=farmer" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>{t('roles.registerFarmer')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roles.worker')}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>• {t('roles.workerF1')}</li>
              <li>• {t('roles.workerF2')}</li>
              <li>• {t('roles.workerF3')}</li>
              <li>• {t('roles.workerF4')}</li>
            </ul>
            <Link to="/register?role=worker" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>{t('roles.registerWorker')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roles.store')}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>• {t('roles.storeF1')}</li>
              <li>• {t('roles.storeF2')}</li>
              <li>• {t('roles.storeF3')}</li>
              <li>• {t('roles.storeF4')}</li>
            </ul>
            <Link to="/register?role=store" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>{t('roles.registerStore')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roles.trader')}</h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>• {t('roles.traderF1')}</li>
              <li>• {t('roles.traderF2')}</li>
              <li>• {t('roles.traderF3')}</li>
              <li>• {t('roles.traderF4')}</li>
            </ul>
            <Link to="/register?role=trader" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>{t('roles.registerTrader')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. FLAGSHIP AI RECOMMENDATION ENGINE */}
      <section id="ai-features" className="bg-agri-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-agri-800 text-agri-300 px-3.5 py-1 rounded-full text-xs font-bold border border-agri-700">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                <span>{t('aiFeatures.badge')}</span>
              </div>

              <h2 className="text-3xl font-extrabold leading-tight">
                "{t('aiFeatures.quote')}"
              </h2>

              <p className="text-agri-200 text-xs sm:text-sm leading-relaxed">
                {t('aiFeatures.description')}
              </p>
              
              <div className="space-y-3">
                <div className="bg-agri-800/90 p-4 rounded-xl border border-agri-700 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Ramesh Kumar</span>
                    <span className="text-yellow-400">92% {t('recCard.match')}</span>
                  </div>
                  <div className="text-[11px] text-agri-200 space-y-1">
                    <p>• <strong>{t('location.distance')}:</strong> 2.3 {t('location.kmAway')}</p>
                    <p>• <strong>{t('recCard.rating')}:</strong> 4.7 / 5 stars</p>
                    <p>• <strong>{t('dashboards.common.status')}:</strong> {t('recCard.available')}</p>
                  </div>
                  <p className="text-[11px] text-agri-300 italic pt-1 border-t border-agri-700">
                    "{t('recCard.sampleReason')}"
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
                alt="Agricultural workers harvesting crops in Karnataka field"
                className="w-full h-80 object-cover rounded-2xl shadow-xl border border-agri-700"
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-agri-900">
          {t('cta.title')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          {t('cta.subtitle')}
        </p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl text-sm shadow-lg transition"
        >
          <span>{t('cta.button')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <WageEstimatorModal isOpen={isWageModalOpen} onClose={() => setIsWageModalOpen(false)} />

    </div>
  );
}
