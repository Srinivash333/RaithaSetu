import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import DashboardLayout from '../layouts/DashboardLayout';
import CropCard from '../components/CropCard';
import FilterPanel from '../components/FilterPanel';
import Modal from '../components/Modal';
import Button from '../components/Button';
import NegotiationModal from '../components/NegotiationModal';
import { api } from '../services/api';
import { 
  ShoppingBag, CheckCircle, Store, Building2, MapPin, 
  TrendingUp, PackageCheck, Truck, ShieldCheck, Scale, 
  Search, RefreshCw, PlusCircle, Trash2, MessageSquare, Star
} from 'lucide-react';

export default function TraderDashboard() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { coords } = useLocation();

  const [traderProfile, setTraderProfile] = useState(null);
  const [crops, setCrops] = useState([]);
  const [myRequirements, setMyRequirements] = useState([]);
  const [myNegotiations, setMyNegotiations] = useState([]);
  const [myProcurementOrders, setMyProcurementOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'listings' | 'requirements' | 'negotiations' | 'procurements'
  const [activeTab, setActiveTab] = useState('listings');

  // Search & Filters
  const [filterCrop, setFilterCrop] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);

  // Post Sourcing Requirement Modal State
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqCropName, setReqCropName] = useState('Paddy');
  const [reqVariety, setReqVariety] = useState('RNR 15048');
  const [reqQuantity, setReqQuantity] = useState(50);
  const [reqUnit, setReqUnit] = useState('quintal');
  const [reqPrice, setReqPrice] = useState(2400);
  const [reqLocation, setReqLocation] = useState(user?.address || 'Mandya APMC Yard');
  const [reqDescription, setReqDescription] = useState('Urgent wholesale procurement for mill dispatch.');
  const [postingReq, setPostingReq] = useState(false);

  // Negotiation & Deal Modals
  const [selectedNegotiationId, setSelectedNegotiationId] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState(null);
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchTraderData();
  }, [filterCrop, maxDistanceKm]);

  const fetchTraderData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const userRes = await api.getMe(token);
      if (userRes.success && userRes.profile) {
        setTraderProfile(userRes.profile);
      }

      // 2. Fetch Direct Crop Listings
      const cropRes = await api.getCropListings({
        cropName: filterCrop,
        maxDistanceKm,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      if (cropRes.success) {
        setCrops(cropRes.listings || []);
      }

      // 3. Fetch Trader's Own Sourcing Requirements
      const reqRes = await api.getTraderRequirements({ traderId: user._id });
      if (reqRes.success) {
        setMyRequirements(reqRes.requirements || []);
      }

      // 4. Fetch Negotiations
      const negRes = await api.getMyNegotiations(token);
      if (negRes.success) {
        setMyNegotiations(negRes.negotiations || []);
      }

      // 5. Fetch Confirmed Procurement Orders
      const orderRes = await api.getMyOrders(token);
      if (orderRes.success) {
        setMyProcurementOrders(orderRes.orders || []);
      }
    } catch (err) {
      console.error('Error fetching trader data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create Trader Sourcing Requirement
  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!reqCropName || !reqQuantity || !reqPrice) return;
    setPostingReq(true);
    try {
      const data = await api.createTraderRequirement(token, {
        cropName: reqCropName.trim(),
        variety: reqVariety.trim(),
        quantityNeeded: Number(reqQuantity),
        unit: reqUnit,
        offeredPricePerUnit: Number(reqPrice),
        preferredLocation: reqLocation.trim(),
        description: reqDescription.trim()
      });

      if (data.success) {
        setShowReqModal(false);
        setStatusSuccessMsg('Sourcing requirement posted successfully!');
        fetchTraderData();
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error creating requirement:', err);
    } finally {
      setPostingReq(false);
    }
  };

  // Delete Sourcing Requirement
  const handleDeleteRequirement = async (reqId) => {
    try {
      const data = await api.deleteTraderRequirement(token, reqId);
      if (data.success) {
        fetchTraderData();
      }
    } catch (err) {
      console.error('Error deleting requirement:', err);
    }
  };

  // Open Negotiation
  const handleOpenCropNegotiation = (crop) => {
    setSelectedCrop(crop);
    setSelectedNegotiationId(null);
    setShowNegotiateModal(true);
  };

  const handleOpenExistingNegotiation = (negId) => {
    setSelectedNegotiationId(negId);
    setSelectedCrop(null);
    setShowNegotiateModal(true);
  };

  // Submit Mutual Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTargetId || !reviewTransactionId) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetId: reviewTargetId,
          targetRole: 'farmer',
          transactionType: 'crop_order',
          transactionId: reviewTransactionId,
          rating: Number(reviewRating),
          comment: reviewComment.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewModal(false);
        setStatusSuccessMsg('Farmer review submitted successfully!');
        fetchTraderData();
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const businessName = traderProfile?.businessName || user?.businessName || `${user?.name || 'Karnataka'} APMC Trading Co.`;
  const purchaseCapacity = traderProfile?.purchaseCapacity || 'High (50+ Quintals)';
  const interestedCrops = traderProfile?.interestedCrops?.length ? traderProfile.interestedCrops : ['Paddy', 'Sugarcane', 'Tomato', 'Maize'];
  
  const totalQuintalsSourced = myProcurementOrders.reduce((acc, o) => {
    const qty = o.items?.[0]?.quantity || 0;
    return acc + qty;
  }, 0);
  const totalProcurementSpend = myProcurementOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* TRADER HEADER BANNER */}
        <div className="bg-gradient-to-br from-agri-950 via-slate-900 to-agri-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-agri-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-agri-500/20 text-agri-300 border border-agri-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1" /> Licensed APMC Wholesale Trader
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center">
                  <Scale className="w-3.5 h-3.5 mr-1" /> {t('trader.capacity')}: {purchaseCapacity}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-agri-900 tracking-tight">{businessName}</h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-agri-200">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-agri-400 shrink-0" />
                  {user?.address || 'Mysuru Wholesale APMC Complex, Karnataka'}
                </span>
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-agri-400 shrink-0" />
                  Direct Farmer Sourcing Protocol Active
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => setShowReqModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl transition flex items-center space-x-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('traderMarketplace.postReqBtn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">Farmer Listings</span>
              <ShoppingBag className="w-4 h-4 text-agri-600" />
            </div>
            <p className="text-2xl font-black text-agri-950">{crops.length}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Available for offer</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">My Requirements</span>
              <Building2 className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-2xl font-black text-slate-900">{myRequirements.length}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Broadcast to farmers</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">Active Negotiations</span>
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-700">{myNegotiations.length}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Price offers pending</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">Confirmed Deals</span>
              <PackageCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">{myProcurementOrders.length}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Purchased contracts</p>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {statusSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-black flex items-center space-x-3 shadow-md animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusSuccessMsg}</span>
          </div>
        )}

        {/* TABS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-agri-200 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'listings' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Farmer Crop Listings ({crops.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'requirements' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>My Sourcing Needs ({myRequirements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('negotiations')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'negotiations' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Negotiations & Offers ({myNegotiations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('procurements')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'procurements' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirmed Deals ({myProcurementOrders.length})</span>
            </button>
          </div>

          {/* TAB 1: FARMER CROPS */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <FilterPanel
                searchQuery={filterCrop}
                onSearchChange={(q) => setFilterCrop(q)}
                maxDistanceKm={maxDistanceKm}
                onDistanceChange={(d) => setMaxDistanceKm(d)}
              />

              {loading ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
                  {t('common.loading')}
                </div>
              ) : crops.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
                  No crops found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((c) => (
                    <CropCard
                      key={c._id}
                      crop={c}
                      onBuy={(cropItem) => handleOpenCropNegotiation(cropItem)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY SOURCING REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              {myRequirements.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200 space-y-3">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="font-bold">No active sourcing requirements posted.</p>
                  <button
                    onClick={() => setShowReqModal(true)}
                    className="bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    + Post Sourcing Requirement
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRequirements.map((r) => (
                    <div key={r._id} className="bg-white p-5 rounded-3xl border border-agri-200 shadow-sm space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-md">
                            ACTIVE REQUIREMENT
                          </span>
                          <h3 className="text-base font-black text-gray-900 mt-1">{r.cropName}</h3>
                          <p className="text-xs font-bold text-gray-500">Variety: {r.variety}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteRequirement(r._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Requirement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 font-semibold">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quantity Needed:</span>
                          <span className="font-black text-gray-900">{r.quantityNeeded} {r.unit}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Offered Price:</span>
                          <span className="font-black text-emerald-800">₹{r.offeredPricePerUnit} / {r.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-bold text-gray-800 truncate max-w-[140px]">{r.preferredLocation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEGOTIATIONS & OFFERS */}
          {activeTab === 'negotiations' && (
            <div className="space-y-3">
              {myNegotiations.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
                  No active negotiations or price offers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myNegotiations.map((n) => {
                    const isAccepted = n.status === 'accepted' || n.dealConfirmed;
                    return (
                      <div key={n._id} className="bg-white p-5 rounded-3xl border border-agri-200 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isAccepted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {isAccepted ? 'DEAL CONFIRMED 🤝' : `STATUS: ${n.status.toUpperCase()}`}
                              </span>
                              <h3 className="text-base font-black text-gray-900 mt-1">
                                {n.cropListingId?.cropName || 'Farm Crop'}
                              </h3>
                            </div>
                            <span className="text-sm font-black text-emerald-800">
                              ₹{n.currentPrice} / {n.unit}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-semibold">Asking Price:</span>
                              <span className="font-bold text-gray-800">₹{n.initialAskingPrice} / {n.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 font-semibold">Quantity:</span>
                              <span className="font-black text-gray-900">{n.quantity} {n.unit}s</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-1">
                              <span className="text-gray-500 font-semibold">Total Amount:</span>
                              <span className="font-black text-emerald-900">₹{n.finalTotalAmount?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenExistingNegotiation(n._id)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition flex items-center justify-center space-x-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>View Offer Timeline & Action →</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONFIRMED DEALS */}
          {activeTab === 'procurements' && (
            <div className="space-y-3">
              {myProcurementOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
                  No confirmed purchase deals.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myProcurementOrders.map((o) => (
                    <div key={o._id} className="bg-white p-5 rounded-3xl border border-agri-200 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                              CONFIRMED DEAL #{o._id.toString().slice(-6).toUpperCase()}
                            </span>
                            <h3 className="text-base font-black text-gray-900 mt-1">
                              {o.items?.[0]?.name || 'Farm Crop Procurement'}
                            </h3>
                          </div>
                          <span className="text-sm font-black text-emerald-800">
                            ₹{o.totalAmount?.toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-2xl text-xs space-y-1 text-emerald-950 font-semibold border border-emerald-200">
                          <div className="flex justify-between">
                            <span>Quantity Purchased:</span>
                            <span className="font-black">{o.items?.[0]?.quantity || 1} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Option:</span>
                            <span className="font-bold uppercase">{o.deliveryOption}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Status:</span>
                            <span className="font-bold uppercase">{o.paymentStatus}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewTargetId(o.sellerId?._id || o.sellerId);
                          setReviewTransactionId(o._id);
                          setShowReviewModal(true);
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Star className="w-4 h-4 fill-slate-950" />
                        <span>Rate & Review Farmer</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL: POST SOURCING REQUIREMENT */}
        <Modal
          isOpen={showReqModal}
          onClose={() => setShowReqModal(false)}
          title="📢 Post Commodity Buying Requirement"
        >
          <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Crop Name</label>
              <input
                type="text"
                required
                value={reqCropName}
                onChange={(e) => setReqCropName(e.target.value)}
                placeholder="e.g. Paddy, Tomato, Sugarcane, Maize"
                className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Variety</label>
                <input
                  type="text"
                  value={reqVariety}
                  onChange={(e) => setReqVariety(e.target.value)}
                  placeholder="e.g. RNR 15048, Sona Masoori"
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit</label>
                <select
                  value={reqUnit}
                  onChange={(e) => setReqUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="kg">Kg</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantity Needed</label>
                <input
                  type="number"
                  required
                  value={reqQuantity}
                  onChange={(e) => setReqQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Offered Price (₹/{reqUnit})</label>
                <input
                  type="number"
                  required
                  value={reqPrice}
                  onChange={(e) => setReqPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Preferred Sourcing Location</label>
              <input
                type="text"
                value={reqLocation}
                onChange={(e) => setReqLocation(e.target.value)}
                placeholder="e.g. Mandya, Mysuru APMC Yard"
                className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Special Procurement Instructions</label>
              <textarea
                rows={2}
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="e.g. Moisture content < 14%, immediate spot payment at APMC."
                className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
              />
            </div>

            <Button type="submit" loading={postingReq} fullWidth={true} variant="primary">
              Broadcast Sourcing Requirement to Farmers
            </Button>
          </form>
        </Modal>

        {/* MODAL: MUTUAL REVIEW */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="⭐ Submit Farmer Rating & Review"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('traderMarketplace.ratingLabel')}</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent Crop Quality & Cooperation</option>
                <option value="4">⭐⭐⭐⭐ 4 - Good Quality</option>
                <option value="3">⭐⭐⭐ 3 - Average</option>
                <option value="2">⭐⭐ 2 - Poor Quality</option>
                <option value="1">⭐ 1 - Very Unsatisfied</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('traderMarketplace.reviewComment')}</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe crop moisture level, packaging, and transaction punctuality..."
                className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
              />
            </div>

            <Button type="submit" loading={submittingReview} fullWidth={true} variant="primary">
              {t('traderMarketplace.submitReviewBtn')}
            </Button>
          </form>
        </Modal>

        {/* NEGOTIATION MODAL */}
        <NegotiationModal
          isOpen={showNegotiateModal}
          onClose={() => setShowNegotiateModal(false)}
          negotiationId={selectedNegotiationId}
          cropListing={selectedCrop}
          onDealSuccess={(msg) => {
            setStatusSuccessMsg(msg);
            fetchTraderData();
          }}
        />

      </div>
    </DashboardLayout>
  );
}
