const CropListing = require('../models/CropListing');

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

// Create a new crop listing (Farmer only)
exports.createCropListing = async (req, res) => {
  try {
    const { cropName, variety, quantity, unit, expectedPricePerUnit, harvestDate, locationName, description, imageUrl, latitude, longitude, targetTraderIds } = req.body;

    const coords = [
      longitude ? parseFloat(longitude) : req.user.location.coordinates[0],
      latitude ? parseFloat(latitude) : req.user.location.coordinates[1]
    ];

    const listing = await CropListing.create({
      farmerId: req.user._id,
      cropName,
      variety: variety || 'Standard',
      quantity: Number(quantity),
      unit: unit || 'quintal',
      expectedPricePerUnit: Number(expectedPricePerUnit),
      harvestDate: harvestDate || new Date(),
      location: {
        type: 'Point',
        coordinates: coords
      },
      locationName: locationName || req.user.address || 'Farm',
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      soldQuantity: 0,
      targetTraderIds: Array.isArray(targetTraderIds) ? targetTraderIds : [],
      status: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create Crop Listing Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create crop listing' });
  }
};

// Get crop listings (Trader / Public search) with distance calculations
exports.getCropListings = async (req, res) => {
  try {
    const { cropName, maxDistanceKm, status, latitude, longitude } = req.query;
    let query = { status: status || 'available' };

    if (cropName) query.cropName = new RegExp(cropName, 'i');

    let userCoords = req.user && req.user.location ? req.user.location.coordinates : [77.5946, 12.9716];
    if (longitude && latitude) {
      userCoords = [parseFloat(longitude), parseFloat(latitude)];
    }

    if (maxDistanceKm) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoords
          },
          $maxDistance: parseFloat(maxDistanceKm) * 1000
        }
      };
    }

    const listings = await CropListing.find(query)
      .populate('farmerId', 'name phone email address location')
      .sort({ createdAt: -1 })
      .lean();

    const listingsWithDistance = listings.map(item => {
      const dist = calculateDistanceKm(userCoords, item.location.coordinates);
      return {
        ...item,
        distanceKm: dist
      };
    });

    res.status(200).json({
      success: true,
      count: listingsWithDistance.length,
      listings: listingsWithDistance
    });
  } catch (error) {
    console.error('Get Crop Listings Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch crop listings' });
  }
};

// Get farmer's own crop listings
exports.getMyCropListings = async (req, res) => {
  try {
    const listings = await CropListing.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    console.error('Get My Crop Listings Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch farmer crop listings' });
  }
};
