import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, Building2, Send, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CropOfferModal({
  isOpen,
  onClose,
  trader,
  cropListing,
  onOfferSentSuccess
}) {
  const { token } = useAuth();
  const { t } = useLanguage();

  const availableQty = Math.max(0, (cropListing?.quantity || 0) - (cropListing?.soldQuantity || 0));
  const defaultPrice = cropListing?.expectedPricePerUnit || 0;
  const unit = cropListing?.unit || 'box';

  const [quantity, setQuantity] = useState(availableQty || 10);
  const [pricePerUnit, setPricePerUnit] = useState(defaultPrice);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (cropListing) {
      const avail = Math.max(0, (cropListing.quantity || 0) - (cropListing.soldQuantity || 0));
      setQuantity(avail > 0 ? avail : 1);
      setPricePerUnit(cropListing.expectedPricePerUnit || 0);
      setMessage('');
      setErrorMsg('');
    }
  }, [cropListing, isOpen]);

  if (!isOpen || !trader || !cropListing) return null;

  const totalAmount = (Number(quantity) || 0) * (Number(pricePerUnit) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const qtyNum = Number(quantity);
    const priceNum = Number(pricePerUnit);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Please enter a valid quantity greater than 0.');
      return;
    }

    if (qtyNum > availableQty) {
      setErrorMsg(`Offered quantity cannot exceed available stock (${availableQty} ${unit}s).`);
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid asking price per unit.');
      return;
    }

    setSending(true);

    try {
      const data = await api.createNegotiation(token, {
        cropListingId: cropListing._id,
        traderId: trader._id,
        quantity: qtyNum,
        pricePerUnit: priceNum,
        unit: cropListing.unit,
        message: message.trim() || `Crop offer of ${qtyNum} ${unit}s at ₹${priceNum}/${unit}`
      });

      if (data && data.success) {
        if (onOfferSentSuccess) {
          onOfferSentSuccess(trader._id, 'Crop offer sent successfully.');
        }
        onClose();
      } else {
        if (data.status === 409 || data.error?.includes('already')) {
          setErrorMsg('An offer has already been sent to this trader.');
        } else {
          setErrorMsg(data.error || 'Unable to send crop offer right now. Please try again.');
        }
      }
    } catch (err) {
      console.error('Create crop offer error:', err);
      setErrorMsg('Unable to send crop offer right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🌾 Send Crop Offer"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs animate-fade-in">
        
        {/* ERROR DISPLAY */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center space-x-2 font-bold text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HEADER META CARD */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-gray-900 font-extrabold">
            <span className="flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
              Trader: {trader.businessName || trader.name}
            </span>
            <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-black">APMC Buyer</span>
          </div>

          <div className="flex items-center justify-between text-gray-600 font-semibold text-[11px] pt-1 border-t border-slate-200">
            <span className="flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Crop: {cropListing.cropName} ({cropListing.variety || 'Standard'})
            </span>
            <span>Available: <strong>{availableQty} {unit}s</strong></span>
          </div>
        </div>

        {/* QUANTITY AND PRICE INPUTS */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Quantity to Offer ({unit}s)
            </label>
            <input
              type="number"
              required
              min="1"
              max={availableQty}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Max available: {availableQty}</span>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Price Offered (₹ / {unit})
            </label>
            <input
              type="number"
              required
              min="1"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-900"
            />
            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Asking: ₹{defaultPrice}</span>
          </div>
        </div>

        {/* CALCULATED TOTAL SUMMARY */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex justify-between items-center text-emerald-950 font-black">
          <span>Total Offer Value:</span>
          <span className="text-base text-emerald-800">₹{totalAmount.toLocaleString()}</span>
        </div>

        {/* OPTIONAL MESSAGE */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">
            Optional Message / Terms
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Crop available for immediate APMC yard pickup. Quality verified."
            className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* PAYMENT HANDLING DISCLAIMER */}
        <div className="text-[11px] text-gray-500 flex items-center space-x-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payment is handled directly between farmer and trader upon harvest pickup.</span>
        </div>

        {/* FORM BUTTONS */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1 font-bold text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={sending}
            variant="primary"
            className="flex-1 font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>{sending ? 'Sending...' : 'Send Crop Offer'}</span>
          </Button>
        </div>

      </form>
    </Modal>
  );
}
