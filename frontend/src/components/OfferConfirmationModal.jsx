import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';
import { Send, User, Briefcase, MapPin, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OfferConfirmationModal({
  isOpen,
  onClose,
  worker,
  job,
  onConfirmOffer,
  sending = false,
  errorMessage = ''
}) {
  const { t } = useLanguage();

  if (!isOpen || !worker || !job) return null;

  const workerName = worker.name || 'Worker';
  const jobTitle = job.title || 'Agricultural Job';
  const wageText = `₹${job.wage} / ${job.duration?.toLowerCase() || 'day'}`;
  const locationText = job.locationName || 'Farm Location';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🌾 ${t('workforce.confirmOfferTitle')}`}
    >
      <div className="space-y-4 text-xs animate-fade-in">
        
        <p className="text-gray-600 font-medium leading-relaxed">
          {t('workforce.confirmOfferPrompt')}
        </p>

        {/* OFFER DETAILS SUMMARY CARD */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-bold uppercase text-[10px] flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-agri-700" />
              {t('workforce.workerLabel')}
            </span>
            <span className="font-extrabold text-gray-900 text-sm">{workerName}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
            <span className="text-gray-500 font-bold uppercase text-[10px] flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1 text-agri-700" />
              {t('workforce.jobLabel')}
            </span>
            <span className="font-bold text-gray-900 truncate max-w-[200px]">{jobTitle}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
            <span className="text-gray-500 font-bold uppercase text-[10px] flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              {t('workforce.payLabel')}
            </span>
            <span className="font-black text-emerald-800 text-sm">{wageText}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
            <span className="text-gray-500 font-bold uppercase text-[10px] flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-agri-700" />
              {t('workforce.locationLabel')}
            </span>
            <span className="font-bold text-gray-800 truncate max-w-[180px]">{locationText}</span>
          </div>
        </div>

        {/* ERROR DISPLAY IF ANY */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            disabled={sending}
            onClick={onClose}
            className="flex-1 font-bold text-xs"
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="button"
            variant="primary"
            loading={sending}
            onClick={onConfirmOffer}
            className="flex-1 font-black text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Send className="w-4 h-4 mr-1" />
            <span>{sending ? t('workforce.sendingOffer') : t('workforce.sendOffer')}</span>
          </Button>
        </div>

      </div>
    </Modal>
  );
}
