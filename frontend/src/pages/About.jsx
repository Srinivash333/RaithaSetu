import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, ShieldCheck, MapPin, Sparkles, Award } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-agri-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-agri-900">{t('nav.about')} {t('brand.name')}</h1>
        <p className="text-sm text-gray-600">{t('brand.tagline')}</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-agri-200 shadow-sm space-y-6 leading-relaxed text-xs text-gray-700">
        <h2 className="text-lg font-bold text-agri-900 border-b border-agri-100 pb-2">{t('about.visionTitle')}</h2>
        <p>
          {t('about.visionDesc')}
        </p>

        <h2 className="text-lg font-bold text-agri-900 border-b border-agri-100 pb-2">Key Differentiator</h2>
        <blockquote className="bg-agri-50 p-4 rounded-2xl border-l-4 border-agri-600 font-extrabold text-agri-900 text-sm italic">
          "{t('about.differentiatorQuote')}"
        </blockquote>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-agri-50 p-4 rounded-xl border border-agri-200 space-y-1">
            <span className="font-bold text-agri-900 block">{t('about.matrixTitle')}</span>
            <p className="text-[11px] text-gray-600">{t('about.matrixDesc')}</p>
          </div>

          <div className="bg-agri-50 p-4 rounded-xl border border-agri-200 space-y-1">
            <span className="font-bold text-agri-900 block">{t('about.privacyTitle')}</span>
            <p className="text-[11px] text-gray-600">{t('about.privacyDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
