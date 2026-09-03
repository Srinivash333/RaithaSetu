const TraderProfile = require('../models/TraderProfile');
const User = require('../models/User');
const TraderRequirement = require('../models/TraderRequirement');

// Get all Traders (for Farmers to view wholesale crop buyers)
exports.getAllTraders = async (req, res) => {
  try {
    const { search } = req.query;
    let userQuery = { role: 'trader' };

    if (search) {
      userQuery.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') }
      ];
    }

    const traderUsers = await User.find(userQuery).select('-password').lean();

    const traders = await Promise.all(
      traderUsers.map(async (u) => {
        let profile = await TraderProfile.findOne({ userId: u._id }).lean();

        if (!profile) {
          profile = {
            businessName: `${u.name} Agricultural Trading Co.`,
            ownerName: u.name,
            businessDescription: 'Licensed APMC wholesale commodity trading firm specializing in direct farm crop procurement.',
            businessLocation: u.address || 'Mysuru Wholesale APMC Yard, Karnataka',
            contactNumber: u.phone || u.mobileNumber || '+91 9945001122',
            businessType: 'APMC Wholesale Grain & Produce Buyer',
            openingHours: '7:00 AM - 7:00 PM',
            businessStatus: 'open',
            businessImage: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
            interestedCrops: ['Paddy', 'Sugarcane', 'Tomato', 'Maize'],
            purchaseCapacity: 'High (50+ Quintals)'
          };
        }

        const registeredPhone = u.phone || u.mobileNumber || profile?.contactNumber || '';
        return {
          _id: u._id,
          userId: u._id,
          user: u,
          businessName: profile?.businessName || `${u.name} Traders`,
          ownerName: profile?.ownerName || u.name,
          businessDescription: profile?.businessDescription || 'Wholesale crop buyer.',
          businessLocation: profile?.businessLocation || u.address || 'Karnataka, India',
          contactNumber: registeredPhone,
          phone: registeredPhone,
          mobileNumber: registeredPhone,
          businessType: profile?.businessType || 'Wholesale Buyer',
          openingHours: profile?.openingHours || '7:00 AM - 7:00 PM',
          businessStatus: profile?.businessStatus || 'open',
          businessImage: profile?.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
          interestedCrops: profile?.interestedCrops || ['Paddy', 'Tomato'],
          purchaseCapacity: profile?.purchaseCapacity || 'High (50+ Quintals)'
        };
      })
    );

    const DEFAULT_SEED_TRADERS = [
      {
        _id: '65f012345678901234567801',
        userId: '65f012345678901234567801',
        businessName: 'Annapurna Agricultural Trading Co.',
        ownerName: 'Rahul Kumar',
        businessDescription: 'Licensed APMC wholesale tomato & vegetable procurement hub.',
        businessLocation: 'Mandya APMC Yard, Karnataka',
        contactNumber: '+91 9845012345',
        businessType: 'APMC Wholesale Produce Buyer',
        openingHours: '06:00 AM - 08:00 PM',
        businessStatus: 'open',
        businessImage: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
        interestedCrops: ['Tomato', 'Fresh Farm Tomatoes', 'Vegetables', 'Paddy'],
        purchaseCapacity: 'High (100+ Boxes/day)',
        ratingAverage: 4.7,
        ratingCount: 15
      },
      {
        _id: '65f012345678901234567802',
        userId: '65f012345678901234567802',
        businessName: 'Sahyadri APMC Produce Procurement',
        ownerName: 'Suresh Gowda',
        businessDescription: 'Direct grain & paddy procurement center for Mandya & Mysuru farmers.',
        businessLocation: 'Mysuru Wholesale APMC Yard, Karnataka',
        contactNumber: '+91 9945088112',
        businessType: 'APMC Grain & Paddy Exporter',
        openingHours: '07:00 AM - 07:00 PM',
        businessStatus: 'open',
        businessImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
        interestedCrops: ['Paddy', 'Organic Sonamasuri Paddy', 'Rice', 'Sugarcane', 'Cotton'],
        purchaseCapacity: 'High (500+ Quintals/month)',
        ratingAverage: 4.8,
        ratingCount: 28
      },
      {
        _id: '65f012345678901234567803',
        userId: '65f012345678901234567803',
        businessName: 'Kaveri Commodity Market Yard',
        ownerName: 'Venkatesh Murthy',
        businessDescription: 'Wholesale sugarcane and cereal crop purchasing yard at APMC Maddur.',
        businessLocation: 'Maddur APMC Market, Karnataka',
        contactNumber: '+91 9741122334',
        businessType: 'APMC Cash Crop Buyer',
        openingHours: '08:00 AM - 06:00 PM',
        businessStatus: 'open',
        businessImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        interestedCrops: ['Sugarcane', 'Tomato', 'Maize', 'Paddy'],
        purchaseCapacity: 'High (20+ Tons/day)',
        ratingAverage: 4.6,
        ratingCount: 19
      }
    ];

    let combinedTraders = [...traders];
    
    // Ensure diverse matching traders exist for different crops
    DEFAULT_SEED_TRADERS.forEach(seed => {
      const exists = combinedTraders.some(t => t._id.toString() === seed._id || t.businessName === seed.businessName);
      if (!exists) {
        combinedTraders.push(seed);
      }
    });

    res.status(200).json({
      success: true,
      count: combinedTraders.length,
      traders: combinedTraders
    });
  } catch (error) {
    console.error('Get All Traders Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch traders' });
  }
};

