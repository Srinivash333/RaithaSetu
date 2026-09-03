/**
 * Centralized API Service for RaithaSetu AI
 * Handles fetch requests to backend endpoints with optional JWT auth tokens
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (token, extraHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth API
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    }).then(res => res.json()),

  verifyLoginOtp: (challengeId, otp) =>
    fetch(`${API_BASE}/auth/verify-login-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId, otp })
    }).then(res => res.json()),

  verifyOtp: (challengeId, otp) =>
    fetch(`${API_BASE}/auth/verify-login-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId, otp })
    }).then(res => res.json()),

  resendLoginOtp: (challengeId) =>
    fetch(`${API_BASE}/auth/resend-login-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId })
    }).then(res => res.json()),

  resendOtp: (challengeId) =>
    fetch(`${API_BASE}/auth/resend-login-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId })
    }).then(res => res.json()),

  register: (formData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    }).then(res => res.json()),

  registerRequest: (formData) =>
    fetch(`${API_BASE}/auth/register-request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    }).then(res => res.json()),

  verifyRegisterOtp: (challengeId, otp) =>
    fetch(`${API_BASE}/auth/verify-register-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId, otp })
    }).then(res => res.json()),

  resendRegisterOtp: (challengeId) =>
    fetch(`${API_BASE}/auth/resend-register-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeId })
    }).then(res => res.json()),

  getMe: (token) =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  updateProfile: (token, profileData) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData)
    }).then(res => res.json()),

  // Job & Workforce API
  getJobs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/jobs?${query}`).then(res => res.json());
  },

  getMyPostedJobs: (token) =>
    fetch(`${API_BASE}/jobs/my-posted`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  createJob: (token, jobData) =>
    fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(jobData)
    }).then(res => res.json()),

  // AI Recommendation & Wage Estimation API
  getWorkerRecommendations: (token, jobId) =>
    fetch(`${API_BASE}/recommendations/workers/${jobId}`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  estimateWage: (params) =>
    fetch(`${API_BASE}/recommendations/wages/estimate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    }).then(res => res.json()),

  // Applications API
  applyForJob: (token, jobId, note) =>
    fetch(`${API_BASE}/applications/apply`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ jobId, note })
    }).then(res => res.json()),

  getMyApplications: (token) =>
    fetch(`${API_BASE}/applications/my-applications`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  sendJobOffer: (token, offerData) =>
    fetch(`${API_BASE}/applications/offer`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(offerData)
    }).then(res => res.json()),

  respondJobOffer: (token, id, status) =>
    fetch(`${API_BASE}/applications/${id}/respond`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ status })
    }).then(res => res.json()),

  // Workforce Messaging API
  sendMessage: (token, messageData) =>
    fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(messageData)
    }).then(res => res.json()),

  getJobWorkerMessages: (token, jobId, workerId) =>
    fetch(`${API_BASE}/messages/job/${jobId}/worker/${workerId}`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  getMyMessages: (token) =>
    fetch(`${API_BASE}/messages/my-messages`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Farmer-Trader Crop Q&A Messaging API
  sendCropMessage: (token, messageData) =>
    fetch(`${API_BASE}/crop-messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(messageData)
    }).then(res => res.json()),

  getCropMessages: (token, cropId, traderId) =>
    fetch(`${API_BASE}/crop-messages/crop/${cropId}/trader/${traderId}`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Marketplace Crop API
  getCropListings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/crops?${query}`).then(res => res.json());
  },

  createCropListing: (token, cropData) =>
    fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(cropData)
    }).then(res => res.json()),

  // Agro Product Store API
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/products?${query}`).then(res => res.json());
  },

  getProductsByStore: (storeId) =>
    fetch(`${API_BASE}/products/store/${storeId}`).then(res => res.json()),

  addProduct: (token, productData) =>
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(productData)
    }).then(res => res.json()),

  updateProduct: (token, id, productData) =>
    fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(productData)
    }).then(res => res.json()),

  deleteProduct: (token, id) =>
    fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Specific Agro Stores API
  getAllStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/stores?${query}`).then(res => res.json());
  },

  getStoreById: (storeId) =>
    fetch(`${API_BASE}/stores/${storeId}`).then(res => res.json()),

  updateStoreProfile: (token, profileData) =>
    fetch(`${API_BASE}/stores/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData)
    }).then(res => res.json()),

  // Specific Traders API
  getAllTraders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/traders?${query}`).then(res => res.json());
  },

  getTraderById: (traderId) =>
    fetch(`${API_BASE}/traders/${traderId}`).then(res => res.json()),

  updateTraderProfile: (token, profileData) =>
    fetch(`${API_BASE}/traders/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData)
    }).then(res => res.json()),

  // Trader Sourcing Requirements API
  createTraderRequirement: (token, reqData) =>
    fetch(`${API_BASE}/traders/requirements`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(reqData)
    }).then(res => res.json()),

  getTraderRequirements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/traders/requirements?${query}`).then(res => res.json());
  },

  deleteTraderRequirement: (token, reqId) =>
    fetch(`${API_BASE}/traders/requirements/${reqId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Structured Price Negotiation API
  createOffer: (token, offerData) =>
    fetch(`${API_BASE}/negotiations/offer`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(offerData)
    }).then(res => res.json()),

  createNegotiation: (token, offerData) =>
    fetch(`${API_BASE}/negotiations/offer`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(offerData)
    }).then(res => res.json()),

  counterOffer: (token, id, counterData) =>
    fetch(`${API_BASE}/negotiations/${id}/counter`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(counterData)
    }).then(res => res.json()),

  acceptOffer: (token, id) =>
    fetch(`${API_BASE}/negotiations/${id}/accept`, {
      method: 'POST',
      headers: getHeaders(token)
    }).then(res => res.json()),

  rejectOffer: (token, id) =>
    fetch(`${API_BASE}/negotiations/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(token)
    }).then(res => res.json()),

  getNegotiationsForCrop: (token, cropId) =>
    fetch(`${API_BASE}/negotiations/crop/${cropId}`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  getMyNegotiations: (token) =>
    fetch(`${API_BASE}/negotiations/my-negotiations`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  getAIGuidance: (token, id) =>
    fetch(`${API_BASE}/negotiations/${id}/ai-guidance`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Orders & Payment API
  createOrder: (token, orderData) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(orderData)
    }).then(res => res.json()),

  getMyOrders: (token) =>
    fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  updateOrderStatus: (token, id, orderStatus) =>
    fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ orderStatus })
    }).then(res => res.json()),

  // AI Chat Assistant API
  chatAI: (message, language = 'en', location = '', history = [], image = null) =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, language, location, history, image })
    }).then(res => res.json()),

  askAI: (message, language = 'en', location = '', history = [], image = null) =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, language, location, history, image })
    }).then(res => res.json()),

  // Admin Dashboard API
  getAdminDashboard: (token) =>
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders(token)
    }).then(res => res.json()),

  // Notifications API
  getNotifications: (token) =>
    fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(token)
    }).then(res => res.json())
};

