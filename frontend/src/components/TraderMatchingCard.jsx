import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Rating from './Rating';
import { MapPin, Sparkles, Phone, MessageSquare, Send, Building2, ShieldCheck, Tag } from 'lucide-react';
import { translateCropList, translateCrop } from '../utils/cropTranslations';

export default function TraderMatchingCard({
  trader,
  matchScore = 90,
  distanceKm = 8.2,
  requirement = null,
  explanation = '',
  onViewShop,
  onAskQuestion,
  onSendCropOffer,
  offerSent = false
}) {
  const { t, language } = useLanguage();
  const businessName = trader.businessName || 'APMC Crop Buyer';
  const ownerName = trader.ownerName || trader.name || 'APMC Buyer';
  const phone = trader.contactNumber || trader.phone || '+91 9845012345';
  const rating = trader.ratingAverage || 4.7;
  const ratingCount = trader.ratingCount || 15;
  const image = trader.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80';
  const interestedCrops = trader.interestedCrops?.length ? trader.interestedCrops : ['Tomatoes', 'Paddy', 'Vegetables'];

  const [imgErr, setImgErr] = useState(false);

  const displayDistance = language === 'kn' ? `${distanceKm} ಕಿಮೀ ದೂರ` : `${distanceKm} km away`;
  const displayMatch = language === 'kn' ? `${matchScore}% ಹೊಂದಾಣಿಕೆ` : `${matchScore}% Match`;
  const displayInterestedCrops = translateCropList(interestedCrops, language);

  let displayExplanation = explanation;
  if (language === 'kn' && explanation) {
    displayExplanation = `${businessName} ಸಂಸ್ಥೆಯು ಈ ಬೆಳೆಯನ್ನು ಖರೀದಿಸಲು ಅಪೇಕ್ಷಿಸುತ್ತಿದ್ದಾರೆ, ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣವನ್ನು ಸ್ವೀಕರಿಸುತ್ತಾರೆ, ಮತ್ತು ನಿಮ್ಮ ಫಾರ್ಮ್‌ನಿಂದ ${distanceKm} ಕಿಮೀ ದೂರದಲ್ಲಿದ್ದಾರೆ.`;
  }

  return (
    <div className="bg-white rounded-3xl border border-agri-200 p-5 shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden flex flex-col justify-between">
      
      <div className="space-y-3">
        {/* HEADER: IMAGE, SHOP NAME, RATING & MATCH BADGE */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative">
              {imgErr ? (
                <div className="w-full h-full bg-slate-900 text-white font-black flex items-center justify-center text-lg">
                  {businessName.charAt(0)}
                </div>
              ) : (
                <img
                  src={image}
                  alt={businessName}
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h4 className="font-black text-sm text-gray-900 leading-snug">{businessName}</h4>
              <p className="text-[11px] text-gray-500 font-semibold">{ownerName}</p>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 mt-0.5">
                <Rating value={rating} />
                <span className="text-[11px]">({ratingCount})</span>
                <span>•</span>
                <span className="flex items-center text-emerald-800 font-bold text-[11px]">
                  <MapPin className="w-3 h-3 mr-0.5 shrink-0" />
                  {displayDistance}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-current" />
            <span>{displayMatch}</span>
          </div>
        </div>

        {/* NATURAL LANGUAGE MATCH REASON */}
        {explanation && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center space-x-1 font-extrabold text-gray-900 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current" />
              <span>{t('farmer.whyRecommended') || 'Why Recommended:'}</span>
            </div>
            <p className="text-gray-700 leading-relaxed text-[11px] font-medium italic">
              "{displayExplanation}"
            </p>
          </div>
        )}

        {/* TRADER REQUIREMENT / CROPS LOOKING FOR */}
        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs space-y-1.5 font-semibold">
          <div className="flex justify-between items-center text-emerald-950">
            <span className="text-[10px] uppercase font-black text-emerald-800">{t('farmer.cropsLookingFor') || 'Crops Looking For:'}</span>
            {requirement && (
              <span className="font-black text-emerald-900">
                ₹{requirement.offeredPricePerUnit} / {requirement.unit}
              </span>
            )}
          </div>

          <p className="font-extrabold text-gray-900">
            {requirement ? `${translateCrop(requirement.cropName, language)} (${requirement.variety || 'Standard'}) — Need ${requirement.quantityNeeded} ${requirement.unit}s` : displayInterestedCrops}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS (4 ACTIONS) */}
      <div className="pt-3 border-t border-agri-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* VIEW TRADER SHOP */}
        <button
          type="button"
          onClick={() => onViewShop && onViewShop(trader)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">{t('farmer.viewShop') || 'View Shop'}</span>
        </button>

        {/* ASK QUESTION */}
        <button
          type="button"
          onClick={() => onAskQuestion && onAskQuestion(trader)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="truncate">{t('farmer.askQuestion') || 'Ask Question'}</span>
        </button>

        {/* CONTACT TRADER */}
        <a
          href={`tel:${phone}`}
          className="bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="truncate">{t('farmer.contact') || 'Contact'}</span>
        </a>

        {/* SEND CROP OFFER */}
        <button
          type="button"
          disabled={offerSent}
          onClick={() => onSendCropOffer && onSendCropOffer(trader)}
          className={`font-black py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm ${
            offerSent
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="truncate">{offerSent ? (t('farmer.offerSentDone') || '✓ Offer Sent') : (t('farmer.sendOffer') || 'Send Offer')}</span>
        </button>
      </div>

    </div>
  );
}
