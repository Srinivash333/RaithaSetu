import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../services/api';
import { ShieldCheck, Users, Briefcase, ShoppingBag } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  const fetchAdminMetrics = async () => {
    try {
      const data = await api.getAdminDashboard(token);
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentJobs(data.recentJobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-gray-500">Loading platform admin analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* ADMIN HEADER */}
        <div className="bg-agri-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-agri-700 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-agri-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{t('adminDash')}</h1>
              <p className="text-xs text-agri-300">System Administrator • Platform Health & Audit Analytics</p>
            </div>
          </div>

          <span className="bg-agri-800 text-agri-200 text-xs px-3 py-1 rounded-full border border-agri-700 font-bold">
            System Operational
          </span>
        </div>

        {/* METRICS GRID */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-500 font-semibold block">Total Registered Users</span>
              <span className="text-2xl font-extrabold text-agri-900">{stats.totalUsers}</span>
              <p className="text-[10px] text-agri-700 font-bold">Farmers: {stats.roleCounts.farmer} • Workers: {stats.roleCounts.worker}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-500 font-semibold block">Active Jobs</span>
              <span className="text-2xl font-extrabold text-agri-900">{stats.jobs.active}</span>
              <p className="text-[10px] text-gray-600">Total Posted: {stats.jobs.total}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-500 font-semibold block">Marketplace Orders</span>
              <span className="text-2xl font-extrabold text-agri-900">{stats.marketplace.totalOrders}</span>
              <p className="text-[10px] text-gray-600">Crops Listed: {stats.marketplace.totalCropsListed}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-500 font-semibold block">Agro Products</span>
              <span className="text-2xl font-extrabold text-agri-900">{stats.marketplace.totalProducts}</span>
              <p className="text-[10px] text-gray-600">Agro Stores: {stats.roleCounts.store}</p>
            </div>
          </div>
        )}

        {/* RECENT ACTIVITY TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-agri-600" />
              <span>Recently Registered Users</span>
            </h3>

            <div className="divide-y divide-agri-100 text-xs">
              {recentUsers.map((u) => (
                <div key={u._id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 block">{u.name}</span>
                    <span className="text-gray-500 text-[11px]">{u.email}</span>
                  </div>
                  <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-agri-100 text-agri-800">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-agri-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4 text-agri-600" />
              <span>Recent Job Posts</span>
            </h3>

            <div className="divide-y divide-agri-100 text-xs">
              {recentJobs.map((j) => (
                <div key={j._id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 block">{j.title}</span>
                    <span className="text-gray-500 text-[11px]">{j.crop} • ₹{j.wage}/day</span>
                  </div>
                  <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
