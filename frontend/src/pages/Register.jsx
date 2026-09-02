import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Users, Store, ShoppingBag, ShieldCheck, Smartphone, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import LocationButton from '../components/LocationButton';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';

export default function Register() {
  const { t } = useLanguage();
  const { registerRequest, verifyRegisterOtp, resendRegisterOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state: 'form' | 'otp'
  const [step, setStep] = useState('form');

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

  const [capturedCoords, setCapturedCoords] = useState(null);

  // OTP Challenge State
  const [challengeId, setChallengeId] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');

  // 60-second resend countdown timer
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let timerInterval;
    if (step === 'otp' && resendTimer > 0) {
      setCanResend(false);
      timerInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timerInterval);
  }, [step, resendTimer]);

  /**
   * Step 1: Submit Form Data & Request SMS OTP
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!name) {
      setError(t('auth.valNameReq'));
      return;
    }
    if (!phone) {
      setError(t('auth.valPhoneReq'));
      return;
    }
    if (!email) {
      setError(t('auth.valEmailReq'));
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role,
      address,
      latitude: capturedCoords ? capturedCoords.latitude : 12.9716,
      longitude: capturedCoords ? capturedCoords.longitude : 77.5946,
      cropsGrown: cropsGrown.split(',').map(s => s.trim()),
      farmSizeAcres: Number(farmSizeAcres),
      skills: skills.split(',').map(s => s.trim()),
      expectedWagePerDay: Number(expectedWagePerDay),
      storeName: storeName || `${name}'s Agro Store`,
      businessName: businessName || `${name} Traders`
    };

    try {
      const res = await registerRequest(payload);
      if (res.success && res.requiresOtp) {
        setStep('otp');
        setChallengeId(res.challengeId);
        setMaskedPhone(res.maskedPhone || phone);
        setMaskedEmail(res.maskedEmail || email);
        setOtp('');
        setResendTimer(60);
        setInfoMsg(res.message || 'Verification OTP sent to your email address.');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error during registration request.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify SMS OTP & Create Account
   */
  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code received on your mobile phone.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyRegisterOtp(challengeId, otp.trim());
      if (res.success && res.user) {
        navigateToRole(res.user.role);
      } else {
        setError(res.error || 'Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError('');
    setInfoMsg('');
    setResending(true);

    try {
      const res = await resendRegisterOtp(challengeId);
      if (res.success) {
        setOtp('');
        setResendTimer(60);
        setCanResend(false);
        setInfoMsg(res.message || 'A new 6-digit verification OTP has been sent to your email address.');
      } else {
        setError(res.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Error resending registration OTP.');
    } finally {
      setResending(false);
    }
  };

  const navigateToRole = (userRole) => {
    switch (userRole) {
      case 'farmer': navigate('/farmer-dashboard'); break;
      case 'worker': navigate('/worker-dashboard'); break;
      case 'store': navigate('/store-dashboard'); break;
      case 'trader': navigate('/trader-dashboard'); break;
      default: navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-agri-200 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12">
        
        {/* LEFT SPLIT */}
        <div className="md:col-span-5 bg-agri-900 text-white p-8 relative flex flex-col justify-between overflow-hidden min-h-[300px] md:min-h-[620px]">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            alt="Farmers working together in field"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          
          <div className="relative z-10 space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-agri-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-black">{t('brand.name')}</span>
            </Link>
            <h2 className="text-2xl font-black leading-tight">
              {step === 'otp' ? '🔐 Mobile OTP Verification' : t('auth.registerTitle')}
            </h2>
            <p className="text-xs text-agri-200 leading-relaxed">
              {step === 'otp' ? 'A 6-digit verification code has been dispatched to your mobile phone for account security.' : t('auth.registerDesc')}
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-agri-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real Mobile SMS Verification</span>
            </div>
            <p className="text-agri-200 text-[11px]">
              Protects your agricultural account using real 6-digit SMS verification.
            </p>
          </div>
        </div>

        {/* RIGHT SPLIT: REGISTRATION FORM OR OTP STEP */}
        <div className="md:col-span-7 p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-agri-900">
                {step === 'otp' ? '🔐 Verify Mobile OTP' : t('nav.register')}
              </h2>
              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex items-center space-x-1 text-xs font-bold text-agri-700 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {step === 'otp' ? `We sent a 6-digit OTP code to ${maskedPhone}` : t('auth.registerDesc')}
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* INFO ALERT */}
          {infoMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM INPUTS */}
          {step === 'form' ? (
            <div className="space-y-4">
              
              {/* 4 ROLE SELECTION CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'farmer', label: t('roles.farmer'), icon: Sprout },
                  { id: 'worker', label: t('roles.worker'), icon: Users },
                  { id: 'store', label: t('roles.store'), icon: Store },
                  { id: 'trader', label: t('roles.trader'), icon: ShoppingBag },
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
                      <span className="text-[11px] text-center leading-tight font-extrabold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.nameLabel')}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Gowda"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.phoneLabel')}</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9845123456"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.emailLabel')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 font-semibold"
                    />
                  </div>
                </div>

                {/* LOCATION BUTTON COMPONENT */}
                <LocationButton onLocationCaptured={(loc) => setCapturedCoords(loc)} />

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.addressLabel')}</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Mandya Rural, Mandya District, Karnataka"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-agri-500 font-semibold"
                  />
                </div>

                {/* ROLE SPECIFIC INPUTS */}
                {role === 'farmer' && (
                  <div className="grid grid-cols-2 gap-3 border-t border-agri-100 pt-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.cropsGrown')}</label>
                      <input
                        type="text"
                        value={cropsGrown}
                        onChange={(e) => setCropsGrown(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.farmSize')}</label>
                      <input
                        type="number"
                        value={farmSizeAcres}
                        onChange={(e) => setFarmSizeAcres(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {role === 'worker' && (
                  <div className="grid grid-cols-2 gap-3 border-t border-agri-100 pt-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.farmSkills')}</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.expectedWage')}</label>
                      <input
                        type="number"
                        value={expectedWagePerDay}
                        onChange={(e) => setExpectedWagePerDay(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {role === 'store' && (
                  <div className="border-t border-agri-100 pt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.storeName')}</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                )}

                {role === 'trader' && (
                  <div className="border-t border-agri-100 pt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.businessName')}</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                )}

                <Button type="submit" loading={loading} fullWidth={true} variant="primary">
                  <span>Send Email OTP & Continue →</span>
                </Button>
              </form>
            </div>
          ) : (
            /* STEP 2: 6 INDIVIDUAL NUMERIC BOX MOBILE OTP INPUT */
            <form onSubmit={handleOtpVerifySubmit} className="space-y-5 animate-fade-in text-center">
              


              <div className="bg-agri-50 border border-agri-200 p-3.5 rounded-2xl space-y-0.5 text-center">
                <span className="text-xs text-agri-800 font-semibold">We sent a 6-digit verification code to:</span>
                <span className="block text-base font-black text-agri-950 font-mono tracking-wider">{maskedEmail || email}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {t('auth.enterEmailOtpPrompt')}
                </label>

                {/* 6 INDIVIDUAL NUMERIC INPUT BOXES WITH AUTO-ADVANCE & PASTE */}
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" loading={loading} disabled={otp.length !== 6} fullWidth={true} variant="primary">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>{t('auth.verifyEmailButton')}</span>
              </Button>

              <div className="pt-2 border-t border-agri-100 flex flex-col items-center space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-gray-600">
                  <span>Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="font-black text-agri-700 hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <span className="font-bold text-agri-800">
                      Resend OTP in <strong className="font-black text-agri-950">{resendTimer}s</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-gray-500 hover:text-agri-800 font-semibold hover:underline pt-1"
                >
                  Edit Registration Details
                </button>
              </div>

            </form>
          )}

          <p className="text-center text-xs text-gray-600">
            {t('auth.alreadyAccount')}{' '}
            <Link to="/login" className="font-bold text-agri-700 hover:underline">
              {t('auth.loginHere')}
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}
