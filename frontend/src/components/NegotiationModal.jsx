import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, CheckCircle, Scale, MessageSquare, History, 
  Send, XCircle, AlertCircle, ArrowRight, ShieldCheck
} from 'lucide-react';

export default function NegotiationModal({ isOpen, onClose, negotiationId, cropListing, onDealSuccess }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  const [negotiation, setNegotiation] = useState(null);
  const [aiGuidance, setAiGuidance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [counterPrice, setCounterPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (negotiationId) {
        fetchNegotiationDetails();
      } else if (cropListing) {
        setCounterPrice(cropListing.expectedPricePerUnit ? Math.round(cropListing.expectedPricePerUnit * 0.9) : '');
        setLoading(false);
      }
    }
  }, [isOpen, negotiationId, cropListing]);

  const fetchNegotiationDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getNegotiationById(token, negotiationId);
      if (data.success) {
        setNegotiation(data.negotiation);
        setCounterPrice(data.negotiation.currentPrice || '');
        fetchAIGuidance(data.negotiation._id);
      }
    } catch (err) {
      console.error('Error fetching negotiation:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIGuidance = async (negId) => {
    try {
      const data = await api.getAIGuidance(token, negId);
      if (data.success) {
        setAiGuidance(data.guidance);
      }
    } catch (err) {
      console.error('Error fetching AI guidance:', err);
    }
  };

  // 1. Initial Offer Submission (Trader -> Farmer)
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!counterPrice || !cropListing) return;
    setSubmitting(true);
    try {
      const data = await api.createOffer(token, {
        cropListingId: cropListing._id,
        pricePerUnit: Number(counterPrice),
        message: offerMessage || `Offered ₹${counterPrice}/${cropListing.unit}`
      });
      if (data.success) {
        if (onDealSuccess) onDealSuccess(t('messages.offerSent'));
        onClose();
      }
    } catch (err) {
      console.error('Error creating offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Counter Offer Submission
  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterPrice || !negotiation) return;
    setSubmitting(true);
    try {
      const data = await api.counterOffer(token, negotiation._id, {
        counterPricePerUnit: Number(counterPrice),
        message: offerMessage || `Counter-offer of ₹${counterPrice}/${negotiation.unit}`
      });
      if (data.success) {
        setOfferMessage('');
        fetchNegotiationDetails();
      }
    } catch (err) {
      console.error('Error submitting counter offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Accept Offer & Confirm Deal
  const handleAcceptOffer = async () => {
    if (!negotiation) return;
    setSubmitting(true);
    try {
      const data = await api.acceptOffer(token, negotiation._id);
      if (data.success) {
        setNegotiation(data.negotiation);
        if (onDealSuccess) onDealSuccess(`${t('negotiation.dealConfirmed')} for ${negotiation.cropListingId?.cropName || 'crop'}!`);
      }
    } catch (err) {
      console.error('Error accepting deal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const crop = negotiation?.cropListingId || cropListing;
  const isTrader = user?.role === 'trader';
  const isFarmer = user?.role === 'farmer';
  const isConfirmed = negotiation?.dealConfirmed || negotiation?.status === 'accepted';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isConfirmed ? `🤝 ${t('negotiation.dealConfirmed')}` : t('negotiation.negotiationTitle')}>
      <div className="space-y-5 text-xs animate-fade-in">
        
        {/* CROP BATCH INFORMATION CARD */}
        {crop && (
          <div className="bg-agri-50 border border-agri-200 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase bg-agri-600 text-white px-2 py-0.5 rounded">
                  {t('trader.cropDetails')}
                </span>
                <h3 className="text-base font-black text-agri-950 mt-1">{crop.cropName}</h3>
                <p className="text-[11px] text-gray-600">
                  {t('common.quantity')}: <strong>{negotiation?.quantity || crop.quantity} {negotiation?.unit || crop.unit}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('negotiation.farmerAskingPrice')}</span>
                <span className="text-base font-black text-agri-950">
                  ₹{negotiation?.initialAskingPrice || crop.expectedPricePerUnit} <span className="text-xs font-normal text-gray-500">/ {negotiation?.unit || crop.unit}</span>
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {t('common.total')}: ₹{((negotiation?.initialAskingPrice || crop.expectedPricePerUnit) * (negotiation?.quantity || crop.quantity)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DEAL CONFIRMED BANNER */}
        {isConfirmed && (
          <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-2xl space-y-3 text-emerald-950 shadow-md">
            <div className="flex items-center space-x-2 text-emerald-800 font-black text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>{t('negotiation.contractRecorded')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-emerald-200 pt-3">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('negotiation.finalPrice')}</span>
                <span className="font-black text-emerald-900 text-base">₹{negotiation.currentPrice} / {negotiation.unit}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('negotiation.totalAmount')}</span>
                <span className="font-black text-emerald-900 text-base">₹{negotiation.finalTotalAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('trader.businessName')}</span>
                <span className="font-bold">{negotiation.traderBusinessName || 'Wholesale Trader'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold block">{t('common.status')}</span>
                <span className="font-extrabold text-emerald-800 uppercase">{t('trader.payOffline')}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
              {t('negotiation.dealSavedNotice')}
            </p>
          </div>
        )}

        {/* AI PRICE NEGOTIATION GUIDANCE BOX */}
        {aiGuidance && !isConfirmed && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('ai.aiPriceGuidance')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950 font-semibold">
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">{t('ai.suggestedCounter')}</span>
                <span className="font-black text-amber-900 text-sm">₹{aiGuidance.suggestedCounterPrice} / {aiGuidance.unit}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">{t('ai.suggestedRange')}</span>
                <span className="font-black text-amber-900 text-xs">{aiGuidance.suggestedRange}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-900 leading-relaxed font-semibold bg-white/60 p-2.5 rounded-xl border border-amber-200/60">
              💡 {aiGuidance.recommendation}
            </p>

            <p className="text-[10px] text-gray-500 italic">
              {t('ai.insufficientData')}
            </p>
          </div>
        )}

        {/* STRUCTURED OFFER HISTORY TIMELINE (NEVER OVERWRITTEN) */}
        {negotiation?.offerHistory?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-gray-900 flex items-center space-x-1.5 text-xs">
              <History className="w-4 h-4 text-agri-600" />
              <span>{t('negotiation.historyCount', { count: negotiation.offerHistory.length })}</span>
            </h4>

            <div className="bg-white border border-gray-200 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2">
              {negotiation.offerHistory.map((item, idx) => {
                const isItemTrader = item.offeredBy === 'trader';
                return (
                  <div
                    key={item._id || idx}
                    className={`p-2.5 rounded-xl text-xs space-y-1 border ${
                      isItemTrader
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950 ml-2'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 mr-2'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[11px]">
                        {isItemTrader ? `🔷 ${t('negotiation.traderOffer')}` : `🌾 ${t('negotiation.counterOffer')}`}
                      </span>
                      <span className="font-black text-xs">
                        ₹{item.pricePerUnit} / {negotiation.unit} ({t('common.total')}: ₹{item.totalAmount?.toLocaleString()})
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-[11px] italic text-gray-700">"{item.message}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTION FORM FOR SUBMITTING OFFER OR COUNTER-OFFER */}
        {!isConfirmed && (
          <div className="pt-2 border-t border-agri-100 space-y-3">
            {!negotiation ? (
              /* 1. INITIAL OFFER FORM (TRADER) */
              <form onSubmit={handleCreateOffer} className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('trader.makeOffer')} (₹/{crop?.unit})</label>
                  <input
                    type="number"
                    required
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder={`Asking: ₹${crop?.expectedPricePerUnit}`}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('common.note')}</label>
                  <input
                    type="text"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="e.g. Ready to pick up from APMC yard."
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>

                <Button type="submit" loading={submitting} fullWidth={true} variant="primary">
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>{t('trader.makeOffer')}</span>
                </Button>
              </form>
            ) : (
              /* 2. COUNTER OFFER OR ACCEPT DEAL FORM */
              <div className="space-y-3">
                
                {/* COUNTER OFFER INPUT */}
                <form onSubmit={handleCounterOffer} className="space-y-2 bg-agri-50/60 p-3 rounded-2xl border border-agri-200">
                  <span className="font-extrabold text-agri-950 block text-xs">{t('trader.counterOffer')}:</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      placeholder="₹/unit..."
                      className="w-36 border border-gray-300 rounded-xl px-3 py-2 font-bold text-xs"
                    />
                    <input
                      type="text"
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder={t('common.note')}
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 font-semibold text-xs"
                    />
                    <Button type="submit" loading={submitting} variant="secondary" size="sm">
                      {t('common.submit')}
                    </Button>
                  </div>
                </form>

                {/* ACCEPT OFFER & CONFIRM DEAL BUTTON */}
                <Button
                  type="button"
                  loading={submitting}
                  onClick={handleAcceptOffer}
                  fullWidth={true}
                  variant="primary"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 text-sm"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>{t('negotiation.acceptPrompt', { price: negotiation.currentPrice, unit: negotiation.unit })}</span>
                </Button>

              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}
