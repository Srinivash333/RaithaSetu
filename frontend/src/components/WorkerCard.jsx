import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Rating from './Rating';
import { MapPin, Sparkles, CheckCircle, Phone, MessageSquare, Send, User, ShieldCheck } from 'lucide-react';

export default function WorkerCard({
  worker,
  profile,
  matchPercentage = 85,
  distanceKm = 2.4,
  breakdown = {},
  explanation = '',
  onAskQuestion,
  onSendOffer,
  offerSent = false
}) {
  const { t } = useLanguage();
  const name = worker?.name || 'Agricultural Worker';
  const phone = worker?.phone || worker?.mobileNumber || '+91 9845012345';
  const rating = profile?.ratingAverage || 4.8;
  const ratingCount = profile?.ratingCount || 12;
  const isAvailable = profile?.isAvailable !== false;
  const skills = profile?.skills?.length ? profile.skills : ['Harvesting', 'Pesticide Spraying'];
  const experienceYears = profile?.experienceYears || 2;
  const wage = profile?.expectedWagePerDay || 650;
  const avatarUrl = worker?.avatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80`;

  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-agri-200 p-5 shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden flex flex-col justify-between">
      
      <div className="space-y-3">
        {/* HEADER: AVATAR, NAME, RATING & MATCH BADGE */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-agri-100 border border-agri-200 shrink-0 relative">
              {imgErr ? (
                <div className="w-full h-full bg-agri-800 text-white font-black flex items-center justify-center text-lg">
                  {name.charAt(0)}
                </div>
              ) : (
                <img
                  src={avatarUrl}
                  alt={name}
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{name}</h4>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 mt-0.5">
                <Rating value={rating} />
                <span className="text-[11px]">({ratingCount})</span>
                <span>•</span>
                <span className="flex items-center text-agri-700 font-semibold text-[11px]">
                  <MapPin className="w-3 h-3 mr-0.5 shrink-0" />
                  {distanceKm !== undefined ? `${distanceKm} ${t('recCard.away')}` : t('location.unavailable')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
            <span>{matchPercentage}% {t('recCard.match')}</span>
          </div>
        </div>

        {/* MATCH REASON EXPLANATION */}
        {explanation && (
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-extrabold text-emerald-950 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current" />
              <span>{t('recCard.whyRecommended')}:</span>
            </div>
            <p className="text-emerald-900 leading-relaxed text-[11px] font-medium italic">
              "{explanation}"
            </p>
          </div>
        )}

        {/* DETAILS GRID */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('recCard.skills')}</span>
            <span className="text-gray-900 font-bold truncate block">{skills.slice(0, 2).join(', ')}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Experience</span>
            <span className="text-gray-900 font-bold">{experienceYears} {experienceYears === 1 ? 'Year' : 'Years'}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('recCard.expectedWage')}</span>
            <span className="text-emerald-800 font-black">₹{wage} / day</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Availability</span>
            <span className="text-emerald-700 font-bold uppercase text-[10px]">● {isAvailable ? 'Available Now' : 'Busy'}</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="pt-3 border-t border-agri-100 grid grid-cols-3 gap-2">
        {/* ASK QUESTION */}
        {onAskQuestion && (
          <button
            type="button"
            onClick={() => onAskQuestion(worker)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
            <span className="truncate">{t('workforce.askQuestion')}</span>
          </button>
        )}

        {/* CONTACT WORKER */}
        <a
          href={`tel:${phone}`}
          className="bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="truncate">{t('workforce.contactWorker')}</span>
        </a>

        {/* SEND OFFER */}
        {onSendOffer && (
          <button
            type="button"
            disabled={offerSent}
            onClick={() => onSendOffer(worker)}
            className={`font-black py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm ${
              offerSent
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="truncate">{offerSent ? t('workforce.offerSent') : t('workforce.sendOffer')}</span>
          </button>
        )}
      </div>

    </div>
  );
}
