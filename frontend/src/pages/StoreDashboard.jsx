import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { api } from '../services/api';
import { getStoreImage, handleStoreImageError } from '../utils/storeImages';
import { 
  Store, PlusCircle, Package, Truck, Star, MapPin, 
  AlertTriangle, CheckCircle, Tag, ShoppingBag, Search, 
  RefreshCw, Layers, ShieldCheck, Trash2, Phone, Edit3, Camera, Check, X
} from 'lucide-react';

export default function StoreDashboard() {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [storeProfile, setStoreProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Category & Search Filters for Inventory Items
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Store Profile & Delivery Settings State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('8:00 AM - 8:00 PM');
  const [shopDescription, setShopDescription] = useState('');
  const [shopImage, setShopImage] = useState('');
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(25);
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Product Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('seeds');
  const [price, setPrice] = useState(450);
  const [stockQuantity, setStockQuantity] = useState(30);
  const [unit, setUnit] = useState('pack');
  const [description, setDescription] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Store Profile
      const storeRes = await api.getStoreById(user._id);
      if (storeRes.success && storeRes.store) {
        const s = storeRes.store;
        setStoreProfile(s);
        setStoreName(s.storeName || '');
        setOwnerName(s.ownerName || user.name || '');
        setContactNumber(s.contactNumber || user.phone || user.mobileNumber || '');
        setStoreAddress(s.storeAddress || user.address || '');
        setOpeningHours(s.openingHours || '8:00 AM - 8:00 PM');
        setShopDescription(s.shopDescription || '');
        setShopImage(s.shopImage || '');
        setIsDeliveryAvailable(s.isDeliveryAvailable ?? true);
        setDeliveryRadiusKm(s.deliveryRadiusKm || 25);
      }

      // 2. Fetch Store Products
      const prodRes = await api.getProductsByStore(user._id);
      if (prodRes.success) {
        setProducts(prodRes.products || []);
      }

      // 3. Fetch Store Customer Orders
      const orderRes = await api.getMyOrders(token);
      if (orderRes.success) {
        // Filter orders belonging to this store as seller
        const storeOrders = (orderRes.orders || []).filter(
          o => o.sellerId?._id === user._id || o.sellerId === user._id
        );
        setOrders(storeOrders);
      }
    } catch (err) {
      console.error('Failed to load store dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Store Profile & Photo
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.updateStoreProfile(token, {
        storeName: storeName.trim() || `${user.name}'s Agro Kendra`,
        ownerName: ownerName.trim() || user.name,
        contactNumber: contactNumber.trim() || user.phone,
        storeAddress: storeAddress.trim() || user.address,
        openingHours: openingHours.trim(),
        shopDescription: shopDescription.trim(),
        shopImage: shopImage.trim(),
        isDeliveryAvailable,
        deliveryRadiusKm: Number(deliveryRadiusKm) || 25
      });

      if (data.success) {
        setShowProfileModal(false);
        fetchStoreData();
      }
    } catch (err) {
      console.error('Error updating store profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setSubmittingProduct(true);
    try {
      const data = await api.addProduct(token, {
        productName: productName.trim(),
        category,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        unit: unit.trim() || 'pack',
        description: description.trim()
      });

      if (data.success) {
        setShowAddModal(false);
        setProductName('');
        setDescription('');
        fetchStoreData();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Update Order Status (Accept / Reject / Pipeline)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(token, orderId, newStatus);
      if (res.success) {
        fetchStoreData();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || p.productName.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate Metrics
  const totalProductsCount = products.length;
  const inStockCount = products.filter((p) => p.stockQuantity > 0).length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const displayStoreName = storeProfile?.storeName || `${user?.name || 'Agro'} Kendra & Supplies`;
  const displayAddress = storeProfile?.storeAddress || user?.address || 'APMC Market Yard, Karnataka';
  const displayPhone = storeProfile?.contactNumber || user?.phone || user?.mobileNumber || '';
  const displayImage = getStoreImage(user._id, storeProfile?.shopImage);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* STORE IDENTITY & PROFILE HEADER BANNER */}
        <div className="bg-gradient-to-br from-agri-900 via-agri-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start space-x-4">
              
              {/* STORE PHOTO CONTAINER */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-md shrink-0 bg-gray-800">
                <img
                  src={displayImage}
                  alt={displayStoreName}
                  onError={(e) => handleStoreImageError(e, user._id)}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 transition flex items-center justify-center text-white"
                  title="Upload / Change Store Photo"
                >
                  <Camera className="w-5 h-5 text-emerald-300" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {t('store.verifiedStore')}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-300" /> ⭐ 4.7 / 5 (18 Reviews)
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{displayStoreName}</h1>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-agri-200">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                    {displayAddress}
                  </span>
                  {displayPhone && (
                    <span className="flex items-center font-bold text-white">
                      <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                      📞 {displayPhone}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                    {isDeliveryAvailable ? t('store.deliveryEnabledWithin', { radius: deliveryRadiusKm }) : t('store.inStorePickupOnly')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowProfileModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                <span>{t('store.uploadStorePhoto')}</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>{t('store.addProduct')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">{t('store.totalItems')}</span>
              <Package className="w-4 h-4 text-agri-600" />
            </div>
            <p className="text-2xl font-black text-agri-950">{totalProductsCount}</p>
            <p className="text-[11px] text-gray-500 font-semibold">{t('store.activeItems', { count: inStockCount })}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">{t('store.stockAlerts')}</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{lowStockCount}</p>
            <p className="text-[11px] text-gray-500 font-semibold">{t('store.lowStockAlerts')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">{t('store.customerOrders')}</span>
              <ShoppingBag className="w-4 h-4 text-agri-600" />
            </div>
            <p className="text-2xl font-black text-agri-950">{orders.length}</p>
            <p className="text-[11px] text-gray-500 font-semibold">{t('store.customerOrdersSub')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold">{t('store.totalSalesValue')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Total Revenue</p>
          </div>
        </div>

        {/* MAIN SECTION: INVENTORY & CUSTOMER ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* INVENTORY & ITEMS MANAGEMENT (2 COLS) */}
          <div className="lg:col-span-2 space-y-5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-agri-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-agri-600" />
                  <span>{t('store.inventory')} ({filteredProducts.length})</span>
                </h2>
                <p className="text-xs text-gray-500">{t('store.inventory')}</p>
              </div>

              {/* SEARCH BOX */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={t('store.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-agri-500"
                />
              </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: t('categories.all') },
                { id: 'seeds', label: t('categories.seeds') },
                { id: 'fertilizers', label: t('categories.fertilizers') },
                { id: 'pesticides', label: t('categories.pesticides') },
                { id: 'tools', label: t('categories.tools') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                    activeCategory === tab.id
                      ? 'bg-agri-600 text-white border-agri-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ITEM CARDS GRID */}
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-agri-200">
                {t('common.loading')}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-agri-200 text-xs space-y-2">
                <Package className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-700">{t('common.na')}</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="text-agri-700 font-extrabold hover:underline block mx-auto text-xs"
                >
                  + {t('store.addProduct')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((p) => {
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 10;
                  const isOutOfStock = p.stockQuantity <= 0;

                  return (
                    <div key={p._id} className="bg-white p-4 rounded-2xl border border-agri-200 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        
                        <div className="flex justify-between items-start">
                          <span className="bg-agri-100 text-agri-900 text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-agri-200">
                            {t(`categories.${p.category}`, p.category)}
                          </span>
                          
                          {/* Stock Status Badge */}
                          {isOutOfStock ? (
                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-200">
                              {t('status.outOfStock')}
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {t('status.lowStock')} ({p.stockQuantity})
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                              {t('status.inStock')} ({p.stockQuantity})
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm text-gray-900">{p.productName}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="pt-3 border-t border-agri-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">{t('store.unitPrice')}</span>
                          <span className="font-black text-agri-950 text-sm">₹{p.price} <span className="text-xs font-normal text-gray-500">/ {p.unit}</span></span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {t('store.stock')}: {p.stockQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CUSTOMER ORDERS PANEL (REQUIREMENTS 19, 20, 21, 22) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-agri-900 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>{t('store.customerOrders')} ({orders.length})</span>
              </h2>
              <p className="text-xs text-gray-500">{t('store.customerOrdersSub')}</p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-8 bg-white text-center rounded-2xl border border-agri-200 text-xs text-gray-400 space-y-1">
                  <ShoppingBag className="w-6 h-6 text-gray-300 mx-auto" />
                  <p>{t('common.na')}</p>
                </div>
              ) : (
                orders.map((o) => {
                  const isDelivery = o.deliveryOption === 'store_delivery';
                  const status = o.orderStatus || 'pending';
                  const farmerName = o.buyerId?.name || 'Farmer';
                  const farmerPhone = o.buyerId?.phone || o.buyerId?.mobileNumber || '';

                  return (
                    <div key={o._id} className="p-4 bg-white rounded-2xl border border-agri-200 shadow-sm text-xs space-y-3">
                      
                      {/* ORDER HEADER */}
                      <div className="flex justify-between items-center border-b border-agri-100 pb-2">
                        <div>
                          <span className="font-black text-agri-950 text-xs">
                            Order #{o._id.toString().slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <span className="bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-lg text-xs">
                          ₹{o.totalAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* FARMER DETAILS */}
                      <div className="space-y-1 text-gray-700 bg-agri-50/70 p-2.5 rounded-xl border border-agri-100">
                        <p className="text-[11px] font-bold text-agri-950">
                          👤 Farmer: <span className="font-black">{farmerName}</span>
                        </p>
                        {farmerPhone && (
                          <p className="text-[11px] font-bold text-emerald-800">
                            📞 Phone:{' '}
                            <a href={`tel:${farmerPhone}`} className="hover:underline font-black">
                              {farmerPhone}
                            </a>
                          </p>
                        )}
                        <p className="text-[11px] font-bold text-gray-800">
                          {isDelivery ? '🚚 Delivery' : '🛍️ Self-Collection'}
                        </p>
                        {isDelivery && o.shippingAddress && (
                          <p className="text-[10px] text-gray-600">
                            <strong>Address:</strong> {o.shippingAddress}
                          </p>
                        )}
                      </div>

                      {/* ITEMS LIST */}
                      <div className="space-y-1 border-t border-gray-100 pt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Items Ordered:</span>
                        {o.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] font-semibold text-gray-800">
                            <span>• {item.name} × {item.quantity}</span>
                            <span className="font-bold text-gray-900">₹{item.totalPrice}</span>
                          </div>
                        ))}
                      </div>

                      {/* STATUS & ACTIONS PIPELINE */}
                      <div className="pt-2 border-t border-agri-100 space-y-2">
                        
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-gray-500">Status:</span>
                          <span className={`font-black px-2.5 py-0.5 rounded-full uppercase text-[10px] ${
                            status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            status === 'confirmed' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            status === 'preparing' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                            status === 'ready_for_delivery' || status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                            status === 'ready_for_collection' ? 'bg-teal-100 text-teal-900 border border-teal-200' :
                            status === 'delivered' || status === 'collected' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {t(`status.${status}`, status.replace(/_/g, ' '))}
                          </span>
                        </div>

                        {/* STORE ACCEPT / REJECT BUTTONS (PENDING STATUS) */}
                        {status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o._id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('store.acceptOrder')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o._id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{t('store.rejectOrder')}</span>
                            </button>
                          </div>
                        )}

                        {/* DELIVERY PIPELINE BUTTONS */}
                        {isDelivery && status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'preparing')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markPreparing')}
                          </button>
                        )}
                        {isDelivery && status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'out_for_delivery')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markOutForDelivery')}
                          </button>
                        )}
                        {isDelivery && status === 'out_for_delivery' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'delivered')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markDelivered')}
                          </button>
                        )}

                        {/* SELF-COLLECTION PIPELINE BUTTONS */}
                        {!isDelivery && status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'preparing')}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markPreparing')}
                          </button>
                        )}
                        {!isDelivery && status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'ready_for_collection')}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markReadyForCollection')}
                          </button>
                        )}
                        {!isDelivery && status === 'ready_for_collection' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(o._id, 'collected')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-xl transition"
                          >
                            {t('store.markCollected')}
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* STORE PROFILE & PHOTO EDIT MODAL (REQUIREMENT 5) */}
        {showProfileModal && (
          <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title={t('store.uploadStorePhoto')}>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-bold text-xs"
                />
              </div>

              {/* STORE PHOTO URL INPUT / UPLOAD */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('store.photoUrlLabel')}</label>
                <input
                  type="url"
                  value={shopImage}
                  onChange={(e) => setShopImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">Paste a image URL of your shop. If empty, a stable realistic fallback photo is automatically assigned.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 9880099987"
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Store Address</label>
                <input
                  type="text"
                  required
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="8:00 AM - 8:00 PM"
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="deliveryAvail"
                  checked={isDeliveryAvailable}
                  onChange={(e) => setIsDeliveryAvailable(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="deliveryAvail" className="font-bold text-gray-800 text-xs cursor-pointer">
                  {t('store.deliveryAvailable')}
                </label>
              </div>

              <Button type="submit" loading={savingProfile} fullWidth variant="primary">
                <span>Save Store Profile</span>
              </Button>
            </form>
          </Modal>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('store.addProduct')}>
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('common.name')}</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Hybrid Paddy Seeds"
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('common.category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  >
                    <option value="seeds">{t('categories.seeds')}</option>
                    <option value="fertilizers">{t('categories.fertilizers')}</option>
                    <option value="pesticides">{t('categories.pesticides')}</option>
                    <option value="tools">{t('categories.tools')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('common.price')} (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('store.stock')}</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('common.unit')}</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. 10 kg bag"
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t('common.description')}</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specs..."
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-xs"
                ></textarea>
              </div>

              <Button type="submit" loading={submittingProduct} fullWidth variant="primary">
                <span>{t('common.save')}</span>
              </Button>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
}
