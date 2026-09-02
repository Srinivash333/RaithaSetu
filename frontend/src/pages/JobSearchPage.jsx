import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Search, Briefcase, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobSearchPage() {
  const { t } = useLanguage();
  const { coords } = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);

  useEffect(() => {
    fetchJobs();
  }, [searchCrop, maxDistanceKm]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?crop=${searchCrop}&maxDistanceKm=${maxDistanceKm}&latitude=${coords.latitude}&longitude=${coords.longitude}`);
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-900">{t('navWorkforce')}</h1>
          <p className="text-xs text-gray-600 mt-1">Browse location-aware agricultural jobs across Karnataka</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <input
            type="text"
            placeholder="Filter crop (e.g. Paddy)..."
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-agri-500"
          />

          <select
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value={25}>Within 25 km</option>
            <option value={50}>Within 50 km</option>
            <option value={100}>All Karnataka</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">Loading jobs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                  <span className="text-xs text-gray-500">{job.farmerId?.name} • {job.locationName}</span>
                </div>
                <span className="bg-agri-100 text-agri-800 text-[11px] font-bold px-2 py-0.5 rounded">
                  {job.distanceKm ? `${job.distanceKm} km away` : 'Nearby'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{job.description}</p>
              <div className="flex justify-between items-center pt-2 border-t border-agri-100 text-xs">
                <span className="font-bold text-agri-800">₹{job.wage} / {job.duration.toLowerCase()}</span>
                <Link to="/register?role=worker" className="bg-agri-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  Login to Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
