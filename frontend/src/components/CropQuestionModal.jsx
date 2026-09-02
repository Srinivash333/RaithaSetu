import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Send, ShoppingBag } from 'lucide-react';

export default function CropQuestionModal({ isOpen, onClose, cropListingId, traderId, traderName, cropName }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && cropListingId && traderId) {
      fetchMessages();
    }
  }, [isOpen, cropListingId, traderId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getCropMessages(token, cropListingId, traderId);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching crop Q&A messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSending(true);
    try {
      const data = await api.sendCropMessage(token, {
        cropListingId,
        traderId,
        text: inputText.trim()
      });

      if (data.success) {
        setInputText('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending crop message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`💬 Crop Q&A — ${traderName || 'Trader'}`}
    >
      <div className="space-y-4 text-xs animate-fade-in">
        
        {/* CROP INFO BAR */}
        {cropName && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-emerald-950">
            <span className="font-extrabold text-xs flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              Crop: {cropName}
            </span>
            <span className="text-[10px] bg-emerald-700 text-white font-black px-2 py-0.5 rounded uppercase">Trader Q&A</span>
          </div>
        )}

        {/* CHAT MESSAGES DISPLAY */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-64 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-6 font-semibold">
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-6 space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-600">No questions asked yet.</p>
              <p className="text-[11px] text-gray-400">Ask the trader about price matching, quantity acceptance, variety, or pickup dates.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId?._id === user._id || m.senderId === user._id;
              const senderName = m.senderId?.name || (m.senderRole === 'farmer' ? 'Farmer' : 'Trader');

              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] space-y-1 shadow-xs ${
                      isMine
                        ? 'bg-emerald-800 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex justify-between items-center space-x-2 text-[10px] font-bold opacity-80">
                      <span>{isMine ? 'You' : senderName}</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">{m.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask trader a question (e.g. Can you buy all 30 boxes?)..."
            className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Button type="submit" loading={sending} variant="primary" className="shrink-0 font-bold text-xs px-4 bg-emerald-700 hover:bg-emerald-800 text-white">
            <Send className="w-4 h-4 mr-1" />
            <span>Send Question</span>
          </Button>
        </form>

      </div>
    </Modal>
  );
}
