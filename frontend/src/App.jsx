import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

import PublicLayout from './layouts/PublicLayout';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

import Jobs from './pages/Jobs';
import Marketplace from './pages/Marketplace';
import Products from './pages/Products';

import FarmerDashboard from './pages/FarmerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import StoreDashboard from './pages/StoreDashboard';
import TraderDashboard from './pages/TraderDashboard';
import AdminDashboard from './pages/AdminDashboard';

import AgroStoresPage from './pages/AgroStoresPage';
import SingleStorePage from './pages/SingleStorePage';
import TradersPage from './pages/TradersPage';
import SingleTraderPage from './pages/SingleTraderPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <Routes>
              {/* Public Discovery Pages wrapped in PublicLayout */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

              <Route path="/jobs" element={<PublicLayout><Jobs /></PublicLayout>} />
              <Route path="/crops" element={<PublicLayout><Marketplace /></PublicLayout>} />
              <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />

              {/* Specific Agro Stores & Traders Browsing Pages */}
              <Route path="/stores" element={<PublicLayout><AgroStoresPage /></PublicLayout>} />
              <Route path="/stores/:id" element={<PublicLayout><SingleStorePage /></PublicLayout>} />
              <Route path="/traders" element={<PublicLayout><TradersPage /></PublicLayout>} />
              <Route path="/traders/:id" element={<PublicLayout><SingleTraderPage /></PublicLayout>} />

              {/* Dedicated User Dashboards (have their own DashboardLayout) */}
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
              <Route path="/store-dashboard" element={<StoreDashboard />} />
              <Route path="/trader-dashboard" element={<TraderDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
