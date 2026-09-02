import React from 'react';
import Modal from './Modal';
import { Building2, MapPin, Phone, Scale, Clock, ShieldCheck, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TraderShopModal({ isOpen, onClose, trader, requirements = [] }) {
  const { t } = useLanguage();

  if (!isOpen || !trader) return null;

  const businessName = trader.businessName || 'APMC Trader Shop';
  const ownerName = trader.ownerName || trader.name || 'APMC Buyer';
  const location = trader.businessLocation || trader.address || 'Mandya Yard';
  const phone = trader.contactNumber || trader.phone || '+91 9845012345';
  const image = trader.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80';
  const capacity = trader.purchaseCapacity || '10-50 Tons/month';
  const openingHours = trader.openingHours || '08:00 AM - 07:00 PM';
  const description = trader.businessDescription || 'Direct crop buyer registered at APMC yard for fresh harvest procurement.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🏢 ${businessName}`}
    >
      <div className="space-y-4 text-xs animate-fade-in max-h-[75vh] overflow-y-auto pr-1">
        
        {/* TRADER BANNER IMAGE */}
        <div className="h-44 rounded-2xl overflow-hidden relative bg-slate-900 border border-slate-200">
          <img
            src={image}
            alt={businessName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
            ● APMC Verified Buyer
          </div>
        </div>

        {/* DETAILS HEADER */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900">{businessName}</h3>
          <p className="text-gray-600 leading-relaxed text-xs">{description}</p>
        </div>

        {/* TRADER META INFO GRID */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs text-gray-800">
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Owner: <strong>{ownerName}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">Location: <strong>{location}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Phone: <strong>{phone}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <Scale className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Capacity: <strong>{capacity}</strong></span>
          </div>
        </div>

        {/* TARGET CROPS */}
        {trader.interestedCrops?.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Interested Crops</span>
            <div className="flex flex-wrap gap-1.5">
              {trader.interestedCrops.map((c) => (
                <span key={c} className="bg-emerald-50 text-emerald-950 border border-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE BUYING REQUIREMENTS */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="font-black text-xs text-gray-900 flex items-center space-x-1.5">
            <Tag className="w-4 h-4 text-emerald-700" />
            <span>Active Commodity Requirements ({requirements.length})</span>
          </h4>

          {requirements.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-gray-500">
              No active commodity requirements listed right now. You can call directly to offer crops.
            </div>
          ) : (
            <div className="space-y-2">
              {requirements.map((req) => (
                <div key={req._id} className="p-3 bg-white border border-agri-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-black text-xs text-gray-900">
                    <span>{req.cropName} ({req.variety || 'Standard'})</span>
                    <span className="text-emerald-800">₹{req.offeredPricePerUnit} / {req.unit}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>Quantity Needed: {req.quantityNeeded} {req.unit}s</span>
                    <span>Location: {req.preferredLocation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PHONE DIAL ACTION */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
            APMC Licensed Direct Crop Buyer
          </span>

          <a
            href={`tel:${phone}`}
            className="bg-slate-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Trader: {phone}</span>
          </a>
        </div>

      </div>
    </Modal>
  );
}
