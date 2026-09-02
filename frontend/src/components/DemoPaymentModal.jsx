import React, { useState } from 'react';
import { CreditCard, QrCode, Banknote, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DemoPaymentModal({ isOpen, onClose, totalAmount, onSuccess }) {
  const { t } = useLanguage();
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(method);
        setSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-agri-200 relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {/* DEMO Notice */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center space-x-2.5 mb-5 text-amber-800 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-900">
              {t('demoPayment')}
            </span>
            <span>This is a simulated sandbox payment. No real banking details required.</span>
          </div>
        </div>

        {!success ? (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Payment</h3>
            <p className="text-xs text-gray-500 mb-4">Total Payable: <span className="text-base font-bold text-agri-700">₹{totalAmount}</span></p>

            <div className="space-y-3 mb-6">
              <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${method === 'upi' ? 'border-agri-600 bg-agri-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="accent-agri-600" />
                <QrCode className="w-5 h-5 text-agri-600" />
                <div className="flex-1">
                  <span className="font-semibold text-xs text-gray-900 block">UPI / BHIM / GPay</span>
                  <span className="text-[11px] text-gray-500">Scan QR or enter Virtual Payment Address</span>
                </div>
              </label>

              <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${method === 'card' ? 'border-agri-600 bg-agri-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="accent-agri-600" />
                <CreditCard className="w-5 h-5 text-agri-600" />
                <div className="flex-1">
                  <span className="font-semibold text-xs text-gray-900 block">Debit / Credit Card (Demo)</span>
                  <span className="text-[11px] text-gray-500">Simulate instant card payment</span>
                </div>
              </label>

              <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${method === 'cod' ? 'border-agri-600 bg-agri-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} className="accent-agri-600" />
                <Banknote className="w-5 h-5 text-agri-600" />
                <div className="flex-1">
                  <span className="font-semibold text-xs text-gray-900 block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-gray-500">Pay directly to store or trader upon receipt</span>
                </div>
              </label>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
            >
              {processing ? 'Processing Demo Payment...' : `Complete ₹${totalAmount} Demo Payment`}
            </button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-agri-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-extrabold text-agri-900">Payment Successful!</h3>
            <p className="text-xs text-gray-600">Your order has been confirmed and forwarded to the seller.</p>
          </div>
        )}

      </div>
    </div>
  );
}
