import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Scale, Clock, Search, ChevronRight, ShieldCheck, Tag } from 'lucide-react';

export default function TradersPage() {
  const { t } = useLanguage();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTraders();
  }, [searchQuery]);

  const fetchTraders = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTraders({ search: searchQuery });
      if (data.success) {
        setTraders(data.traders || []);
      }
    } catch (err) {
      console.error('Error fetching traders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-agri-950 to-slate-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1" /> {t('nav.traders')}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('trader.browseTraders')}</h1>
          <p className="text-xs text-agri-200 leading-relaxed">
            {t('trader.browseTradersSub')}
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80 relative z-10">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-agri-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* TRADERS GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
          {t('common.loading')}
        </div>
      ) : traders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-agri-200 text-xs space-y-2">
          <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="font-bold text-gray-700">{t('common.na')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {traders.map((trader) => {
            const isOpen = trader.businessStatus !== 'closed';

            return (
              <div key={trader._id} className="bg-white rounded-3xl border border-agri-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                
                {/* TRADER IMAGE BANNER */}
                <div className="h-44 relative bg-gray-100">
                  <img
                    src={trader.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'}
                    alt={trader.businessName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                      isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isOpen ? `● ${t('status.open')}` : `○ ${t('status.closed')}`}
                    </span>

                    <span className="bg-slate-800 text-slate-200 text-[10px] font-black px-2.5 py-0.5 rounded-lg flex items-center shadow-sm">
                      <Scale className="w-3 h-3 mr-1 text-emerald-400" /> {trader.purchaseCapacity || 'High Capacity'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg leading-snug">{trader.businessName}</h3>
                    <p className="text-[11px] text-emerald-200 font-semibold flex items-center mt-0.5">
                      <Building2 className="w-3.5 h-3.5 mr-1 shrink-0" /> {t('trader.ownerName')}: {trader.ownerName}
                    </p>
                  </div>
                </div>

                {/* TRADER DETAILS */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {trader.businessDescription}
                    </p>

                    <div className="space-y-1 text-xs text-gray-700 pt-1">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1.5 text-agri-600 shrink-0" />
                        <span className="truncate">{trader.businessLocation}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-1.5 text-agri-600 shrink-0" />
                        <span>{trader.contactNumber}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1.5 text-agri-600 shrink-0" />
                        <span>{t('store.hoursLabel')} {trader.openingHours}</span>
                      </div>
                    </div>

                    {/* TARGET CROPS */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{t('trader.targetSourcingList')}</span>
                      <div className="flex flex-wrap gap-1">
                        {trader.interestedCrops?.map((crop) => (
                          <span key={crop} className="bg-agri-50 text-agri-900 border border-agri-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="pt-3 border-t border-agri-100 flex items-center justify-end">
                    <Link
                      to={`/traders/${trader._id}`}
                      className="bg-agri-900 hover:bg-agri-950 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow-sm"
                    >
                      <span>{t('trader.businessProfile')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
