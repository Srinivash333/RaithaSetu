import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, X, Check, Users, MapPin, Star, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WageEstimatorModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('Paddy');
  const [workType, setWorkType] = useState('Harvesting');
  const [duration, setDuration] = useState('Daily');
  const [workersRequired, setWorkersRequired] = useState(5);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      handleEstimate();
    }
  }, [isOpen, crop, workType, duration]);

  if (!isOpen) return null;

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations/wages/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, workType, duration })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.estimate);
        if (data.availableWorkers) {
          setAvailableWorkers(data.availableWorkers);
        }
      }
    } catch (err) {
      console.error('Wage estimation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerCountChange = (newCount) => {
    const validCount = Math.max(1, newCount);
    setWorkersRequired(validCount);
    if (selectedWorkerIds.length > validCount) {
      setSelectedWorkerIds(prev => prev.slice(0, validCount));
    }
    setWarningMessage('');
  };

  const toggleWorkerSelection = (workerId) => {
    if (selectedWorkerIds.includes(workerId)) {
      setSelectedWorkerIds(prev => prev.filter(id => id !== workerId));
      setWarningMessage('');
    } else {
      if (selectedWorkerIds.length >= workersRequired) {
        setWarningMessage(`Maximum ${workersRequired} workers can be selected for this task.`);
        setTimeout(() => setWarningMessage(''), 4000);
        return;
      }
      setSelectedWorkerIds(prev => [...prev, workerId]);
      setWarningMessage('');
    }
  };

  const recommendedWageVal = result?.recommendedWage || result?.suggestedWage || 750;
  const durationPeriod = result?.durationPeriod || (duration === 'Hourly' ? 'hour' : duration === 'Weekly' ? 'week' : 'day');
  const totalWageVal = recommendedWageVal * workersRequired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg sm:max-w-xl w-full p-6 shadow-2xl border border-agri-200 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2.5 bg-agri-100 rounded-xl text-agri-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{t('estimateWage')}</h3>
            <p className="text-xs text-gray-500">Regional agricultural fair wage benchmarking</p>
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-agri-500 font-medium"
            >
              <option value="Paddy">Paddy</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Tomato">Tomato</option>
              <option value="Cotton">Cotton</option>
              <option value="Arecanut">Arecanut</option>
              <option value="Coffee">Coffee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Work Task</label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-agri-500 font-medium"
            >
              <option value="Harvesting">Harvesting</option>
              <option value="Sowing">Sowing</option>
              <option value="Pesticide Spraying">Pesticide Spraying</option>
              <option value="Tilling">Tilling</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Weeding">Weeding</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-agri-500 font-medium"
            >
              <option value="Daily">Daily</option>
              <option value="Hourly">Hourly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Workers Required</label>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handleWorkerCountChange(workersRequired - 1)}
                className="w-7 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={workersRequired}
                onChange={(e) => handleWorkerCountChange(parseInt(e.target.value) || 1)}
                className="w-full text-center border border-gray-300 rounded-lg py-1.5 text-xs font-bold focus:ring-2 focus:ring-agri-500"
              />
              <button
                type="button"
                onClick={() => handleWorkerCountChange(workersRequired + 1)}
                className="w-7 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition shrink-0"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleEstimate}
          disabled={loading}
          className="w-full bg-agri-600 hover:bg-agri-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm mb-4"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
          <span>{loading ? 'Calculating...' : 'Calculate Fair Wage'}</span>
        </button>

        {/* SINGLE RECOMMENDED WAGE DISPLAY */}
        {result && (
          <div className="bg-agri-50 border border-agri-200 p-4 rounded-2xl space-y-3 text-xs animate-fade-in mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agri-200/80 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-agri-700 block">
                  Recommended Wage
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-2xl font-black text-agri-900">
                    ₹{recommendedWageVal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-agri-700 font-bold text-xs">
                    / worker / {durationPeriod}
                  </span>
                </div>
              </div>

              <div className="sm:text-right bg-white/70 p-2.5 rounded-xl border border-agri-200/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-agri-700 block">
                  Total Estimated Wage
                </span>
                <div className="text-lg font-black text-agri-900 mt-0.5">
                  ₹{totalWageVal.toLocaleString('en-IN')}
                  <span className="text-xs font-semibold text-agri-700"> / {durationPeriod}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-agri-800 font-medium pt-0.5">
              <span>Workers Required: <strong className="text-agri-900 font-bold">{workersRequired}</strong></span>
              <span>Calculation: <strong className="text-agri-900 font-bold">₹{recommendedWageVal} × {workersRequired}</strong></span>
            </div>

            {result.explanation && (
              <p className="text-gray-600 text-[10px] italic pt-1 border-t border-agri-200/50">
                {result.explanation}
              </p>
            )}
          </div>
        )}

        {/* AVAILABLE WORKERS SECTION */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-agri-600" />
              <span>Available Workers</span>
            </h4>
            <span className="text-[11px] font-bold text-agri-800 bg-agri-100 px-2.5 py-0.5 rounded-full">
              Selected: {selectedWorkerIds.length} / {workersRequired}
            </span>
          </div>

          {warningMessage && (
            <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium animate-fade-in flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {availableWorkers.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableWorkers.map((item) => {
                const workerId = item.worker?._id;
                const isSelected = selectedWorkerIds.includes(workerId);
                return (
                  <div
                    key={workerId || item.worker?.name}
                    onClick={() => toggleWorkerSelection(workerId)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-agri-50 border-agri-500 shadow-sm ring-1 ring-agri-500'
                        : 'bg-white border-gray-200 hover:border-agri-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by card onClick
                        className="w-4 h-4 text-agri-600 rounded border-gray-300 focus:ring-agri-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{item.worker?.name}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>{item.profile?.ratingAverage || 4.5}</span>
                          </span>
                          {item.matchPercentage !== undefined && (
                            <span className="text-[10px] bg-agri-100 text-agri-800 font-bold px-1.5 py-0.2 rounded">
                              {item.matchPercentage}% Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-0.5">
                          <span>{(item.profile?.skills || []).slice(0, 2).join(', ') || workType}</span>
                          {item.distanceKm !== undefined && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-0.5 text-gray-600 font-medium">
                                <MapPin className="w-3 h-3 text-agri-600" />
                                <span>{item.distanceKm} km away</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-agri-900 block">
                        ₹{item.profile?.expectedWagePerDay || recommendedWageVal}/day
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {item.profile?.experienceYears || 1} yrs exp
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-500 font-medium">
              No available workers found for this work.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
