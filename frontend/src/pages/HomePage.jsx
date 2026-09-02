import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Users, ShoppingBag, Store, Sparkles, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';
import WageEstimatorModal from '../components/WageEstimatorModal';

export default function HomePage() {
  const { t } = useLanguage();
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-agri-100/80 via-agri-50/50 to-white pt-16 pb-20 border-b border-agri-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-agri-600/10 text-agri-800 px-4 py-1.5 rounded-full text-xs font-semibold border border-agri-600/20 shadow-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-agri-600 fill-current" />
              <span>Smart Agricultural Ecosystem • Multi-Role & AI Powered</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-agri-900 tracking-tight leading-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>{t('heroCTA')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={() => setIsWageModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-agri-300 text-agri-800 hover:bg-agri-50 font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Calculator className="w-4 h-4 text-agri-600" />
                <span>{t('estimateWage')}</span>
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-agri-800">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                <span>Location-Aware Distance Decay</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                <span>Explainable AI Match Reasons</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                <span>English & Kannada Bilingual</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS / ROLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agri-900">
            Designed for 4 Primary Agricultural Participants
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Connecting farmers, agricultural workers, agro stores, and wholesale buyers into one unified ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Farmer Card */}
          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-700 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roleFarmer')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Post agricultural jobs with location detection, receive AI worker recommendations with match explanations, sell crops directly, and order farm supplies.
            </p>
            <Link to="/register?role=farmer" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>Register as Farmer</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Worker Card */}
          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roleWorker')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Set availability status, discover nearby agricultural jobs with distance indicators (e.g. 2.4 km away), apply directly, and build verified ratings.
            </p>
            <Link to="/register?role=worker" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>Register as Worker</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Store Card */}
          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roleStore')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              List seeds, fertilizers, pesticides, tools. Configure store delivery radius and fulfill farmer orders with demo sandbox payment integration.
            </p>
            <Link to="/register?role=store" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>Register Agro Store</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Trader Card */}
          <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-agri-900">{t('roleTrader')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Browse farmer crop listings, filter by crop type and distance, view farmer contact info, and place direct purchase orders securely.
            </p>
            <Link to="/register?role=trader" className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900">
              <span>Register as Trader</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

        </div>
      </section>

      {/* FLAGSHIP AI FEATURE PREVIEW */}
      <section className="bg-agri-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-agri-800 text-agri-300 px-3.5 py-1 rounded-full text-xs font-semibold border border-agri-700">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                <span>Flagship Intelligence</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">
                "Find the most suitable agricultural worker, not merely the nearest worker."
              </h2>
              <p className="text-agri-200 text-xs sm:text-sm leading-relaxed">
                RaithaSetu AI combines skill matrix evaluation, spatial distance decay, crop task experience, worker availability, and past performance ratings into a transparent match score.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="bg-agri-800/80 p-4 rounded-xl border border-agri-700 text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-agri-200">Manjunatha K (Worker)</span>
                    <span className="text-yellow-400">92% Match</span>
                  </div>
                  <p className="text-[11px] text-agri-300 italic">
                    "Recommended because this worker has 6 years experience in paddy harvesting, is available, has a 4.8/5 rating and is located 2.3 km away."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white space-y-4">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-agri-400" />
                <span>Privacy-First Geolocation Engine</span>
              </h3>
              <p className="text-xs text-agri-100 leading-relaxed">
                Location data is retrieved only when requested by the user. Distance between farms and workers is calculated using MongoDB geospatial indexing (`$near`) and displayed as non-intrusive distance tags (e.g. <strong>2.4 km away</strong>).
              </p>
              <div className="p-3 bg-agri-800 rounded-xl text-xs flex justify-between items-center text-agri-200">
                <span>Exact Coordinates Protected</span>
                <span className="bg-agri-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Privacy Compliant</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-agri-900">
          Ready to Transform Agricultural Operations?
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          Join thousands of farmers, workers, agro stores, and buyers experiencing intelligent agricultural decision support.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl text-sm shadow-lg transition"
        >
          <span>Create Your Free Account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <WageEstimatorModal isOpen={isWageModalOpen} onClose={() => setIsWageModalOpen(false)} />

    </div>
  );
}
