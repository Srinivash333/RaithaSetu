const AgroProduct = require('../models/AgroProduct');
const StoreProfile = require('../models/StoreProfile');
const User = require('../models/User');

// Calculate Haversine distance in Km
const calculateDistanceKm = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

// Add product (Agro Store only)
exports.addProduct = async (req, res) => {
  try {
    const { productName, category, price, stockQuantity, unit, description, imageUrl } = req.body;

    const product = await AgroProduct.create({
      storeId: req.user._id,
      productName,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity) || 10,
      unit: unit || 'pack',
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
      inStock: Number(stockQuantity) > 0
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add product' });
  }
};

// Get products with category filter and store delivery eligibility checking
exports.getProducts = async (req, res) => {
  try {
    const { category, search, latitude, longitude } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.productName = new RegExp(search, 'i');

    const products = await AgroProduct.find(query)
      .populate({
        path: 'storeId',
        select: 'name phone email address location'
      })
      .sort({ createdAt: -1 })
      .lean();

    let userCoords = req.user && req.user.location ? req.user.location.coordinates : [77.5946, 12.9716];
    if (longitude && latitude) {
      userCoords = [parseFloat(longitude), parseFloat(latitude)];
    }

    // Enrich with StoreProfile delivery info and distance
    const enrichedProducts = await Promise.all(products.map(async prod => {
      if (!prod.storeId) return null;
      const storeProfile = await StoreProfile.findOne({ userId: prod.storeId._id }).lean();
      const distanceKm = calculateDistanceKm(userCoords, prod.storeId.location.coordinates);

      const deliveryRadius = storeProfile ? storeProfile.deliveryRadiusKm : 15;
      const isDeliveryAvailable = storeProfile ? storeProfile.isDeliveryAvailable : true;
      const isEligibleForDelivery = isDeliveryAvailable && (distanceKm <= deliveryRadius);

      return {
        ...prod,
        storeName: storeProfile ? storeProfile.storeName : prod.storeId.name,
        distanceKm,
        isDeliveryAvailable,
        deliveryRadiusKm: deliveryRadius,
        isEligibleForDelivery
      };
    }));

    res.status(200).json({
      success: true,
      count: enrichedProducts.filter(Boolean).length,
      products: enrichedProducts.filter(Boolean)
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch agro products' });
  }
};

// Get store owner's products
exports.getMyProducts = async (req, res) => {
  try {
    const products = await AgroProduct.find({ storeId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get My Products Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch store products' });
  }
};

// Update product (Strict Ownership Check)
exports.updateProduct = async (req, res) => {
  try {
    const product = await AgroProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Agro product not found' });
    }

    if (product.storeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only edit items belonging to your own store.' });
    }

    const updated = await AgroProduct.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        inStock: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) > 0 : product.inStock
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
};

// Delete product (Strict Ownership Check)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await AgroProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Agro product not found' });
    }

    if (product.storeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only delete items belonging to your own store.' });
    }

    await AgroProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product removed from store successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
};

// Get products by specific store ID
exports.getProductsByStore = async (req, res) => {
  try {
    const products = await AgroProduct.find({ storeId: req.params.storeId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Store Products Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products for this shop' });
  }
};

