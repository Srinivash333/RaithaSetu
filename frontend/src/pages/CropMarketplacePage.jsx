import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NegotiationModal from '../components/NegotiationModal';
import { 
  ShoppingBag, MapPin, Search, Scale, Building2, Tag, 
  Phone, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CropMarketplacePage() {
  const { t } = useLanguage();
  const { coords } = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('crops'); // 'crops' or 'requirements'
  const [crops, setCrops] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState('');

  // Negotiation Modal
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [dealSuccessMsg, setDealSuccessMsg] = useState('');

  useEffect(() => {
    if (activeTab === 'crops') {
      fetchCrops();
    } else {
      fetchRequirements();
    }
  }, [activeTab, searchQuery, maxDistance]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = {
        latitude: coords.latitude,
        longitude: coords.longitude
      };
      if (searchQuery) params.cropName = searchQuery;
      if (maxDistance) params.maxDistanceKm = maxDistance;

      const data = await api.getCropListings(params);
      if (data.success) {
        setCrops(data.listings || []);
      }
    } catch (err) {
      console.error('Error fetching crop listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.cropName = searchQuery;

      const data = await api.getTraderRequirements(params);
      if (data.success) {
        setRequirements(data.requirements || []);
      }
    } catch (err) {
      console.error('Error fetching trader requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNegotiation = (crop) => {
    setSelectedCrop(crop);
    setShowNegotiateModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-agri-900 via-agri-950 to-emerald-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center">
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> {t('nav.marketplace')}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('marketplace.title')}</h1>
          <p className="text-xs text-agri-200 leading-relaxed">
            {t('marketplace.subtitle')}
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="relative w-full md:w-80 relative z-10 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-agri-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {activeTab === 'crops' && (
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white font-semibold focus:outline-none"
            >
              <option value="" className="text-gray-900">{t('marketplace.filterByDistance')} {t('marketplace.allDistance')}</option>
              <option value="10" className="text-gray-900">Within 10 km</option>
              <option value="25" className="text-gray-900">Within 25 km</option>
              <option value="50" className="text-gray-900">Within 50 km</option>
              <option value="100" className="text-gray-900">Within 100 km</option>
            </select>
          )}
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {dealSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{dealSuccessMsg}</span>
          </div>
          <button onClick={() => setDealSuccessMsg('')} className="text-emerald-700 hover:underline text-[11px]">
            {t('common.close')}
          </button>
        </div>
      )}

      {/* MARKETPLACE NAVIGATION TABS */}
      <div className="flex border-b border-agri-200 space-x-4">
        <button
          onClick={() => setActiveTab('crops')}
          className={`pb-3 text-xs font-black transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === 'crops'
              ? 'border-emerald-600 text-emerald-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('traderMarketplace.tabCropListings')} ({crops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`pb-3 text-xs font-black transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === 'requirements'
              ? 'border-emerald-600 text-emerald-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('traderMarketplace.tabTraderRequirements')} ({requirements.length})</span>
        </button>
      </div>

      {/* TAB 1: FARMER CROPS FOR SALE */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              {t('traderMarketplace.cropListingsTitle')} • {t('traderMarketplace.partialSaleNotice')}
            </p>
            {user?.role === 'farmer' && (
              <Link
                to="/farmer-dashboard"
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('traderMarketplace.postCropBtn')}</span>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
              {t('common.loading')}
            </div>
          ) : crops.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-agri-200 text-xs space-y-2">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">{t('common.na')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((c) => {
                const remainingQty = (c.quantity || 0) - (c.soldQuantity || 0);
                const isSold = c.status === 'sold' || remainingQty <= 0;

                return (
                  <div key={c._id} className="bg-white rounded-3xl border border-agri-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    
                    {/* CROP COVER IMAGE */}
                    <div className="h-44 relative bg-gray-100">
                      <img
                        src={c.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                        alt={c.cropName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                          isSold ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {isSold ? '○ SOLD OUT' : '● AVAILABLE FOR BUYING'}
                        </span>

                        {c.distanceKm !== undefined && (
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-emerald-400" /> {c.distanceKm} km
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-black text-lg leading-snug">{c.cropName}</h3>
                        <p className="text-[11px] text-emerald-200 font-semibold">
                          Variety: {c.variety || 'Standard'} • Harvested: {new Date(c.harvestDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline pt-1">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('marketplace.quantity')}</span>
                            <span className="font-extrabold text-sm text-gray-900">{remainingQty} / {c.quantity} {c.unit}s</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t('marketplace.pricePerUnit')}</span>
                            <span className="font-black text-emerald-800 text-base">₹{c.expectedPricePerUnit} / {c.unit}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {c.description || 'Fresh direct farm produce available for direct procurement.'}
                        </p>

                        <div className="text-xs text-gray-700 space-y-1 pt-1 border-t border-gray-100">
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-agri-600 shrink-0" />
                            <span className="truncate">{c.locationName || 'Farm Location'}</span>
                          </div>
                          <div className="flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                            <span>Farmer: <strong>{c.farmerId?.name || 'Verified Farmer'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTON */}
                      <div className="pt-3 border-t border-agri-100 flex items-center justify-between">
                        {user?.role === 'trader' ? (
                          <button
                            disabled={isSold}
                            onClick={() => handleOpenNegotiation(c)}
                            className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-sm ${
                              isSold
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            }`}
                          >
                            <Scale className="w-4 h-4" />
                            <span>{isSold ? 'Sold Out' : t('traderMarketplace.makePriceOffer')}</span>
                          </button>
                        ) : (
                          <Link
                            to="/register?role=trader"
                            className="w-full text-center bg-agri-800 hover:bg-agri-900 text-white text-xs font-bold py-2.5 rounded-xl transition"
                          >
                            Trader Login to Buy / Make Offer →
                          </Link>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRADER BUYING REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              {t('traderMarketplace.traderReqsTitle')}
            </p>
            {user?.role === 'trader' && (
              <Link
                to="/trader-dashboard"
                className="bg-slate-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('traderMarketplace.postReqBtn')}</span>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
              {t('common.loading')}
            </div>
          ) : requirements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-agri-200 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">{t('common.na')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req) => (
                <div key={req._id} className="bg-white rounded-3xl border border-agri-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                        BUYING REQUIREMENT
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                        ₹{req.offeredPricePerUnit} / {req.unit}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-900">{req.cropName}</h3>
                      <p className="text-xs font-bold text-gray-500">Variety: {req.variety || 'Standard'}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">{t('traderMarketplace.quantityNeeded')}:</span>
                        <span className="font-black text-gray-900">{req.quantityNeeded} {req.unit}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">{t('traderMarketplace.preferredLocation')}:</span>
                        <span className="font-bold text-gray-800 truncate max-w-[150px]">{req.preferredLocation}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                        <span className="text-gray-500 font-semibold">{t('trader.businessName')}:</span>
                        <span className="font-black text-emerald-950">{req.businessName}</span>
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {req.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-agri-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${req.contactNumber || '+919945001122'}`}
                      className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-black py-2.5 rounded-xl transition flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{t('common.contact')}</span>
                    </a>

                    <Link
                      to={`/traders/${req.traderId?._id || req.traderId}`}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold px-3 py-2.5 rounded-xl transition"
                    >
                      Profile →
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEGOTIATION MODAL */}
      <NegotiationModal
        isOpen={showNegotiateModal}
        onClose={() => setShowNegotiateModal(false)}
        cropListing={selectedCrop}
        onDealSuccess={(msg) => setDealSuccessMsg(msg)}
      />

    </div>
  );
}
