import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import CropCard from '../components/CropCard';
import FilterPanel from '../components/FilterPanel';
import { api } from '../services/api';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const { t } = useLanguage();
  const { coords } = useLocation();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);

  useEffect(() => {
    fetchCrops();
  }, [searchCrop, maxDistanceKm]);

  const fetchCrops = async () => {
    try {
      const data = await api.getCropListings({
        cropName: searchCrop,
        maxDistanceKm,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      if (data.success) setCrops(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-agri-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-agri-900">{t('marketplace.title')}</h1>
        <p className="text-xs text-gray-600 mt-1">{t('marketplace.subtitle')}</p>
      </div>

      <FilterPanel
        searchQuery={searchCrop}
        onSearchChange={(q) => setSearchCrop(q)}
        maxDistanceKm={maxDistanceKm}
        onDistanceChange={(d) => setMaxDistanceKm(d)}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">{t('common.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <CropCard
              key={crop._id}
              crop={crop}
              onBuy={() => navigate('/register?role=trader')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
