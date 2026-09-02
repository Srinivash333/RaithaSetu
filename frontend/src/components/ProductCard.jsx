import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Store, Truck, Check } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductCard({ product, onOrder }) {
  const { t } = useLanguage();
  const {
    productName,
    category,
    price,
    unit,
    stockQuantity,
    isAvailableForDelivery,
    deliveryRadiusKm,
    description
  } = product;

  const inStock = stockQuantity > 0;

  return (
    <div className="bg-white rounded-2xl border border-agri-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
            {category}
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {inStock ? `${t('marketplace.inStock')} (${stockQuantity})` : t('marketplace.outOfStock')}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-gray-900">{productName}</h3>
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
      </div>

      <div className="space-y-3 pt-3 border-t border-agri-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-lg font-extrabold text-agri-800">
            {formatCurrency(price)} <span className="text-xs text-gray-500 font-normal">/ {unit}</span>
          </span>

          {isAvailableForDelivery && (
            <span className="flex items-center text-[11px] font-bold text-agri-700 bg-agri-50 px-2 py-1 rounded-lg">
              <Truck className="w-3.5 h-3.5 mr-1" />
              {t('marketplace.deliveryEligible')}
            </span>
          )}
        </div>

        {onOrder && (
          <button
            onClick={() => onOrder(product)}
            disabled={!inStock}
            className="w-full py-2 bg-agri-600 hover:bg-agri-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition shadow-sm"
          >
            {t('marketplace.orderProduct')}
          </button>
        )}
      </div>
    </div>
  );
}