// Get single specific Trader by ID
exports.getTraderById = async (req, res) => {
  try {
    const { id } = req.params;
    const traderUser = await User.findById(id).select('-password').lean();

    if (!traderUser || traderUser.role !== 'trader') {
      return res.status(404).json({ success: false, error: 'Trader business not found' });
    }

    let profile = await TraderProfile.findOne({ userId: traderUser._id }).lean();

    if (!profile) {
      profile = {
        businessName: `${traderUser.name} Agricultural Trading Co.`,
        ownerName: traderUser.name,
        businessDescription: 'Licensed APMC wholesale commodity trading firm specializing in direct farm crop procurement.',
        businessLocation: traderUser.address || 'Mysuru Wholesale APMC Yard, Karnataka',
        contactNumber: traderUser.phone || traderUser.mobileNumber || '+91 9945001122',
        businessType: 'APMC Wholesale Grain & Produce Buyer',
        openingHours: '7:00 AM - 7:00 PM',
        businessStatus: 'open',
        businessImage: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
        interestedCrops: ['Paddy', 'Sugarcane', 'Tomato', 'Maize'],
        purchaseCapacity: 'High (50+ Quintals)'
      };
    }

    res.status(200).json({
      success: true,
      trader: {
        _id: traderUser._id,
        userId: traderUser._id,
        user: traderUser,
        businessName: profile.businessName || `${traderUser.name} Traders`,
        ownerName: profile.ownerName || traderUser.name,
        businessDescription: profile.businessDescription || 'Wholesale crop buyer.',
        businessLocation: profile.businessLocation || traderUser.address || 'Karnataka, India',
        contactNumber: profile.contactNumber || traderUser.phone || traderUser.mobileNumber || '+91 9945001122',
        businessType: profile.businessType || 'Wholesale Buyer',
        openingHours: profile.openingHours || '7:00 AM - 7:00 PM',
        businessStatus: profile.businessStatus || 'open',
        businessImage: profile.businessImage || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
        interestedCrops: profile.interestedCrops || ['Paddy', 'Tomato'],
        purchaseCapacity: profile.purchaseCapacity || 'High (50+ Quintals)'
      }
    });
  } catch (error) {
    console.error('Get Trader By ID Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trader profile' });
  }
};

// Update Trader Business Profile (Trader Only - Enforced in Backend)
exports.updateTraderProfile = async (req, res) => {
  try {
    const {
      businessName, ownerName, businessDescription, businessLocation,
      contactNumber, businessType, openingHours, businessStatus,
      businessImage, interestedCrops, purchaseCapacity
    } = req.body;

    const profileData = {
      userId: req.user._id,
      businessName,
      ownerName,
      businessDescription,
      businessLocation,
      contactNumber,
      businessType,
      openingHours,
      businessStatus,
      businessImage,
      interestedCrops,
      purchaseCapacity
    };

    const updatedProfile = await TraderProfile.findOneAndUpdate(
      { userId: req.user._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Trader business profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update Trader Profile Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update trader business profile' });
  }
};

// Create Trader Commodity Buying Requirement (Trader Only)
exports.createRequirement = async (req, res) => {
  try {
    const { cropName, variety, quantityNeeded, unit, offeredPricePerUnit, preferredLocation, description, imageUrl } = req.body;

    const requirement = await TraderRequirement.create({
      traderId: req.user._id,
      cropName,
      variety: variety || 'Standard',
      quantityNeeded: Number(quantityNeeded),
      unit: unit || 'quintal',
      offeredPricePerUnit: Number(offeredPricePerUnit),
      preferredLocation: preferredLocation || req.user.address || 'Karnataka',
      description: description || '',
      imageUrl: imageUrl || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Sourcing requirement posted successfully',
      requirement
    });
  } catch (error) {
    console.error('Create Requirement Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to post sourcing requirement' });
  }
};

// Get Sourcing Requirements (Public / Farmers / Traders)
exports.getRequirements = async (req, res) => {
  try {
    const { cropName, traderId } = req.query;
    let query = { status: 'active' };

    if (cropName) query.cropName = new RegExp(cropName, 'i');
    if (traderId) query.traderId = traderId;

    const requirements = await TraderRequirement.find(query)
      .populate('traderId', 'name phone email address')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(requirements.map(async (r) => {
      const profile = await TraderProfile.findOne({ userId: r.traderId?._id }).lean();
      return {
        ...r,
        businessName: profile?.businessName || r.traderId?.name || 'Wholesale Trader',
        contactNumber: profile?.contactNumber || r.traderId?.phone || ''
      };
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      requirements: enriched
    });
  } catch (error) {
    console.error('Get Requirements Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trader requirements' });
  }
};

// Delete Trader Sourcing Requirement
exports.deleteRequirement = async (req, res) => {
  try {
    const { reqId } = req.params;
    const requirement = await TraderRequirement.findById(reqId);

    if (!requirement) {
      return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    if (requirement.traderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this requirement' });
    }

    await TraderRequirement.findByIdAndDelete(reqId);

    res.status(200).json({
      success: true,
      message: 'Requirement deleted successfully'
    });
  } catch (error) {
    console.error('Delete Requirement Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete requirement' });
  }
};
