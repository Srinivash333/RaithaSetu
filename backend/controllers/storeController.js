const StoreProfile = require('../models/StoreProfile');
const User = require('../models/User');
const AgroProduct = require('../models/AgroProduct');
const { getStoreImage } = require('../utils/storeImageHelper');

// Get all Agro Stores (for Farmers to browse)
exports.getAllStores = async (req, res) => {
  try {
    const { search, category } = req.query;
    let userQuery = { role: 'store' };

    if (search) {
      userQuery.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') }
      ];
    }

    const storeUsers = await User.find(userQuery).select('-password').lean();

    const stores = await Promise.all(
      storeUsers.map(async (u) => {
        let profile = await StoreProfile.findOne({ userId: u._id }).lean();
        const contactNo = (profile && profile.contactNumber) ? profile.contactNumber : (u.phone || u.mobileNumber || '');
        const image = getStoreImage(u._id, profile?.shopImage);

        const productCount = await AgroProduct.countDocuments({ storeId: u._id });

        return {
          _id: u._id,
          userId: u._id,
          user: u,
          storeName: profile?.storeName || `${u.name}'s Agro Kendra`,
          ownerName: profile?.ownerName || u.name,
          shopDescription: profile?.shopDescription || 'Quality agricultural inputs store.',
          storeAddress: profile?.storeAddress || u.address || 'APMC Market Yard, Karnataka',
          contactNumber: contactNo,
          openingHours: profile?.openingHours || '8:00 AM - 8:00 PM',
          shopStatus: profile?.shopStatus || 'open',
          shopImage: image,
          ratingAverage: profile?.ratingAverage || 4.7,
          ratingCount: profile?.ratingCount || 18,
          deliveryRadiusKm: profile?.deliveryRadiusKm || 25,
          isDeliveryAvailable: profile?.isDeliveryAvailable ?? true,
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Get All Stores Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch agro stores' });
  }
};

// Get single specific Agro Store by ID
exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const storeUser = await User.findById(id).select('-password').lean();

    if (!storeUser || storeUser.role !== 'store') {
      return res.status(404).json({ success: false, error: 'Agro store not found' });
    }

    let profile = await StoreProfile.findOne({ userId: storeUser._id }).lean();
    const contactNo = (profile && profile.contactNumber) ? profile.contactNumber : (storeUser.phone || storeUser.mobileNumber || '');
    const image = getStoreImage(storeUser._id, profile?.shopImage);

    const products = await AgroProduct.find({ storeId: storeUser._id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      store: {
        _id: storeUser._id,
        userId: storeUser._id,
        user: storeUser,
        storeName: profile?.storeName || `${storeUser.name}'s Agro Kendra`,
        ownerName: profile?.ownerName || storeUser.name,
        shopDescription: profile?.shopDescription || 'Quality agricultural inputs store.',
        storeAddress: profile?.storeAddress || storeUser.address || 'APMC Market Yard, Karnataka',
        contactNumber: contactNo,
        openingHours: profile?.openingHours || '8:00 AM - 8:00 PM',
        shopStatus: profile?.shopStatus || 'open',
        shopImage: image,
        ratingAverage: profile?.ratingAverage || 4.7,
        ratingCount: profile?.ratingCount || 18,
        deliveryRadiusKm: profile?.deliveryRadiusKm || 25,
        isDeliveryAvailable: profile?.isDeliveryAvailable ?? true
      },
      products
    });
  } catch (error) {
    console.error('Get Store By ID Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch store details' });
  }
};

// Update Agro Store Profile (Store Owner Only - Enforced in Backend)
exports.updateStoreProfile = async (req, res) => {
  try {
    const {
      storeName, ownerName, shopDescription, storeAddress,
      contactNumber, openingHours, shopStatus, shopImage,
      isDeliveryAvailable, deliveryRadiusKm
    } = req.body;

    const profileData = {
      userId: req.user._id,
      storeName,
      ownerName,
      shopDescription,
      storeAddress,
      contactNumber,
      openingHours,
      shopStatus,
      shopImage,
      isDeliveryAvailable,
      deliveryRadiusKm
    };

    const updatedProfile = await StoreProfile.findOneAndUpdate(
      { userId: req.user._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Store profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update Store Profile Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update store profile' });
  }
};
