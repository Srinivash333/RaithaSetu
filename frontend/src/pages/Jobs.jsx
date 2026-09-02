import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import JobCard from '../components/JobCard';
import FilterPanel from '../components/FilterPanel';
import { api } from '../services/api';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Jobs() {
  const { t } = useLanguage();
  const { coords } = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);

  useEffect(() => {
    fetchJobs();
  }, [searchCrop, maxDistanceKm]);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs({
        crop: searchCrop,
        maxDistanceKm,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      if (data.success) setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-agri-900">{t('nav.workforceJobs')}</h1>
          <p className="text-xs text-gray-600 mt-1">Browse location-aware agricultural jobs across Karnataka</p>
        </div>
      </div>

      <FilterPanel
        searchQuery={searchCrop}
        onSearchChange={(query) => setSearchCrop(query)}
        maxDistanceKm={maxDistanceKm}
        onDistanceChange={(dist) => setMaxDistanceKm(dist)}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">Loading jobs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={() => navigate('/register?role=worker')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
