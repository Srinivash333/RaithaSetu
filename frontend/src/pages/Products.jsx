import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { api } from '../services/api';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts({ category, search });
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
          <h1 className="text-2xl font-extrabold text-agri-900">{t('nav.agroStore')}</h1>
          <p className="text-xs text-gray-600 mt-1">High quality seeds, fertilizers, pesticides & tools with store delivery options</p>
        </div>
      </div>

      <FilterPanel
        searchQuery={search}
        onSearchChange={(q) => setSearch(q)}
        category={category}
        onCategoryChange={(c) => setCategory(c)}
        categories={['seeds', 'fertilizers', 'pesticides', 'tools']}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">Loading agro products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onOrder={() => navigate('/login')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
