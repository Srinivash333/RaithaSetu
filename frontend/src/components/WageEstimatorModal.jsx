import React, { useState } from 'react';
import { Calculator, Sparkles, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WageEstimatorModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('Paddy');
  const [workType, setWorkType] = useState('Harvesting');
  const [duration, setDuration] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-agri-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-agri-100 rounded-xl text-agri-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{t('estimateWage')}</h3>
            <p className="text-xs text-gray-500">Regional agricultural fair wage benchmarking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-agri-500"
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
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-agri-500"
            >
              <option value="Harvesting">Harvesting</option>
              <option value="Sowing">Sowing</option>
              <option value="Pesticide Spraying">Pesticide Spraying</option>
              <option value="Tilling">Tilling</option>
              <option value="Irrigation">Irrigation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-agri-500"
            >
              <option value="Daily">Daily</option>
              <option value="Hourly">Hourly</option>
              <option value="Weekly">Weekly</option>
            </select>
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

        {result && (
          <div className="bg-agri-50 border border-agri-200 p-4 rounded-xl space-y-2 text-xs animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700 block">
              {t('fairWageRange')}
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-agri-900">
                ₹{result.minWage} – ₹{result.maxWage}
              </span>
              <span className="text-agri-700 font-semibold">{result.unit}</span>
            </div>
            <p className="text-gray-700 text-[11px] leading-relaxed pt-1 border-t border-agri-200/60">
              Suggested wage: <strong className="text-agri-900">₹{result.suggestedWage} {result.unit}</strong>
            </p>
            <p className="text-gray-600 text-[10px] italic">{result.explanation}</p>
          </div>
        )}

      </div>
    </div>
  );
}
