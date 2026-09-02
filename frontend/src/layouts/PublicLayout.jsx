import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] font-sans text-gray-900 selection:bg-agri-200">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <AIChatbot />
      <Footer />
    </div>
  );
}
