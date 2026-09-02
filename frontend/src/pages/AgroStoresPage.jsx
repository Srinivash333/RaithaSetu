import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { getStoreImage, handleStoreImageError } from '../utils/storeImages';
import { Store, MapPin, Phone, Star, Clock, Search, ChevronRight, Truck, Package, ShieldCheck } from 'lucide-react';

export default function AgroStoresPage() {
  const { t } = useLanguage();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, [searchQuery]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await api.getAllStores({ search: searchQuery });
      if (data.success) {
        setStores(data.stores || []);
      }
    } catch (err) {
      console.error('Error fetching agro stores:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-agri-900 via-agri-950 to-emerald-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center">
            <Store className="w-3.5 h-3.5 mr-1" /> {t('nav.agroStore')}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('store.browseStores')}</h1>
          <p className="text-xs text-agri-200 leading-relaxed">
            {t('store.browseStoresSub')}
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80 relative z-10">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t('store.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-agri-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* STORES GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-agri-200">
          {t('common.loading')}
        </div>
      ) : stores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-agri-200 text-xs space-y-2">
          <Store className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="font-bold text-gray-700">{t('common.na')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const isOpen = store.shopStatus !== 'closed';
            const storeImg = getStoreImage(store._id || store.userId, store.shopImage);

            return (
              <div key={store._id} className="bg-white rounded-3xl border border-agri-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                
                {/* STORE IMAGE BANNER */}
                <div className="h-44 relative bg-gray-100">
                  <img
                    src={storeImg}
                    alt={store.storeName}
                    onError={(e) => handleStoreImageError(e, store._id || store.userId)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                      isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isOpen ? `● ${t('status.open')}` : `○ ${t('status.closed')}`}
                    </span>

                    <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center shadow-sm">
                      <Star className="w-3 h-3 mr-1 fill-amber-950" /> {store.ratingAverage || 4.7} ({store.ratingCount || 18})
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-black text-lg leading-snug truncate">{store.storeName}</h3>
                      <span className="bg-emerald-500/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center shrink-0">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200 font-semibold flex items-center">
                      <Store className="w-3.5 h-3.5 mr-1 shrink-0" /> {t('store.ownerLabel')} {store.ownerName}
                    </p>
                  </div>
                </div>

                {/* STORE DETAILS */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {store.shopDescription}
                    </p>

                    <div className="space-y-1.5 text-xs text-gray-700 pt-1">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1.5 text-agri-600 shrink-0" />
                        <span className="truncate">{store.storeAddress}</span>
                      </div>
                      
                      {/* REAL REGISTERED PHONE NUMBER LINK */}
                      <div className="flex items-center text-gray-700 font-bold">
                        <Phone className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                        {store.contactNumber ? (
                          <a href={`tel:${store.contactNumber}`} className="hover:underline text-emerald-700">
                            📞 {store.contactNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">{t('store.phoneNotAvailable')}</span>
                        )}
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1.5 text-agri-600 shrink-0" />
                        <span>{t('store.hoursLabel')} {store.openingHours}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-[11px]">
                        <Truck className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                        <span>{t('store.deliveryEnabledWithin', { radius: store.deliveryRadiusKm || 25 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM FOOTER & ACTION */}
                  <div className="pt-3 border-t border-agri-100 flex items-center justify-between">
                    <div className="text-[11px] font-extrabold text-agri-900 flex items-center">
                      <Package className="w-3.5 h-3.5 mr-1 text-agri-600" />
                      <span>{t('store.productsCount', { count: store.productCount || 0 })}</span>
                    </div>

                    <Link
                      to={`/stores/${store._id}`}
                      className="bg-agri-600 hover:bg-agri-700 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1 shadow-sm"
                    >
                      <span>{t('store.openShop')}</span>
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
