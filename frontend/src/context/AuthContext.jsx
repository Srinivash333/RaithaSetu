import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('raitha_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 1: Login Request (Verifies Email + Password, dispatches SMS OTP, returns challengeId)
   */
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('raitha_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  /**
   * Step 2: Login OTP Verification (Verifies hashed OTP with challengeId and issues JWT token)
   */
  const verifyLoginOtp = async (challengeId, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('raitha_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const resendLoginOtp = async (challengeId) => {
    const res = await fetch(`${API_BASE}/auth/resend-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId })
    });
    return res.json();
  };

  /**
   * Registration Step 1: Submit Details & Request SMS OTP
   */
  const registerRequest = async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  };

  /**
   * Registration Step 2: Verify Registration SMS OTP & Create Account
   */
  const verifyRegisterOtp = async (challengeId, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('raitha_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const resendRegisterOtp = async (challengeId) => {
    const res = await fetch(`${API_BASE}/auth/resend-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId })
    });
    return res.json();
  };

  const logout = () => {
    localStorage.removeItem('raitha_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verifyLoginOtp,
        verifyOtp: verifyLoginOtp,
        resendLoginOtp,
        resendOtp: resendLoginOtp,
        register: registerRequest,
        registerRequest,
        verifyRegisterOtp,
        resendRegisterOtp,
        logout,
        fetchMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
