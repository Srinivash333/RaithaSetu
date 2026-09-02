import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import DashboardLayout from '../layouts/DashboardLayout';
import JobCard from '../components/JobCard';
import FilterPanel from '../components/FilterPanel';
import Modal from '../components/Modal';
import Button from '../components/Button';
import WorkforceQuestionModal from '../components/WorkforceQuestionModal';
import { api } from '../services/api';
import { MapPin, Clock, AlertCircle, Send, CheckCircle, XCircle, MessageSquare, Briefcase } from 'lucide-react';

export default function WorkerDashboard() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { coords } = useLocation();

  const [isAvailable, setIsAvailable] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(30);

  // Apply Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  // Job Offer Response State
  const [respondingId, setRespondingId] = useState(null);
  const [offerActionError, setOfferActionError] = useState('');
  const [offerActionSuccess, setOfferActionSuccess] = useState('');

  // Q&A Chat Modal state
  const [chatModalData, setChatModalData] = useState({
    isOpen: false,
    jobId: null,
    workerId: null,
    workerName: '',
    jobTitle: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [maxDistanceKm]);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs({
        maxDistanceKm,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const data = await api.getMyApplications(token);
      if (data.success) {
        setMyApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setApplySuccess('');
    try {
      const data = await api.applyForJob(token, selectedJob._id, applyNote);
      if (data.success) {
        setApplySuccess('Application submitted successfully!');
        fetchMyApplications();
        setTimeout(() => {
          setSelectedJob(null);
          setApplySuccess('');
        }, 1200);
      } else {
        setApplySuccess(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setApplySuccess('Application error');
    } finally {
      setApplying(false);
    }
  };

  const handleRespondOffer = async (applicationId, status) => {
    setRespondingId(applicationId);
    setOfferActionError('');
    setOfferActionSuccess('');

    try {
      const data = await api.respondJobOffer(token, applicationId, status);
      if (data && data.success) {
        setOfferActionSuccess(
          status === 'accepted'
            ? (t('workforce.offerAcceptedSuccess') || 'Job offer accepted successfully.')
            : (t('workforce.offerDeclinedSuccess') || 'Job offer declined.')
        );
        fetchMyApplications();
        setTimeout(() => setOfferActionSuccess(''), 4000);
      } else {
        const errorMsg = data?.error || '';
        if (data?.status === 409 || errorMsg.includes('positions') || errorMsg.includes('capacity')) {
          setOfferActionError(t('workforce.capacityFullError') || 'This job no longer has available worker positions.');
        } else if (data?.status === 401) {
          setOfferActionError(t('workforce.sessionExpired') || 'Your session has expired. Please log in again.');
        } else if (data?.status === 403) {
          setOfferActionError(t('workforce.unauthorizedOffer') || 'You are not authorized to accept this offer.');
        } else if (data?.status === 404) {
          setOfferActionError(t('workforce.offerNotFound') || 'Job offer not found.');
        } else {
          setOfferActionError(errorMsg || (t('workforce.acceptOfferFailed') || 'Unable to accept the job offer. Please try again.'));
        }
      }
    } catch (err) {
      console.error('Respond offer error:', err);
      setOfferActionError(t('workforce.acceptOfferFailed') || 'Unable to accept the job offer. Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleOpenChat = (app) => {
    setChatModalData({
      isOpen: true,
      jobId: app.jobId?._id || app.jobId,
      workerId: user?._id,
      workerName: user?.name || 'Worker',
      jobTitle: app.jobId?.title
    });
  };

  // Separate job offers received from worker applications
  const jobOffers = myApplications.filter(a => a.status === 'offered');
  const otherApplications = myApplications.filter(a => a.status !== 'offered');

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* WORKER HEADER & AVAILABILITY TOGGLE */}
        <div className="bg-white p-6 rounded-3xl border border-agri-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-agri-900">{t('dashboards.worker.title')}</h1>
            <p className="text-xs text-gray-600 mt-1">{t('dashboards.worker.subtitle')}</p>
          </div>

          <div className="flex items-center space-x-3 bg-agri-50 p-3 rounded-2xl border border-agri-200">
            <span className="text-xs font-bold text-gray-700">{t('dashboards.worker.availStatusLabel')}</span>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-sm flex items-center space-x-1.5 ${
                isAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-300 animate-ping' : 'bg-gray-500'}`}></span>
              <span>{isAvailable ? t('recCard.available') : t('recCard.notAvailable')}</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGES FOR OFFER ACTIONS */}
        {offerActionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-black flex items-center space-x-3 shadow-md">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{offerActionSuccess}</span>
          </div>
        )}

        {offerActionError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-black flex items-center space-x-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{offerActionError}</span>
          </div>
        )}

        {/* JOB OFFERS RECEIVED SECTION (PROMINENT) */}
        {jobOffers.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-900 via-agri-950 to-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black">{t('workforce.jobOffersReceived')} ({jobOffers.length})</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobOffers.map((app) => {
                const isCurrentResponding = respondingId === app._id;

                return (
                  <div key={app._id} className="bg-white text-gray-900 p-5 rounded-2xl border border-emerald-300 shadow-md space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                            OFFER FROM FARMER
                          </span>
                          <h3 className="text-base font-black text-gray-900 mt-1">{app.jobId?.title || 'Farm Job'}</h3>
                          <p className="text-xs text-gray-500">Crop: {app.jobId?.crop} • Work: {app.jobId?.workType}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-emerald-800">₹{app.jobId?.wage}</span>
                          <span className="text-[10px] text-gray-500 block">/ {app.jobId?.duration || 'day'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-semibold">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Farmer:</span>
                          <span className="font-bold text-gray-900">{app.jobId?.farmerId?.name || 'Farmer'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-bold text-gray-800">{app.jobId?.locationName || 'Farm'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Workers Needed:</span>
                          <span className="font-bold text-gray-800">{app.jobId?.workersNeeded || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleRespondOffer(app._id, 'accepted')}
                        disabled={isCurrentResponding || !!respondingId}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-black py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isCurrentResponding ? (t('workforce.accepting') || 'Accepting...') : (t('workforce.acceptOfferBtn') || 'Accept Offer')}</span>
                      </button>

                      <button
                        onClick={() => handleOpenChat(app)}
                        className="bg-slate-900 hover:bg-black text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Ask Question</span>
                      </button>

                      <button
                        onClick={() => handleRespondOffer(app._id, 'rejected')}
                        disabled={isCurrentResponding || !!respondingId}
                        className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>{t('workforce.rejectOfferBtn') || 'Decline Offer'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH & DISTANCE FILTER PANEL */}
        <FilterPanel
          maxDistanceKm={maxDistanceKm}
          onDistanceChange={(dist) => setMaxDistanceKm(dist)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* NEARBY JOBS GRID */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-extrabold text-agri-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-agri-600" />
              <span>{t('dashboards.worker.searchJobsTitle')} ({jobs.length})</span>
            </h2>

            {loadingJobs ? (
              <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">Searching nearby farm jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-white rounded-3xl border border-agri-200">
                <AlertCircle className="w-8 h-8 text-agri-500 mx-auto" />
                <p className="text-xs text-gray-600">No farm jobs found within {maxDistanceKm} km.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onApply={(j) => setSelectedJob(j)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* APPLICATION HISTORY */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-agri-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-agri-600" />
              <span>{t('dashboards.worker.applicationsTitle')} ({otherApplications.length})</span>
            </h2>

            {otherApplications.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-agri-200 text-center text-xs text-gray-500">
                You have not applied for any jobs yet.
              </div>
            ) : (
              <div className="bg-white p-4 rounded-3xl border border-agri-200 shadow-sm space-y-3">
                {otherApplications.map((app) => (
                  <div key={app._id} className="p-3 bg-agri-50/70 rounded-2xl border border-agri-200 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{app.jobId?.title || 'Farm Job'}</span>
                      <span className={`capitalize text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        app.status === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {app.status === 'accepted' ? (t('workforce.offerAccepted') || '✓ Offer Accepted') : app.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">Farmer: {app.jobId?.farmerId?.name}</p>

                    <button
                      onClick={() => handleOpenChat(app)}
                      className="text-xs text-emerald-800 font-black hover:underline flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat / Q&A Thread →</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* APPLY MODAL */}
        <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Apply for Agricultural Job">
          {selectedJob && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-agri-50 rounded-xl border border-agri-200">
                <h4 className="font-bold text-sm text-agri-900">{selectedJob.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">Offered Wage: <strong className="text-agri-800">₹{selectedJob.wage} / {selectedJob.duration?.toLowerCase()}</strong></p>
              </div>

              {applySuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-bold">
                  {applySuccess}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('dashboards.worker.applyNoteLabel')}</label>
                <textarea
                  rows="3"
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  placeholder="e.g. 4 years of experience in paddy harvesting in Mandya region..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-agri-500"
                ></textarea>
              </div>

              <Button onClick={handleApply} loading={applying} fullWidth={true} variant="primary">
                {t('dashboards.worker.confirmApplyBtn')}
              </Button>
            </div>
          )}
        </Modal>

        {/* WORKFORCE QUESTION CHAT MODAL */}
        <WorkforceQuestionModal
          isOpen={chatModalData.isOpen}
          onClose={() => setChatModalData(prev => ({ ...prev, isOpen: false }))}
          jobId={chatModalData.jobId}
          workerId={chatModalData.workerId}
          workerName={chatModalData.workerName}
          jobTitle={chatModalData.jobTitle}
        />

      </div>
    </DashboardLayout>
  );
}
