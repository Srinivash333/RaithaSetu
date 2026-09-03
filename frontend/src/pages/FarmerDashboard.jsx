import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import DashboardLayout from '../layouts/DashboardLayout';
import JobCard from '../components/JobCard';
import WorkerCard from '../components/WorkerCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import WageEstimatorModal from '../components/WageEstimatorModal';
import NegotiationModal from '../components/NegotiationModal';
import WorkforceQuestionModal from '../components/WorkforceQuestionModal';
import OfferConfirmationModal from '../components/OfferConfirmationModal';
import TraderMatchingCard from '../components/TraderMatchingCard';
import CropQuestionModal from '../components/CropQuestionModal';
import TraderShopModal from '../components/TraderShopModal';
import CropOfferModal from '../components/CropOfferModal';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getStoreImage, handleStoreImageError } from '../utils/storeImages';
import { getMatchExplanation, translateCrop, getPresetCropImage } from '../utils/cropTranslations';
import { 
  PlusCircle, Sparkles, AlertCircle, Scale, MessageSquare, 
  ShoppingBag, Store, Truck, Clock, CheckCircle, Star, Building2, Send, Users
} from 'lucide-react';

export default function FarmerDashboard() {
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const { coords } = useLocation() || {};

  // Active Workforce Section Tab: 'jobs' | 'matches' | 'offers' | 'confirmed'
  const [activeWorkforceTab, setActiveWorkforceTab] = useState('jobs');

  // Jobs & Labor State
  const [postedJobs, setPostedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);

  // Recommendations state
  const [activeJobForRec, setActiveJobForRec] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Offers & Sent Applications State
  const [sentOffers, setSentOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Offer Confirmation Modal State
  const [selectedWorkerForOffer, setSelectedWorkerForOffer] = useState(null);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerModalError, setOfferModalError] = useState('');

  // Agro Store Orders state
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Farmer Crop Listings & Negotiations State
  const [myCrops, setMyCrops] = useState([]);
  const [selectedCropForMatching, setSelectedCropForMatching] = useState(null);
  const [myNegotiations, setMyNegotiations] = useState([]);
  const [traderList, setTraderList] = useState([]);
  const [traderReqs, setTraderReqs] = useState([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  // Trader Shop, Crop Offer & Crop Q&A Modals
  const [selectedTraderForShop, setSelectedTraderForShop] = useState(null);
  const [selectedTraderForCropQA, setSelectedTraderForCropQA] = useState(null);
  const [selectedTraderForCropOffer, setSelectedTraderForCropOffer] = useState(null);
  const [sentCropOffers, setSentCropOffers] = useState([]);

  // Post Crop Form State
  const [cropName, setCropName] = useState('Fresh Farm Tomatoes');
  const [variety, setVariety] = useState('Hybrid Red');
  const [quantity, setQuantity] = useState(30);
  const [unit, setUnit] = useState('box');
  const [expectedPrice, setExpectedPrice] = useState(600);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationName, setLocationName] = useState(user?.address || 'Mandya East Farm');
  const [cropDescription, setCropDescription] = useState('Freshly harvested organic hybrid red tomatoes.');
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [targetTraders, setTargetTraders] = useState([]);
  const [postingCrop, setPostingCrop] = useState(false);

  // Negotiation Modal
  const [selectedNegotiationId, setSelectedNegotiationId] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);

  // Q&A Chat Modal state (Workforce)
  const [chatModalData, setChatModalData] = useState({
    isOpen: false,
    jobId: null,
    workerId: null,
    workerName: '',
    jobTitle: ''
  });

  // Mutual Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState(null);
  const [reviewTransactionId, setReviewTransactionId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Job Form state
  const [jobTitle, setJobTitle] = useState('');
  const [crop, setCrop] = useState('Paddy');
  const [workType, setWorkType] = useState('Harvesting');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('Harvesting, Spraying');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  const [genderPreference, setGenderPreference] = useState('ANY');
  const [duration, setDuration] = useState('Daily');
  const [wage, setWage] = useState(750);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchMyPostedJobs();
    fetchFarmerOrders();
    fetchFarmerCropsAndNegotiations();
    fetchTradersList();
  }, []);

  const fetchMyPostedJobs = async () => {
    try {
      const data = await api.getMyPostedJobs(token);
      if (data && data.success) {
        const jobsList = data.jobs || [];
        setPostedJobs(jobsList);
        if (jobsList.length > 0 && !activeJobForRec) {
          fetchRecommendations(jobsList[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching my posted jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchFarmerOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.getMyOrders(token);
      if (data && data.success) {
        const myOrders = (data.orders || []).filter(
          o => (o.buyerId?._id === user?._id || o.buyerId === user?._id)
        );
        setFarmerOrders(myOrders);
      }
    } catch (err) {
      console.error('Error fetching farmer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchFarmerCropsAndNegotiations = async () => {
    try {
      const resCrops = await fetch('/api/crops/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataCrops = await resCrops.json();
      if (dataCrops && dataCrops.success) {
        const listings = dataCrops.listings || [];
        setMyCrops(listings);
        if (listings.length > 0 && !selectedCropForMatching) {
          setSelectedCropForMatching(listings[0]);
        }
      }

      const resNeg = await api.getMyNegotiations(token);
      if (resNeg && resNeg.success) {
        setMyNegotiations(resNeg.negotiations || []);
      }
    } catch (err) {
      console.error('Error fetching farmer crops/negotiations:', err);
    }
  };

  const fetchTradersList = async () => {
    try {
      const data = await api.getAllTraders();
      if (data && data.success) {
        setTraderList(data.traders || []);
      }

      const reqRes = await api.getTraderRequirements();
      if (reqRes && reqRes.success) {
        setTraderReqs(reqRes.requirements || []);
      }
    } catch (err) {
      console.error('Error fetching traders list:', err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const data = await api.createJob(token, {
        title: jobTitle,
        crop,
        workType,
        description,
        requiredSkills,
        workersNeeded,
        genderPreference,
        duration,
        wage,
        latitude: coords?.latitude || 12.9716,
        longitude: coords?.longitude || 77.5946
      });
      if (data && data.success) {
        setShowPostModal(false);
        setStatusSuccessMsg('Agricultural job posted successfully!');
        fetchMyPostedJobs();
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Post job error:', err);
    } finally {
      setPosting(false);
    }
  };

  const handlePostCrop = async (e) => {
    e.preventDefault();
    if (!cropName || !quantity || !expectedPrice) return;
    setPostingCrop(true);
    try {
      const data = await api.createCropListing(token, {
        cropName: cropName.trim(),
        variety: variety.trim(),
        quantity: Number(quantity),
        unit,
        expectedPricePerUnit: Number(expectedPrice),
        harvestDate,
        locationName: locationName.trim(),
        description: cropDescription.trim(),
        imageUrl: cropImageUrl.trim() || getPresetCropImage(cropName),
        latitude: coords?.latitude || 12.9716,
        longitude: coords?.longitude || 77.5946,
        targetTraderIds: targetTraders
      });

      if (data && data.success) {
        setShowCropModal(false);
        setStatusSuccessMsg('Crop listing posted successfully!');
        setCropImageUrl('');
        fetchFarmerCropsAndNegotiations();
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error posting crop listing:', err);
    } finally {
      setPostingCrop(false);
    }
  };

  const fetchRecommendations = async (job) => {
    if (!job || !job._id) return;
    setActiveJobForRec(job);
    setLoadingRecs(true);
    try {
      const data = await api.getWorkerRecommendations(token, job._id);
      if (data && data.success) {
        setRecommendations(data.recommendations || []);
      }
      fetchJobOffersAndApplicants(job._id);
    } catch (err) {
      console.error('Fetch worker recommendations error:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchJobOffersAndApplicants = async (jobId) => {
    if (!jobId) return;
    setLoadingOffers(true);
    try {
      const data = await api.getJobApplicants(token, jobId);
      if (data && data.success) {
        setSentOffers(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching job applicants/offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  // Farmer opens Offer Confirmation Modal
  const handleOpenOfferModal = (worker) => {
    setSelectedWorkerForOffer(worker);
    setOfferModalError('');
  };

  // Farmer confirms Send Job Offer inside Modal
  const handleConfirmSendOffer = async () => {
    if (!activeJobForRec || !selectedWorkerForOffer) return;
    
    const workerId = selectedWorkerForOffer._id || selectedWorkerForOffer.userId?._id || selectedWorkerForOffer.userId;
    if (!workerId) {
      setOfferModalError('Worker ID missing');
      return;
    }

    setSendingOffer(true);
    setOfferModalError('');
    try {
      const data = await api.sendJobOffer(token, {
        jobId: activeJobForRec._id,
        workerId: workerId,
        note: `Job offer sent for ${activeJobForRec.title}`
      });

      if (data && data.success) {
        const workerName = selectedWorkerForOffer.name || 'Worker';
        setSelectedWorkerForOffer(null);
        setStatusSuccessMsg(t('workforce.offerSentSuccess') || `Job offer sent to ${workerName}!`);
        fetchJobOffersAndApplicants(activeJobForRec._id);
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      } else {
        setOfferModalError(data?.error || t('workforce.offerSentError'));
      }
    } catch (err) {
      console.error('Send offer error:', err);
      setOfferModalError(t('workforce.offerSentError'));
    } finally {
      setSendingOffer(false);
    }
  };

  // Farmer opens Q&A Chat Modal with worker
  const handleOpenChat = (worker) => {
    if (!worker) return;
    setChatModalData({
      isOpen: true,
      jobId: activeJobForRec?._id,
      workerId: worker._id || worker.userId?._id || worker.userId,
      workerName: worker.name || 'Worker',
      jobTitle: activeJobForRec?.title || 'Farm Job'
    });
  };

  // Farmer opens Crop Offer Modal for selected trader
  const handleSendCropOfferToTrader = (trader) => {
    if (!selectedCropForMatching || !trader) return;
    setSelectedTraderForCropOffer(trader);
  };

  const handleCropOfferSentSuccess = (traderId, msg) => {
    setSentCropOffers(prev => [...prev, traderId]);
    setStatusSuccessMsg(msg || 'Crop offer sent successfully.');
    fetchFarmerCropsAndNegotiations();
    setTimeout(() => setStatusSuccessMsg(''), 4000);
  };

  // Calculate matching trader shops for selected crop
  const getMatchingTradersForCrop = (crop) => {
    if (!crop || !crop.cropName || !Array.isArray(traderList) || traderList.length === 0) return [];

    try {
      const cropNameStr = (crop.cropName || '').toString().toLowerCase();

      return traderList.map(trader => {
        if (!trader) return null;

        const interested = Array.isArray(trader.interestedCrops) ? trader.interestedCrops : [];
        const isInterested = interested.some(c => {
          if (!c) return false;
          const cStr = c.toString().toLowerCase();
          return cStr.includes(cropNameStr) || cropNameStr.includes(cStr);
        });

        const reqs = Array.isArray(traderReqs) ? traderReqs : [];
        const req = reqs.find(r => {
          if (!r || !r.cropName) return false;
          const tId = r.traderId?._id || r.traderId;
          const rCropStr = r.cropName.toString().toLowerCase();
          return (tId === trader._id) && (rCropStr.includes(cropNameStr) || cropNameStr.includes(rCropStr));
        });

        let score = 70;
        if (isInterested) score += 15;
        if (req) score += 15;

        const dist = 8.2;
        const bName = trader.businessName || 'APMC Crop Buyer';
        const explanation = getMatchExplanation(bName, crop.cropName, crop.quantity || 0, crop.unit || 'units', dist, language);

        return {
          trader,
          matchScore: Math.min(98, score),
          distanceKm: dist,
          requirement: req || null,
          explanation
        };
      }).filter(Boolean).sort((a, b) => b.matchScore - a.matchScore);
    } catch (err) {
      console.error('Error calculating matching traders:', err);
      return [];
    }
  };

  // Submit Review for Trader
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
          targetRole: 'trader',
          transactionType: 'crop_order',
          transactionId: reviewTransactionId,
          rating: Number(reviewRating),
          comment: reviewComment.trim()
        })
      });
      const data = await res.json();
      if (data && data.success) {
        setShowReviewModal(false);
        setStatusSuccessMsg('Trader review submitted successfully!');
        fetchFarmerCropsAndNegotiations();
        setTimeout(() => setStatusSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter confirmed/accepted workers vs offers safely
  const confirmedWorkers = Array.isArray(sentOffers) ? sentOffers.filter(a => a && a.status === 'accepted') : [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* FARMER HEADER BANNER */}
        <div className="bg-gradient-to-r from-agri-800 to-agri-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-white/10 backdrop-blur-sm text-agri-200 border border-white/10 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
              {t('dashboards.farmer.title')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{language === 'kn' ? `ಸ್ವಾಗತ, ${user?.name || 'ರೈತರೇ'}!` : `Welcome, ${user?.name || 'Farmer'}!`}</h1>
            <p className="text-xs text-agri-200">{t('dashboards.farmer.subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowPostModal(true)}
              variant="secondary"
              className="bg-white text-agri-900 font-black hover:bg-agri-50 text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dashboards.farmer.postJobBtn')}</span>
            </Button>

            <button
              onClick={() => setShowCropModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('dashboards.farmer.addCropBtn')}</span>
            </button>

            <button
              onClick={() => setIsWageModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition shadow-md flex items-center space-x-1"
            >
              <Scale className="w-4 h-4" />
              <span>{t('wages.estimateBtn')}</span>
            </button>
          </div>
        </div>

        {/* STATUS SUCCESS NOTIFICATION */}
        {statusSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-black flex items-center space-x-3 shadow-md animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusSuccessMsg}</span>
          </div>
        )}

        {/* WORKFORCE MATCHING & HIRING SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-agri-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-agri-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-agri-950 flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>{t('dashboards.farmer.workforceTitle') || 'Agricultural Workforce & Matching Workers'}</span>
              </h2>
              <p className="text-xs text-gray-500">{t('dashboards.farmer.workforceSubtitle') || 'View real-time worker match scores, ask Q&A questions, send job offers, and hire confirmed labor'}</p>
            </div>

            <Button onClick={() => setShowPostModal(true)} variant="primary" size="sm" className="font-bold text-xs">
              + {t('dashboards.farmer.postJobBtn')}
            </Button>
          </div>

          {/* WORKFORCE TABS */}
          <div className="flex items-center space-x-2 border-b border-agri-100 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveWorkforceTab('jobs')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeWorkforceTab === 'jobs' ? 'bg-agri-900 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('workforce.tabMyJobs')} ({postedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkforceTab('matches')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeWorkforceTab === 'matches' ? 'bg-agri-900 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
              <span>{t('workforce.tabMatchingWorkers')} ({recommendations.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkforceTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeWorkforceTab === 'offers' ? 'bg-agri-900 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{t('workforce.tabOffersSent')} ({sentOffers.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkforceTab('confirmed')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeWorkforceTab === 'confirmed' ? 'bg-agri-900 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('workforce.tabConfirmedWorkers')} ({confirmedWorkers.length})</span>
            </button>
          </div>

          {/* TAB 1: MY POSTED JOBS */}
          {activeWorkforceTab === 'jobs' && (
            <div>
              {loadingJobs ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  {t('common.loading')}
                </div>
              ) : postedJobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 space-y-3">
                  <p>No agricultural jobs posted yet.</p>
                  <Button onClick={() => setShowPostModal(true)} variant="primary" size="sm">
                    {t('dashboards.farmer.postJobBtn')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postedJobs.map((j) => (
                    <div key={j._id} onClick={() => setActiveWorkforceTab('matches')}>
                      <JobCard
                        job={j}
                        onSelectForRec={(job) => {
                          fetchRecommendations(job);
                          setActiveWorkforceTab('matches');
                        }}
                        isSelected={activeJobForRec?._id === j._id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATCHING WORKERS */}
          {activeWorkforceTab === 'matches' && (
            <div className="space-y-4">
              {activeJobForRec && (
                <div className="bg-agri-50 p-4 rounded-2xl border border-agri-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500 font-bold uppercase text-[10px] block">{t('dashboards.farmer.rankingFor')}</span>
                    <span className="font-extrabold text-agri-950 text-sm">{activeJobForRec.title} ({activeJobForRec.crop})</span>
                    <p className="text-gray-600 text-[11px]">Required: {activeJobForRec.workersNeeded} workers • Offered: ₹{activeJobForRec.wage}/{activeJobForRec.duration?.toLowerCase()}</p>
                  </div>

                  <span className="bg-emerald-700 text-white font-black text-[11px] px-3 py-1 rounded-full">
                    {recommendations.length} Workers Calculated
                  </span>
                </div>
              )}

              {loadingRecs ? (
                <div className="p-12 text-center text-xs text-gray-500">
                  Calculating real-time worker match scores...
                </div>
              ) : recommendations.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="font-extrabold text-sm text-gray-900">{t('workforce.noMatchingWorkers')}</h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">{t('workforce.noMatchingSuggestion')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec, i) => {
                    const workerIdStr = rec?.worker?._id || rec?.worker?.userId?._id || rec?.worker?.userId;
                    const isOfferAlreadySent = Array.isArray(sentOffers) && sentOffers.some(o => (o?.workerId?._id || o?.workerId) === workerIdStr);

                    return (
                      <WorkerCard
                        key={i}
                        worker={rec.worker}
                        profile={rec.profile}
                        matchPercentage={rec.matchPercentage}
                        distanceKm={rec.distanceKm}
                        breakdown={rec.breakdown}
                        explanation={rec.explanation}
                        job={activeJobForRec}
                        onAskQuestion={handleOpenChat}
                        onSendOffer={handleOpenOfferModal}
                        offerSent={isOfferAlreadySent}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFERS SENT & RESPONSES */}
          {activeWorkforceTab === 'offers' && (
            <div className="space-y-3">
              {loadingOffers ? (
                <div className="p-8 text-center text-xs text-gray-500">{t('common.loading')}</div>
              ) : sentOffers.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-xs text-gray-500">
                  No job offers sent yet. Click 'Matching Workers' and tap 'Send Job Offer' to offer work.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sentOffers.map((offer) => {
                    const workerObj = offer.workerId;
                    const workerName = workerObj?.name || 'Worker';
                    const isAccepted = offer.status === 'accepted';
                    const isRejected = offer.status === 'rejected';

                    return (
                      <div key={offer._id} className="bg-white p-5 rounded-3xl border border-agri-200 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isAccepted ? 'bg-emerald-600 text-white' : isRejected ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                STATUS: {offer.status.toUpperCase()}
                              </span>
                              <h4 className="font-black text-sm text-gray-900 mt-1">{workerName}</h4>
                              <p className="text-[11px] text-gray-500">Job: {activeJobForRec?.title || 'Agricultural Job'}</p>
                            </div>

                            <a
                              href={`tel:${workerObj?.phone || '+919845012345'}`}
                              className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl hover:bg-emerald-100"
                            >
                              📞 {workerObj?.phone || 'Call'}
                            </a>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenChat(workerObj || { _id: offer.workerId, name: workerName })}
                          className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition flex items-center justify-center space-x-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Q&A Chat Thread →</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONFIRMED WORKERS */}
          {activeWorkforceTab === 'confirmed' && (
            <div className="space-y-3">
              {confirmedWorkers.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-xs text-gray-500">
                  {t('dashboards.farmer.noConfirmedWorkers') || 'No confirmed workers yet for this job. Sent offers will appear here when accepted by workers.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {confirmedWorkers.map((c) => (
                    <div key={c._id} className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-950 font-black text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>{c.workerId?.name || 'Worker'}</span>
                      </div>
                      <p className="text-xs text-emerald-900">Phone: {c.workerId?.phone || 'Available'}</p>
                      <p className="text-[11px] text-emerald-800 font-bold uppercase">● CONFIRMED FOR FARM WORK</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* CROP SALES, TRADER NEGOTIATIONS & MATCHING TRADER SHOPS SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-agri-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-agri-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-agri-950 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>{t('dashboards.farmer.myCropsTitle') || 'My Crops for Sale & Trader Price Offers'}</span>
              </h2>
              <p className="text-xs text-gray-500">{t('dashboards.farmer.myCropsSubtitle') || 'Track crop listings, view matching registered trader shops, negotiate prices, and confirm deals'}</p>
            </div>

            <button
              onClick={() => setShowCropModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('dashboards.farmer.postNewCropBtn') || '+ Post New Crop'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MY CROPS LIST */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wide">{t('dashboards.farmer.myActiveCropsHeader') || 'My Active Crop Listings'} ({myCrops.length})</h3>
              {myCrops.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-gray-500 border border-slate-200">
                  {t('dashboards.farmer.noCropsListedYet') || "No crops listed yet. Click 'Post New Crop' to list harvest for APMC traders."}
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {myCrops.map((c) => {
                    const remainingQty = (c.quantity || 0) - (c.soldQuantity || 0);
                    const isSold = c.status === 'sold' || remainingQty <= 0;
                    const isSelected = selectedCropForMatching?._id === c._id;
                    const cropImg = c.imageUrl || getPresetCropImage(c.cropName);

                    return (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCropForMatching(c)}
                        className={`p-3.5 rounded-2xl border text-xs space-y-2 cursor-pointer transition ${
                          isSelected ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-agri-50/70 border-agri-200 hover:border-agri-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center space-x-3">
                            {/* CROP THUMBNAIL IMAGE */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-100 border border-emerald-200 shrink-0 relative shadow-xs">
                              <img
                                src={cropImg}
                                alt={c.cropName}
                                onError={(e) => { e.target.src = getPresetCropImage(c.cropName); }}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                isSold ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                              }`}>
                                {isSold ? (t('common.soldOut') || 'SOLD OUT') : (t('common.available') || 'AVAILABLE')}
                              </span>
                              <h4 className="font-black text-sm text-gray-900 mt-1">{c.cropName}</h4>
                              <p className="text-[11px] text-gray-500">Variety: {c.variety || 'Standard'}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-emerald-800 text-sm block">₹{c.expectedPricePerUnit} / {c.unit}</span>
                            <span className="text-[10px] text-gray-500 block">{remainingQty} / {c.quantity} {c.unit}s remaining</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECEIVED TRADER OFFERS */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wide">{t('dashboards.farmer.traderNegotiationsHeader') || 'Trader Negotiations'} ({myNegotiations.length})</h3>
              {myNegotiations.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-gray-500 border border-slate-200">
                  {t('dashboards.farmer.noOffersReceived') || 'No price offers received from traders yet.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {myNegotiations.map((n) => {
                    const isConfirmed = n.status === 'accepted' || n.dealConfirmed;
                    return (
                      <div key={n._id} className="p-3.5 bg-white rounded-2xl border border-agri-200 text-xs space-y-2 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              isConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {isConfirmed ? (t('dashboards.farmer.dealConfirmedHandshake') || 'DEAL CONFIRMED 🤝') : (t('dashboards.farmer.offerReceivedBadge') || 'OFFER RECEIVED')}
                            </span>
                            <h4 className="font-black text-sm text-gray-900 mt-1">
                              {n.cropListingId?.cropName || 'Crop Offer'}
                            </h4>
                            <p className="text-[11px] text-gray-600">
                              Trader: <strong>{n.traderBusinessName}</strong>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-emerald-800 text-sm">₹{n.currentPrice} / {n.unit}</span>
                            <span className="text-[10px] text-gray-500 block">Total: ₹{n.finalTotalAmount?.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setSelectedNegotiationId(n._id);
                              setSelectedCrop(null);
                              setShowNegotiateModal(true);
                            }}
                            className="bg-slate-900 hover:bg-black text-white text-[11px] font-black px-3 py-1.5 rounded-lg transition"
                          >
                            {t('dashboards.farmer.openOfferAndCounter') || 'Open Offer & Counter →'}
                          </button>

                          {isConfirmed && (
                            <button
                              onClick={() => {
                                setReviewTargetId(n.traderId?._id || n.traderId);
                                setReviewTransactionId(n._id);
                                setShowReviewModal(true);
                              }}
                              className="text-amber-700 font-bold hover:underline text-[11px] flex items-center"
                            >
                              <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" />
                              {t('dashboards.farmer.rateTrader') || 'Rate Trader'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 1: MATCHING TRADER SHOPS SECTION */}
          {selectedCropForMatching && (
            <div className="space-y-4 pt-6 border-t border-agri-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <span>{t('dashboards.farmer.matchingTradersTitle') || 'Matching Trader Shops for'} "{translateCrop(selectedCropForMatching.cropName, language)}"</span>
                  </h3>
                  <p className="text-xs text-gray-500">{t('dashboards.farmer.matchingTradersSubtitle') || 'Registered wholesale buyers looking for this crop'}</p>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {t('dashboards.farmer.askingPriceLabel') || 'Asking:'} ₹{selectedCropForMatching.expectedPricePerUnit}/{selectedCropForMatching.unit}
                </span>
              </div>

              {getMatchingTradersForCrop(selectedCropForMatching).length === 0 ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-xs text-gray-500">
                  {t('dashboards.farmer.noMatchingTradersFound') || 'No matching trader shops registered for this crop right now.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getMatchingTradersForCrop(selectedCropForMatching).map(({ trader, matchScore, distanceKm, requirement, explanation }) => {
                    const isOfferAlreadySent = sentCropOffers.includes(trader._id) ||
                      (myNegotiations || []).some(n => 
                        (n.cropListingId?._id === selectedCropForMatching._id || n.cropListingId === selectedCropForMatching._id) &&
                        (n.traderId?._id === trader._id || n.traderId === trader._id)
                      );

                    return (
                      <TraderMatchingCard
                        key={trader._id}
                        trader={trader}
                        matchScore={matchScore}
                        distanceKm={distanceKm}
                        requirement={requirement}
                        explanation={explanation}
                        onViewShop={(t) => setSelectedTraderForShop(t)}
                        onAskQuestion={(t) => setSelectedTraderForCropQA(t)}
                        onSendCropOffer={handleSendCropOfferToTrader}
                        offerSent={isOfferAlreadySent}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MY AGRO STORE ORDERS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                <Store className="w-5 h-5 text-emerald-700" />
                <span>{language === 'kn' ? 'ನನ್ನ ಅಗ್ರೋ ಆರ್ಡರ್‌ಗಳು' : (t('store.myAgroOrders') || 'My Agro Orders')} ({farmerOrders.length})</span>
              </h2>
              <p className="text-xs text-gray-500">{language === 'kn' ? 'ಬೀಜಗಳು, ರಸಗೊಬ್ಬರಗಳು ಮತ್ತು ಉಪಕರಣಗಳ ಆರ್ಡರ್ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track order status and fulfillment details for seeds, fertilizers & tools'}</p>
            </div>
            <Link to="/stores" className="text-xs font-bold text-emerald-700 hover:underline">
              {language === 'kn' ? '+ ಮತ್ತಷ್ಟು ಮಳಿಗೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : '+ Shop More Stores'}
            </Link>
          </div>

          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">
              {t('common.loading')}
            </div>
          ) : farmerOrders.length === 0 ? (
            <div className="p-8 bg-white text-center rounded-2xl border border-agri-200 text-xs text-gray-500 space-y-2">
              <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-bold">{language === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಅಗ್ರೋ ಆರ್ಡರ್‌ಗಳನ್ನು ಮಾಡಲಾಗಿಲ್ಲ.' : 'No store orders placed yet.'}</p>
              <Link to="/stores" className="text-emerald-700 font-bold hover:underline inline-block">
                {language === 'kn' ? 'ಸ್ಥಳೀಯ ಅಗ್ರೋ ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಿ →' : 'Browse Local Agro Stores →'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmerOrders.map((o) => {
                const sellerName = o.sellerId?.name || 'Agro Kendra';
                const sellerStoreId = o.sellerId?._id || o.sellerId;
                const storeImg = getStoreImage(sellerStoreId, '');
                const status = o.orderStatus || 'pending';
                const isDelivery = o.deliveryOption === 'store_delivery';

                return (
                  <div key={o._id} className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={storeImg}
                          alt={sellerName}
                          onError={(e) => handleStoreImageError(e, sellerStoreId)}
                          className="w-12 h-12 rounded-xl object-cover border border-agri-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h3 className="font-black text-sm text-gray-900 truncate">{sellerName}</h3>
                          <span className="text-[10px] text-gray-500 font-mono block">#{o._id.toString().slice(-6).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="bg-agri-50/70 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between text-gray-600 text-[11px]">
                          <span>Fulfillment:</span>
                          <span className="font-bold flex items-center">
                            {isDelivery ? <Truck className="w-3 h-3 mr-1 text-emerald-600" /> : <Store className="w-3 h-3 mr-1 text-blue-600" />}
                            {isDelivery ? 'Delivery' : 'Self-Collection'}
                          </span>
                        </div>

                        <div className="flex justify-between font-bold text-gray-900 border-t border-agri-200/50 pt-1">
                          <span>Total Amount:</span>
                          <span className="text-emerald-800">₹{o.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                      <span className="text-xs font-black uppercase text-emerald-800">
                        ● {status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL: POST CROP FOR SALE */}
        <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} title="🌾 Post Crop for Sale to APMC Traders">
          <form onSubmit={handlePostCrop} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="Paddy, Tomato, Sugarcane"
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="Sona Masoori, RNR"
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="box">Box</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                  <option value="kg">Kg</option>
                  <option value="bag">Bag</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Expected (₹/{unit})</label>
                <input
                  type="number"
                  required
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Farm Address / Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Farm location"
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Crop Image URL / Photo (Optional)</label>
              <input
                type="url"
                value={cropImageUrl}
                onChange={(e) => setCropImageUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/... (Or pick photo preset below)"
                className="w-full border border-gray-300 rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
              />
              
              {/* PRESET CROP PHOTO PICKER */}
              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Or Pick a Quick Crop Photo Preset:</span>
                <div className="flex space-x-2 overflow-x-auto pb-1 pt-0.5">
                  {[
                    { name: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Paddy / Rice', url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Sugarcane', url: 'https://images.unsplash.com/photo-1594951478522-a9b8304033ec?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Cotton', url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Maize', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCropImageUrl(preset.url)}
                      className={`shrink-0 flex items-center space-x-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                        cropImageUrl === preset.url ? 'bg-emerald-800 text-white border-emerald-900' : 'bg-slate-50 text-gray-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded object-cover" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description & Crop Quality Notes</label>
              <textarea
                rows={2}
                value={cropDescription}
                onChange={(e) => setCropDescription(e.target.value)}
                placeholder="Details on moisture level, organic fertilizer, packaging..."
                className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('traderMarketplace.targetTradersLabel')}</label>
              <select
                multiple
                value={targetTraders}
                onChange={(e) => setTargetTraders(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-xl p-2 font-semibold text-xs h-24"
              >
                {traderList.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.businessName} ({t.businessLocation})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" loading={postingCrop} fullWidth={true} variant="primary">
              Publish Crop Listing to APMC Traders
            </Button>
          </form>
        </Modal>

        {/* MODAL: POST JOB */}
        <Modal isOpen={showPostModal} onClose={() => setShowPostModal(false)} title={t('dashboards.farmer.postJobBtn')}>
          <form onSubmit={handlePostJob} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.jobTitleLabel')}</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Paddy Harvesting & Threshing"
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.cropLabel')}</label>
                <input
                  type="text"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="Paddy, Tomato"
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.workTypeLabel')}</label>
                <input
                  type="text"
                  required
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  placeholder="Harvesting, Sowing"
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description & Requirements</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe farm job task..."
                className="w-full border border-gray-300 rounded-xl p-2.5"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.workersNeededLabel')}</label>
                <input
                  type="number"
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.genderPrefLabel')}</label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="ANY">{t('dashboards.farmer.genderAny')}</option>
                  <option value="MALE">{t('dashboards.farmer.genderMale')}</option>
                  <option value="FEMALE">{t('dashboards.farmer.genderFemale')}</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Daily">Daily</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.farmer.wageLabel')}</label>
                <input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>

            <Button type="submit" loading={posting} fullWidth={true} variant="primary">
              {t('dashboards.farmer.publishBtn')}
            </Button>
          </form>
        </Modal>

        {/* MODAL: MUTUAL REVIEW */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title="⭐ Submit Trader Rating & Review"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('traderMarketplace.ratingLabel')}</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 - Fair Spot Price & Prompt Payment</option>
                <option value="4">⭐⭐⭐⭐ 4 - Good Transaction</option>
                <option value="3">⭐⭐⭐ 3 - Average</option>
                <option value="2">⭐⭐ 2 - Below Expectations</option>
                <option value="1">⭐ 1 - Very Unsatisfied</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">{t('traderMarketplace.reviewComment')}</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience regarding payment timeliness and APMC yard weighing..."
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
            fetchFarmerCropsAndNegotiations();
          }}
        />

        {/* WORKFORCE QUESTION CHAT MODAL */}
        <WorkforceQuestionModal
          isOpen={chatModalData.isOpen}
          onClose={() => setChatModalData(prev => ({ ...prev, isOpen: false }))}
          jobId={chatModalData.jobId}
          workerId={chatModalData.workerId}
          workerName={chatModalData.workerName}
          jobTitle={chatModalData.jobTitle}
        />

        {/* CROP Q&A CHAT MODAL */}
        <CropQuestionModal
          isOpen={!!selectedTraderForCropQA}
          onClose={() => setSelectedTraderForCropQA(null)}
          cropListingId={selectedCropForMatching?._id}
          traderId={selectedTraderForCropQA?._id}
          traderName={selectedTraderForCropQA?.businessName}
          cropName={selectedCropForMatching?.cropName}
        />

        {/* TRADER SHOP PROFILE MODAL */}
        <TraderShopModal
          isOpen={!!selectedTraderForShop}
          onClose={() => setSelectedTraderForShop(null)}
          trader={selectedTraderForShop}
          requirements={Array.isArray(traderReqs) ? traderReqs.filter(r => (r?.traderId?._id === selectedTraderForShop?._id || r?.traderId === selectedTraderForShop?._id)) : []}
        />

        {/* OFFER CONFIRMATION MODAL */}
        <OfferConfirmationModal
          isOpen={!!selectedWorkerForOffer}
          onClose={() => setSelectedWorkerForOffer(null)}
          worker={selectedWorkerForOffer}
          job={activeJobForRec}
          onConfirmOffer={handleConfirmSendOffer}
          sending={sendingOffer}
          errorMessage={offerModalError}
        />

        {/* CROP OFFER MODAL */}
        <CropOfferModal
          isOpen={!!selectedTraderForCropOffer}
          onClose={() => setSelectedTraderForCropOffer(null)}
          trader={selectedTraderForCropOffer}
          cropListing={selectedCropForMatching}
          onOfferSentSuccess={handleCropOfferSentSuccess}
        />

        <WageEstimatorModal isOpen={isWageModalOpen} onClose={() => setIsWageModalOpen(false)} />

      </div>
    </DashboardLayout>
  );
}
