import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { UserPlus, MapPin, Loader2, CheckCircle2, Sprout, Users, Store, ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const { coords, locationName, isDetecting, requestLocation } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(() => searchParams.get('role') || 'farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Mandya, Karnataka');

  // Role Specific States
  const [cropsGrown, setCropsGrown] = useState('Paddy, Tomato');
  const [farmSizeAcres, setFarmSizeAcres] = useState(3);
  const [skills, setSkills] = useState('Harvesting, Pesticide Spraying');
  const [expectedWagePerDay, setExpectedWagePerDay] = useState(650);
  const [storeName, setStoreName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [locationCaptured, setLocationCaptured] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchLocation = async () => {
    try {
      await requestLocation();
      setLocationCaptured(true);
    } catch (err) {
      setError('Location access failed. Using default region.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role,
      address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      // Role specifics
      cropsGrown: cropsGrown.split(',').map(s => s.trim()),
      farmSizeAcres: Number(farmSizeAcres),
      skills: skills.split(',').map(s => s.trim()),
      expectedWagePerDay: Number(expectedWagePerDay),
      storeName: storeName || `${name}'s Agro Store`,
      businessName: businessName || `${name} Traders`
    };

    try {
      const res = await register(payload);
      if (res.success) {
        switch (role) {
          case 'farmer': navigate('/farmer-dashboard'); break;
          case 'worker': navigate('/worker-dashboard'); break;
          case 'store': navigate('/store-dashboard'); break;
          case 'trader': navigate('/trader-dashboard'); break;
          default: navigate('/');
        }
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl border border-agri-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-agri-600 text-white flex items-center justify-center mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-agri-900">{t('navRegister')}</h2>
          <p className="text-xs text-gray-500">{t('chooseRole')}</p>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'farmer', label: t('roleFarmer'), icon: Sprout },
            { id: 'worker', label: t('roleWorker'), icon: Users },
            { id: 'store', label: t('roleStore'), icon: Store },
            { id: 'trader', label: t('roleTrader'), icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = role === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRole(tab.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition ${
                  isSelected
                    ? 'border-agri-600 bg-agri-50 text-agri-900 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-agri-600' : 'text-gray-400'}`} />
                <span className="text-[11px] text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Gowda"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9845123456"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
              />
            </div>
          </div>

          {/* GEOLOCATION CAPTURE CONTROL */}
          <div className="bg-agri-50 border border-agri-200 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-agri-900 flex items-center">
                <MapPin className="w-4 h-4 text-agri-600 mr-1" />
                {t('useLocation')} (Browser Geolocation API)
              </span>
              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={isDetecting}
                className="bg-agri-600 hover:bg-agri-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('detectingLocation')}</span>
                  </>
                ) : (
                  <span>Detect Location</span>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-gray-600">
              Captured: {coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E ({locationName})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Address / Town</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Mandya Rural, Mandya District, Karnataka"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 focus:outline-none"
            />
          </div>

          {/* ROLE SPECIFIC FIELDS */}
          {role === 'farmer' && (
            <div className="grid grid-cols-2 gap-4 border-t border-agri-100 pt-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Crops Grown</label>
                <input
                  type="text"
                  value={cropsGrown}
                  onChange={(e) => setCropsGrown(e.target.value)}
                  placeholder="Paddy, Sugarcane, Tomato"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Farm Size (Acres)</label>
                <input
                  type="number"
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {role === 'worker' && (
            <div className="grid grid-cols-2 gap-4 border-t border-agri-100 pt-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Farm Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Harvesting, Sowing, Tilling"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Expected Wage (₹/day)</label>
                <input
                  type="number"
                  value={expectedWagePerDay}
                  onChange={(e) => setExpectedWagePerDay(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {role === 'store' && (
            <div className="border-t border-agri-100 pt-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Agro Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Kaveri Agro Kendra"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
              />
            </div>
          )}

          {role === 'trader' && (
            <div className="border-t border-agri-100 pt-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Annapurna Grain Traders"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
          >
            {loading ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-agri-700 hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
