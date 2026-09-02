import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, Filter, MapPin } from 'lucide-react';

export default function FilterPanel({
  searchQuery = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  categories = [],
  maxDistanceKm = 50,
  onDistanceChange
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* SEARCH INPUT */}
      {onSearchChange && (
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('marketplace.searchPlaceholder')}
            className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
          />
        </div>
      )}

      {/* CATEGORY FILTER */}
      {onCategoryChange && categories.length > 0 && (
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-700 shrink-0">{t('marketplace.filterByCategory')}</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-agri-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* DISTANCE RADIUS SLIDER / OPTIONS */}
      {onDistanceChange && (
        <div className="flex items-center space-x-2 w-full md:w-auto bg-agri-50 p-2 rounded-xl border border-agri-200">
          <MapPin className="w-4 h-4 text-agri-600 shrink-0" />
          <span className="text-xs font-bold text-agri-900 shrink-0">{t('marketplace.filterByDistance')}</span>
          <div className="flex space-x-1 text-xs">
            {[10, 25, 50, 100].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => onDistanceChange(dist)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  maxDistanceKm === dist ? 'bg-agri-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
                }`}
              >
                {dist} km
              </button>
            ))}
            <button
              type="button"
              onClick={() => onDistanceChange(999)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                maxDistanceKm > 100 ? 'bg-agri-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'
              }`}
            >
              {t('marketplace.allDistance')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
