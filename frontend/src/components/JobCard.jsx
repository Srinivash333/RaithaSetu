import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Users, Calendar, Sparkles } from 'lucide-react';
import { formatDistanceKm } from '../utils/helpers';
import { translateCrop, translateWorkType, translateDuration, translateJobTitle, translateDescription } from '../utils/cropTranslations';

export default function JobCard({
  job,
  onApply,
  onRecommend,
  isFarmerView = false
}) {
  const { t, language } = useLanguage();
  const {
    title,
    crop,
    workType,
    description,
    wage,
    duration,
    workersNeeded,
    genderPreference = 'ANY',
    applicantCount = 0,
    distanceKm,
    farmerId
  } = job;

  const genderText = genderPreference === 'MALE' ? t('dashboards.farmer.genderMale') :
                     genderPreference === 'FEMALE' ? t('dashboards.farmer.genderFemale') :
                     t('dashboards.farmer.genderAny');

  const displayCrop = translateCrop(crop, language);
  const displayTitle = translateJobTitle(title, language);
  const displayWorkType = translateWorkType(workType, language);
  const displayDuration = translateDuration(duration, language);
  const displayDescription = translateDescription(description, language);

  return (
    <div className="bg-white rounded-2xl border border-agri-200 p-5 shadow-sm hover:shadow-md transition space-y-4">
      
      <div className="flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            <span className="inline-block bg-agri-100 text-agri-800 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full">
              {displayCrop}
            </span>
            <span className="inline-block bg-slate-100 text-slate-800 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              👤 {genderText}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-gray-900 leading-snug">{displayTitle}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {farmerId?.name ? `Farmer • ${farmerId.name}` : displayWorkType}
          </p>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-agri-700 block">₹{wage}</span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">{displayDuration}</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
        {displayDescription}
      </p>

      <div className="pt-3 border-t border-agri-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-agri-800 font-bold">
            <Users className="w-3.5 h-3.5 mr-1 text-agri-600" />
            {workersNeeded} {t('dashboards.farmer.workersNeededLabel')}
          </span>

          {distanceKm !== undefined && (
            <span className="flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
              <MapPin className="w-3 h-3 mr-1 text-agri-600" />
              {formatDistanceKm(distanceKm)}
            </span>
          )}
        </div>

        {isFarmerView ? (
          <button
            onClick={() => onRecommend && onRecommend(job)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
            <span>{t('dashboards.farmer.aiRecTitle')}</span>
          </button>
        ) : (
          <button
            onClick={() => onApply && onApply(job)}
            className="px-4 py-1.5 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
          >
            {t('dashboards.common.apply')}
          </button>
        )}
      </div>

    </div>
  );
}
