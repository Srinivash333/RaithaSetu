import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { Sparkles, X, Send, Bot, Trash2, Image as ImageIcon, MapPin } from 'lucide-react';
import { api } from '../services/api';

export default function AIChatbot() {
  const { t, language } = useLanguage();
  const { locationName } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: t('aiChat.welcomeMsg') }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() && !selectedImage) return;

    const userMessage = {
      sender: 'user',
      text: query,
      image: imagePreview
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    if (!textToSend) setInput('');
    const currentImg = selectedImage;
    removeImage();
    setLoading(true);

    try {
      // Pass conversation history (excluding initial greeting)
      const historyPayload = updatedMessages
        .slice(1)
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await api.chatAI(
        query,
        language,
        locationName || '',
        historyPayload,
        currentImg
      );

      if (res && res.success) {
        setMessages([...updatedMessages, { sender: 'ai', text: res.reply || res.answer }]);
      } else {
        setMessages([
          ...updatedMessages,
          {
            sender: 'ai',
            text: language === 'kn'
              ? 'ರೈತಮಿತ್ರ ಎಐ ಸರ್ವರ್ ಸಂಪರ್ಕಿಸುವಲ್ಲಿ ಅಡಚಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
              : 'Unable to connect to RaithaMitra AI advisor. Please try again.'
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          sender: 'ai',
          text: language === 'kn'
            ? 'ಸಂಪರ್ಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ.'
            : 'Connection error. Please check your internet connectivity.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render bold markdown (**text**) cleanly
  const renderFormattedText = (content) => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-agri-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-agri-600 hover:bg-agri-700 text-white p-3.5 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105 border-2 border-white"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 fill-current animate-pulse" />
          <span className="text-xs font-extrabold pr-1">{t('aiChat.headerTitle')}</span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white rounded-3xl border border-agri-200 shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[530px] animate-fade-in">
          
          {/* HEADER */}
          <div className="bg-agri-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-agri-600 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs flex items-center gap-1">
                  {t('aiChat.headerTitle')}
                </h3>
                <span className="text-[10px] text-agri-300 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-agri-400" />
                  {locationName || (language === 'kn' ? 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ' : 'Location unavailable')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([{ sender: 'ai', text: t('aiChat.welcomeMsg') }])}
                className="p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-800 transition"
                title={t('aiChat.clearChat')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-agri-300 hover:text-white rounded-lg hover:bg-agri-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-agri-50/40 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-agri-600 text-white rounded-br-none shadow'
                      : 'bg-white border border-agri-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Crop Attachment"
                      className="w-full max-h-36 object-cover rounded-lg mb-2 border border-agri-300"
                    />
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{renderFormattedText(m.text)}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-agri-200 p-3 rounded-2xl text-agri-800 text-[11px] flex items-center space-x-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-agri-600 animate-spin" />
                  <span>{t('aiChat.analyzingMsg')}</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* SUGGESTED PRESET QUESTIONS */}
          {messages.length < 3 && (
            <div className="p-2 bg-white border-t border-agri-100 flex flex-wrap gap-1">
              {[t('aiChat.q1'), t('aiChat.q2'), t('aiChat.q3'), t('aiChat.q4')].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-agri-50 hover:bg-agri-100 text-agri-900 border border-agri-200 px-2 py-1 rounded-lg text-left truncate max-w-full font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* IMAGE PREVIEW BAR */}
          {imagePreview && (
            <div className="px-3 py-1.5 bg-agri-100 border-t border-agri-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={imagePreview} alt="Preview" className="w-8 h-8 object-cover rounded-md border" />
                <span className="text-[11px] text-agri-900 font-semibold">{t('aiChat.imageAttached')}</span>
              </div>
              <button
                onClick={removeImage}
                className="text-red-500 hover:text-red-700 p-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* INPUT FORM */}
          <div className="p-3 bg-white border-t border-agri-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl border transition ${
                  imagePreview ? 'bg-agri-600 text-white border-agri-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-300'
                }`}
                title={t('aiChat.uploadImage')}
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('aiChat.askPlaceholder')}
                className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                className="p-2 bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white rounded-xl transition shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
