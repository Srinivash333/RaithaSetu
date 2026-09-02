import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Building2, MapPin, Phone, Scale, Clock, ShoppingBag, 
  CheckCircle, ArrowLeft, ShieldCheck, Tag, PlusCircle
} from 'lucide-react';

export default function SingleTraderPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [traderData, setTraderData] = useState(null);
  const [traderReqs, setTraderReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraderDetails();
  }, [id]);

  const fetchTraderDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getTraderById(id);
      if (data.success) {
        setTraderData(data.trader);
      }

      const reqRes = await api.getTraderRequirements({ traderId: id });
      if (reqRes.success) {
        setTraderReqs(reqRes.requirements || []);
      }
    } catch (err) {
      console.error('Error loading specific trader profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-gray-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!traderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-gray-500 space-y-4">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="font-bold text-gray-700">{t('common.na')}</p>
        <Link to="/traders" className="text-agri-700 font-extrabold hover:underline">
          ← {t('common.back')} {t('trader.browseTraders')}
        </Link>
      </div>
    );
  }

  const isOpen = traderData.businessStatus !== 'closed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* BACK BUTTON */}
      <div>
        <Link to="/traders" className="inline-flex items-center text-xs font-bold text-agri-800 hover:underline space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} {t('trader.browseTraders')}</span>
        </Link>
      </div>

      {/* SPECIFIC TRADER BUSINESS PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-agri-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* TRADER COVER IMAGE */}
        <div className="md:col-span-5 h-64 md:h-auto relative bg-slate-900">
          <img
            src={traderData.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'}
            alt={traderData.businessName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md ${
              isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {isOpen ? `● ${t('status.open')}` : `○ ${t('status.closed')}`}
            </span>
          </div>
        </div>

        {/* TRADER DETAILS */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="bg-slate-900 text-white border border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> {t('trader.businessProfile')}
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center">
                <Scale className="w-3.5 h-3.5 mr-1" /> {t('trader.capacity')}: {traderData.purchaseCapacity}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{traderData.businessName}</h1>

            <p className="text-xs text-gray-600 leading-relaxed">
              {traderData.businessDescription}
            </p>

            {/* REAL TRADER SPECIFIC META INFO */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-agri-800 shrink-0" />
                <span>{t('trader.ownerName')}: <strong>{traderData.ownerName}</strong></span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-agri-800 shrink-0" />
                <span className="truncate">{t('common.location')}: <strong>{traderData.businessLocation}</strong></span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-agri-800 shrink-0" />
                <span>{t('common.phone')}: <strong>{traderData.contactNumber}</strong></span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-agri-800 shrink-0" />
                <span>{t('store.hoursLabel')} <strong>{traderData.openingHours}</strong></span>
              </div>
            </div>

            {/* TARGET COMMODITIES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">{t('trader.targetSourcingList')}</span>
              <div className="flex flex-wrap gap-1.5">
                {traderData.interestedCrops?.map((crop) => (
                  <span key={crop} className="bg-agri-100 text-agri-950 border border-agri-300 text-xs font-black px-3 py-1 rounded-xl">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-gray-600 font-semibold flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Verified Direct Crop Buyer • APMC Licensed
            </span>

            <a
              href={`tel:${traderData.contactNumber}`}
              className="bg-slate-900 hover:bg-black text-white font-black px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>📞 {traderData.contactNumber || 'Contact Trader'}</span>
            </a>
          </div>
        </div>

      </div>

      {/* TRADER'S ACTIVE SOURCING REQUIREMENTS */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-black text-gray-900 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <span>Active Sourcing Requirements ({traderReqs.length})</span>
        </h2>

        {traderReqs.length === 0 ? (
          <div className="p-8 bg-white text-center rounded-3xl border border-agri-200 text-xs text-gray-500">
            No active commodity sourcing requirements posted by this trader right now. You can call directly to negotiate crop sales.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {traderReqs.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-3xl border border-agri-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                    BUYING NOW
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    ₹{req.offeredPricePerUnit} / {req.unit}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-gray-900">{req.cropName}</h3>
                  <p className="text-xs font-bold text-gray-500">Variety: {req.variety}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Quantity Needed:</span>
                    <span className="font-black text-gray-900">{req.quantityNeeded} {req.unit}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Preferred Location:</span>
                    <span className="font-bold text-gray-800 truncate max-w-[140px]">{req.preferredLocation}</span>
                  </div>
                </div>

                {user?.role === 'farmer' && (
                  <Link
                    to="/farmer-dashboard"
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <span>Sell Crop to Trader →</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
