import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Send, User, CheckCircle2, Clock } from 'lucide-react';

export default function WorkforceQuestionModal({ isOpen, onClose, jobId, workerId, workerName, jobTitle }) {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && jobId && workerId) {
      fetchMessages();
    }
  }, [isOpen, jobId, workerId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getJobWorkerMessages(token, jobId, workerId);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching Q&A messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSending(true);
    try {
      const data = await api.sendMessage(token, {
        jobId,
        workerId,
        text: inputText.trim()
      });

      if (data.success) {
        setInputText('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`💬 ${t('workforce.chatTitle')} — ${workerName || 'Worker'}`}
    >
      <div className="space-y-4 text-xs animate-fade-in">
        
        {/* JOB INFO BAR */}
        {jobTitle && (
          <div className="bg-agri-50 border border-agri-200 p-3 rounded-2xl flex items-center justify-between text-agri-950">
            <span className="font-extrabold text-xs">Job: {jobTitle}</span>
            <span className="text-[10px] bg-agri-600 text-white font-black px-2 py-0.5 rounded uppercase">Q&A Active</span>
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
              <p className="font-bold text-gray-600">No messages exchanged yet.</p>
              <p className="text-[11px] text-gray-400">Ask the worker about availability, skills, or daily wage expectations.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId?._id === user._id || m.senderId === user._id;
              const senderName = m.senderId?.name || (m.senderRole === 'farmer' ? 'Farmer' : 'Worker');

              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] space-y-1 shadow-xs ${
                      isMine
                        ? 'bg-agri-900 text-white rounded-br-none'
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
            placeholder={t('workforce.typeQuestionPlaceholder')}
            className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Button type="submit" loading={sending} variant="primary" className="shrink-0 font-bold text-xs px-4">
            <Send className="w-4 h-4 mr-1" />
            <span>{t('workforce.sendQuestionBtn')}</span>
          </Button>
        </form>

      </div>
    </Modal>
  );
}
