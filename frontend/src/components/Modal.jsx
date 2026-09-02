import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-white rounded-2xl ${maxWidth} w-full p-6 shadow-2xl border border-agri-200 relative max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-lg font-bold text-agri-900 mb-4 border-b border-agri-100 pb-3">{title}</h2>
        )}

        {children}
      </div>
    </div>
  );
}
