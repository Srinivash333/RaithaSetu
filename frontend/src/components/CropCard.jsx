import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, ShoppingBag, CheckCircle } from 'lucide-react';
import { formatDistanceKm, formatCurrency } from '../utils/helpers';

export default function CropCard({ crop, onBuy }) {
  const { t } = useLanguage();
  const {
    cropName,
    variety,
    quantity,
    unit,
    expectedPricePerUnit,
    location,
    farmerId,
    distanceKm
  } = crop;

  const farmerName = farmerId?.name || 'Farmer';
  const totalValue = quantity * expectedPricePerUnit;

  return (
    <div className="bg-white rounded-2xl border border-agri-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              {t('marketplace.title')}
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 mt-1">{cropName}</h3>
            {variety && <p className="text-xs text-gray-500 font-medium">Variety: {variety}</p>}
          </div>

          <div className="text-right">
            <span className="text-base font-extrabold text-agri-700 block">
              {formatCurrency(expectedPricePerUnit)} / {unit}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">{t('marketplace.totalPrice')}: {formatCurrency(totalValue)}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-gray-600 border-t border-agri-100">
          <span className="font-bold text-gray-800">{t('marketplace.quantity')}: {quantity} {unit}s</span>
          {distanceKm !== undefined && (
            <span className="flex items-center text-agri-700 bg-agri-50 px-2 py-0.5 rounded-md font-semibold">
              <MapPin className="w-3 h-3 mr-1 text-agri-600" />
              {formatDistanceKm(distanceKm)}
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-agri-100 flex items-center justify-between text-xs">
        <div className="text-gray-500 text-[11px]">
          {t('marketplace.farmerName')}: <strong className="text-gray-800">{farmerName}</strong>
        </div>

        {onBuy && (
          <button
            onClick={() => onBuy(crop)}
            className="flex items-center space-x-1 px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('marketplace.buyNow')}</span>
          </button>
        )}
      </div>

    </div>
  );
}
