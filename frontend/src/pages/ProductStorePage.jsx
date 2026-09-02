import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Store, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductStorePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCat]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?category=${selectedCat}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
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
          <h1 className="text-2xl font-extrabold text-agri-900">{t('navAgroStore')}</h1>
          <p className="text-xs text-gray-600 mt-1">High quality seeds, fertilizers, pesticides & tools with store delivery options</p>
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
        >
          <option value="">All Categories</option>
          <option value="seeds">Seeds</option>
          <option value="fertilizers">Fertilizers</option>
          <option value="pesticides">Pesticides</option>
          <option value="tools">Tools</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">Loading agro products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-agri-100 text-agri-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{p.category}</span>
                <h3 className="font-bold text-sm text-gray-900">{p.productName}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                <div className="text-[11px] text-agri-700 font-semibold flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1" />
                  <span>{p.isEligibleForDelivery ? 'Delivery Eligible' : 'In-Store Pickup'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-agri-100 flex justify-between items-center text-xs">
                <span className="font-bold text-agri-900">₹{p.price} / {p.unit}</span>
                <Link to="/login" className="bg-agri-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
