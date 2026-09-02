import React, { useState } from 'react';
import { useLocation, KARNATAKA_DISTRICTS } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Loader2, RefreshCw, X, Search, Check, Navigation, AlertTriangle } from 'lucide-react';

export default function LocationButton({ compact = false }) {
  const { locationName, locationNameEN, isDetecting, permissionDenied, requestLocation, refreshLocation, selectCity, districts } = useLocation();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const districtList = districts || KARNATAKA_DISTRICTS;

  const filteredDistricts = districtList.filter(d =>
    d.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.kn.includes(searchQuery)
  );

  const handleRefresh = (e) => {
    e.stopPropagation();
    refreshLocation();
  };

  const handleSelectDistrict = (district) => {
    selectCity(district);
    setIsOpen(false);
  };

  const isUnavailable = permissionDenied || locationName.includes('unavailable') || locationName.includes('ಲಭ್ಯವಿಲ್ಲ');

  return (
    <>
      <div className="flex items-center space-x-1 shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={isDetecting}
          className={
            compact
              ? `border px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shrink-0 active:scale-95 ${
                  isUnavailable
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                }`
              : `border px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 shadow-sm active:scale-95 ${
                  isUnavailable
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                }`
          }
          title={language === 'kn' ? 'ಸ್ಥಳ ವಿವರಗಳು ಮತ್ತು ಆಯ್ಕೆ' : 'Location details and selection'}
          aria-label={language === 'kn' ? 'ಸ್ಥಳ ವಿವರಗಳು ಮತ್ತು ಆಯ್ಕೆ' : 'Location details and selection'}
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {t('location.detecting')}
              </span>
            </>
          ) : (
            <>
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isUnavailable ? 'text-amber-600' : 'text-emerald-600'}`} />
              <span className="truncate max-w-[100px] sm:max-w-[120px] xl:max-w-[120px] 2xl:max-w-[160px] inline-block align-middle font-semibold">
                {locationName}
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                className="p-0.5 hover:bg-black/10 rounded transition text-gray-700 hover:text-emerald-800 shrink-0 ml-0.5"
                title={language === 'kn' ? 'ಸ್ಥಳವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ' : 'Refresh current GPS location'}
                aria-label={language === 'kn' ? 'ಸ್ಥಳವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ' : 'Refresh current GPS location'}
              >
                <RefreshCw className={`w-3 h-3 ${isDetecting ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </>
          )}
        </button>
      </div>

      {/* Location Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100 flex flex-col max-h-[85vh] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {language === 'kn' ? 'ಸ್ಥಳ ಮಾಹಿತಿ ಮತ್ತು ಆಯ್ಕೆ' : 'Device Location & Selection'}
                  </h3>
                  <p className="text-xs text-emerald-100/90">
                    {language === 'kn' ? 'ಉಪಕರಣದ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಅಥವಾ ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ' : 'Current device location or manual selection'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permission explanation banner */}
            <div className="p-3.5 bg-emerald-50/90 border-b border-emerald-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-900 leading-snug font-medium">
                {t('location.permissionExplanation')}
              </p>
            </div>

            {/* Retry / Enable GPS Button */}
            <div className="p-3.5 border-b border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => {
                  refreshLocation();
                  setIsOpen(false);
                }}
                disabled={isDetecting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition"
              >
                {isDetecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Navigation className="w-4 h-4 text-emerald-200" />
                )}
                <span>
                  {isUnavailable
                    ? `📍 ${t('location.enableLocation')} / ${t('location.retry')}`
                    : `↻ ${t('location.useCurrent')} (GPS)`}
                </span>
              </button>
            </div>

            {/* Search Box for Manual Fallback */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'kn' ? 'ಜಿಲ್ಲೆ ಹುಡುಕಿ...' : 'Search Karnataka district...'}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* District Grid / List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-1.5 custom-scrollbar">
              <div className="text-[11px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಗಳು' : 'Karnataka Districts'}
              </div>
              {filteredDistricts.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  {language === 'kn' ? 'ಯಾವುದೇ ಜಿಲ್ಲೆ ಕಂಡುಬಂದಿಲ್ಲ' : 'No matching district found'}
                </div>
              ) : (
                filteredDistricts.map((d) => {
                  const isSelected = locationNameEN === d.en || locationName === (language === 'kn' ? d.kn : d.en);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => handleSelectDistrict(d)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-emerald-100/80 text-emerald-900 font-bold border border-emerald-300'
                          : 'hover:bg-gray-100 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`} />
                        <span className="truncate">
                          {language === 'kn' ? d.kn : d.en}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
