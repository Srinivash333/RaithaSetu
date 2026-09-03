import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Rating from './Rating';
import { MapPin, Sparkles, Phone, MessageSquare, Building2, ShieldCheck, MessageCircle } from 'lucide-react';
import { translateCropList, translateCrop } from '../utils/cropTranslations';
import { getDisplayPhone } from '../utils/whatsappUtils';

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
  const businessName = trader?.businessName || 'APMC Crop Buyer';
  const ownerName = trader?.ownerName || trader?.name || 'APMC Buyer';
  const rawPhone = trader?.contactNumber || trader?.phone || trader?.mobileNumber || trader?.userId?.phone;
  const displayPhone = rawPhone ? getDisplayPhone(rawPhone) : '';

  const rating = trader?.ratingAverage || 4.7;
  const ratingCount = trader?.ratingCount || 15;
  const image = trader?.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80';
  const interestedCrops = trader?.interestedCrops?.length ? trader.interestedCrops : ['Tomatoes', 'Paddy', 'Vegetables'];

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
        {/* HEADER: IMAGE, SHOP NAME, RATING, PHONE & MATCH BADGE */}
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

              <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-0.5">
                <Rating value={rating} />
                <span className="text-[11px] font-semibold">({ratingCount})</span>
                <span>•</span>
              </div>

              {displayPhone ? (
                <div className="pt-0.5">
                  <div className="text-xs font-black text-gray-900 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{displayPhone}</span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium block">
                    Registered Mobile Number
                  </span>
                </div>
              ) : (
                <div className="pt-0.5">
                  <span className="text-[11px] font-bold text-red-500">Phone number not available</span>
                </div>
              )}

              <div className="flex items-center text-emerald-800 font-bold text-[11px] mt-1">
                <MapPin className="w-3 h-3 mr-0.5 shrink-0" />
                <span>{displayDistance}</span>
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

      {/* ACTION BUTTONS & FOOTNOTE */}
      <div className="pt-3 border-t border-agri-100 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* VIEW TRADER SHOP */}
          <button
            type="button"
            onClick={() => onViewShop && onViewShop(trader)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2.5 px-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('farmer.viewShop') || 'View Shop'}</span>
          </button>

          {/* ASK QUESTION */}
          <button
            type="button"
            onClick={() => onAskQuestion && onAskQuestion(trader)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2.5 px-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>{t('farmer.askQuestion') || 'Ask Question'}</span>
          </button>

          {/* SEND CROP OFFER VIA WHATSAPP */}
          <button
            type="button"
            disabled={offerSent}
            onClick={() => onSendCropOffer && onSendCropOffer(trader)}
            className={`font-black py-2.5 px-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm ${
              offerSent
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300 fill-current shrink-0" />
            <span>{offerSent ? (t('farmer.offerSentDone') || '✓ Offer Sent') : 'Send Offer via WhatsApp'}</span>
          </button>
        </div>

        <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center space-x-1 pt-0.5">
          <ShieldCheck className="w-3 h-3 text-gray-400 shrink-0" />
          <span>Opens WhatsApp with a pre-filled crop offer message to this trader.</span>
        </div>
      </div>

    </div>
  );
}
