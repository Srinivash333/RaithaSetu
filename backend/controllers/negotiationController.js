const Negotiation = require('../models/Negotiation');
const CropListing = require('../models/CropListing');
const Order = require('../models/Order');
const User = require('../models/User');
const TraderProfile = require('../models/TraderProfile');
const Notification = require('../models/Notification');

// Create Initial Price Offer (Farmer -> Trader or Trader -> Farmer)
exports.createOffer = async (req, res) => {
  try {
    const { cropListingId, pricePerUnit, quantity: qtyInput, traderId: inputTraderId, message } = req.body;
    const sender = req.user;

    if (!cropListingId || !pricePerUnit) {
      return res.status(400).json({ success: false, error: 'Crop listing ID and offered price per unit are required.' });
    }

    const crop = await CropListing.findById(cropListingId);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop listing not found.' });
    }

    if (crop.status === 'sold') {
      return res.status(400).json({ success: false, error: 'This crop has already been sold.' });
    }

    const isFarmerSender = sender._id.toString() === crop.farmerId.toString() || (sender.role || '').toLowerCase() === 'farmer';

    let farmerId, traderId, offeredBy;

    if (isFarmerSender) {
      farmerId = crop.farmerId;
      traderId = inputTraderId;
      offeredBy = 'farmer';

      if (!traderId) {
        return res.status(400).json({ success: false, error: 'Trader ID is required when farmer sends a crop offer.' });
      }

      let traderUser = await User.findById(traderId);
      if (!traderUser) {
        traderUser = await User.findOne({ role: 'trader' });
        if (traderUser) {
          traderId = traderUser._id;
        } else {
          return res.status(404).json({ success: false, error: 'Trader not found.' });
        }
      }
    } else {
      farmerId = crop.farmerId;
      traderId = sender._id;
      offeredBy = 'trader';
    }

    const availableQty = Math.max(0, crop.quantity - (crop.soldQuantity || 0));
    const offerQty = qtyInput ? Number(qtyInput) : availableQty;

    if (isNaN(offerQty) || offerQty <= 0) {
      return res.status(422).json({ success: false, error: 'Please enter a valid quantity greater than 0.' });
    }

    if (offerQty > availableQty) {
      return res.status(422).json({ success: false, error: `Offered quantity cannot exceed available stock (${availableQty} ${crop.unit}s).` });
    }

    const offerPrice = Number(pricePerUnit);
    if (isNaN(offerPrice) || offerPrice <= 0) {
      return res.status(422).json({ success: false, error: 'Please enter a valid price per unit.' });
    }

    const totalAmount = offerPrice * offerQty;

    // Duplicate check for active negotiation between farmer and trader for this crop
    let negotiation = await Negotiation.findOne({
      cropListingId,
      farmerId,
      traderId,
      status: { $in: ['pending', 'countered'] }
    });

    if (negotiation) {
      // Check if last offer in history was sent by the same user to prevent duplicate spam
      const lastOffer = negotiation.offerHistory[negotiation.offerHistory.length - 1];
      if (lastOffer && lastOffer.senderId.toString() === sender._id.toString()) {
        return res.status(409).json({
          success: false,
          status: 409,
          error: 'An offer has already been sent to this trader.',
          negotiation
        });
      }

      negotiation.offerHistory.push({
        offeredBy,
        senderId: sender._id,
        pricePerUnit: offerPrice,
        totalAmount,
        message: message || `Offer of ₹${offerPrice}/${crop.unit} for ${offerQty} ${crop.unit}s`
      });
      negotiation.quantity = offerQty;
      negotiation.currentPrice = offerPrice;
      negotiation.finalTotalAmount = totalAmount;
      negotiation.status = 'pending';
      await negotiation.save();
    } else {
      negotiation = await Negotiation.create({
        cropListingId,
        farmerId,
        traderId,
        initialAskingPrice: crop.expectedPricePerUnit,
        quantity: offerQty,
        unit: crop.unit,
        currentPrice: offerPrice,
        finalTotalAmount: totalAmount,
        status: 'pending',
        offerHistory: [{
          offeredBy,
          senderId: sender._id,
          pricePerUnit: offerPrice,
          totalAmount,
          message: message || `Offered ₹${offerPrice}/${crop.unit} for ${offerQty} ${crop.unit}s`
        }]
      });
    }

    // Safe Notification
    try {
      const recipientId = isFarmerSender ? traderId : farmerId;
      await Notification.create({
        userId: recipientId,
        title: 'New Crop Offer Received 🌾',
        message: `${sender.name} sent a crop offer: ${offerQty} ${crop.unit}s at ₹${offerPrice}/${crop.unit}`,
        type: 'negotiation_offer'
      });
    } catch (notifErr) {
      console.error('Non-fatal Notification Error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Crop offer submitted successfully!',
      negotiation
    });
  } catch (error) {
    console.error('Create Offer Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to submit crop offer.' });
  }
};

// Counter Offer (Farmer or Trader submits counter price)
exports.counterOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { counterPricePerUnit, message } = req.body;
    const userId = req.user._id.toString();

    if (!counterPricePerUnit) {
      return res.status(400).json({ success: false, error: 'Counter price per unit is required.' });
    }

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      return res.status(404).json({ success: false, error: 'Negotiation record not found.' });
    }

    if (negotiation.farmerId.toString() !== userId && negotiation.traderId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You are not a party to this negotiation.' });
    }

    if (negotiation.dealConfirmed || negotiation.status === 'accepted') {
      return res.status(400).json({ success: false, error: 'Deal is already confirmed for this negotiation.' });
    }

    const counterPrice = Number(counterPricePerUnit);
    const totalAmount = counterPrice * negotiation.quantity;
    const isFarmer = negotiation.farmerId.toString() === userId;

    // Append to offer history (NEVER OVERWRITING previous history)
    negotiation.offerHistory.push({
      offeredBy: isFarmer ? 'farmer' : 'trader',
      senderId: req.user._id,
      pricePerUnit: counterPrice,
      totalAmount,
      message: message || `Counter-offer of ₹${counterPrice}/${negotiation.unit}`
    });

    negotiation.currentPrice = counterPrice;
    negotiation.finalTotalAmount = totalAmount;
    negotiation.status = 'countered';
    await negotiation.save();

    // Notify recipient
    const recipientId = isFarmer ? negotiation.traderId : negotiation.farmerId;
    await Notification.create({
      userId: recipientId,
      title: 'Counter Offer Received',
      message: `${req.user.name} submitted a counter-offer of ₹${counterPrice}/${negotiation.unit}`,
      type: 'negotiation_offer'
    });

    res.status(200).json({
      success: true,
      message: 'Counter offer submitted!',
      negotiation
    });
  } catch (error) {
    console.error('Counter Offer Error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit counter offer.' });
  }
};

// Accept Offer & Confirm Deal
exports.acceptOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const negotiation = await Negotiation.findById(id).populate('cropListingId');
    if (!negotiation) {
      return res.status(404).json({ success: false, error: 'Negotiation record not found.' });
    }

    if (negotiation.farmerId.toString() !== userId && negotiation.traderId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You are not a party to this negotiation.' });
    }

    if (negotiation.dealConfirmed) {
      return res.status(400).json({ success: false, error: 'Deal has already been confirmed.' });
    }

    const isFarmer = negotiation.farmerId.toString() === userId;
    const finalPrice = negotiation.currentPrice;
    const totalAmount = finalPrice * negotiation.quantity;

    // Append acceptance to offer history
    negotiation.offerHistory.push({
      offeredBy: isFarmer ? 'farmer' : 'trader',
      senderId: req.user._id,
      pricePerUnit: finalPrice,
      totalAmount,
      message: `ACCEPTED offer at ₹${finalPrice}/${negotiation.unit}`
    });

    negotiation.status = 'accepted';
    negotiation.dealConfirmed = true;
    negotiation.confirmedAt = new Date();
    await negotiation.save();

    // Fetch Trader Profile for business details
    const traderProfile = await TraderProfile.findOne({ userId: negotiation.traderId });
    const traderUser = await User.findById(negotiation.traderId);
    const traderBusinessName = traderProfile?.businessName || traderUser?.name || 'Wholesale Agricultural Trader';

    // 1. Create Confirmed Transaction Record (Order model)
    const confirmedDeal = await Order.create({
      buyerId: negotiation.traderId, // Trader is the crop buyer
      sellerId: negotiation.farmerId, // Farmer is the seller
      orderType: 'crop_purchase',
      items: [{
        itemId: negotiation.cropListingId._id || negotiation.cropListingId,
        name: negotiation.cropListingId.cropName || 'Farm Crop',
        quantity: negotiation.quantity,
        unitPrice: finalPrice,
        totalPrice: totalAmount
      }],
      totalAmount,
      shippingAddress: `${traderBusinessName} APMC Storage Yard`,
      deliveryOption: 'trader_pickup',
      paymentMethod: 'cod',
      paymentStatus: 'pending_cod',
      orderStatus: 'confirmed'
    });

    // 2. Handle Partial Sales & Crop Listing Status Update
    const targetCropId = negotiation.cropListingId._id || negotiation.cropListingId;
    const cropDoc = await CropListing.findById(targetCropId);
    
    if (cropDoc) {
      const newSoldQty = (cropDoc.soldQuantity || 0) + negotiation.quantity;
      const isFullySold = newSoldQty >= cropDoc.quantity;
      
      await CropListing.findByIdAndUpdate(targetCropId, {
        soldQuantity: newSoldQty,
        status: isFullySold ? 'sold' : 'available'
      });

      // 3. If fully sold, cancel other pending negotiations for this crop listing
      if (isFullySold) {
        await Negotiation.updateMany(
          {
            cropListingId: targetCropId,
            _id: { $ne: negotiation._id },
            status: { $in: ['pending', 'countered'] }
          },
          {
            status: 'cancelled'
          }
        );
      }
    }

    // Notify Trader & Farmer
    await Notification.create({
      userId: negotiation.traderId,
      title: 'DEAL CONFIRMED 🤝',
      message: `Deal confirmed for ${negotiation.quantity} ${negotiation.unit} at ₹${finalPrice}/${negotiation.unit}. Total: ₹${totalAmount}`,
      type: 'deal_confirmed'
    });
    await Notification.create({
      userId: negotiation.farmerId,
      title: 'DEAL CONFIRMED 🤝',
      message: `Deal confirmed with ${traderBusinessName} for ₹${totalAmount}. Payment: Pay Offline`,
      type: 'deal_confirmed'
    });

    res.status(200).json({
      success: true,
      message: 'Deal confirmed successfully!',
      negotiation,
      confirmedDeal
    });
  } catch (error) {
    console.error('Accept Offer Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to accept deal.' });
  }
};

// Reject or Cancel Offer
exports.rejectOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      return res.status(404).json({ success: false, error: 'Negotiation not found.' });
    }

    if (negotiation.farmerId.toString() !== userId && negotiation.traderId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    negotiation.status = 'rejected';
    await negotiation.save();

    res.status(200).json({
      success: true,
      message: 'Negotiation rejected.',
      negotiation
    });
  } catch (error) {
    console.error('Reject Offer Error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject offer.' });
  }
};

// Get Single Negotiation by ID (with full offer history)
exports.getNegotiationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const negotiation = await Negotiation.findById(id)
      .populate('cropListingId')
      .populate('farmerId', 'name phone email address')
      .populate('traderId', 'name phone email address')
      .lean();

    if (!negotiation) {
      return res.status(404).json({ success: false, error: 'Negotiation not found.' });
    }

    if (negotiation.farmerId._id.toString() !== userId && negotiation.traderId._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this negotiation.' });
    }

    const traderProfile = await TraderProfile.findOne({ userId: negotiation.traderId._id }).lean();

    res.status(200).json({
      success: true,
      negotiation: {
        ...negotiation,
        traderBusinessName: traderProfile?.businessName || negotiation.traderId.name
      }
    });
  } catch (error) {
    console.error('Get Negotiation Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch negotiation.' });
  }
};

// Get All Offers for a Specific Crop (Farmer view to compare multiple traders)
exports.getNegotiationsForCrop = async (req, res) => {
  try {
    const { cropId } = req.params;

    const crop = await CropListing.findById(cropId);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop listing not found.' });
    }

    // Security check: Only the farmer who posted the crop or active trader can view
    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'trader') {
      return res.status(403).json({ success: false, error: 'Unauthorized to view offers for this crop.' });
    }

    let query = { cropListingId: cropId };
    if (req.user.role === 'trader') {
      query.traderId = req.user._id;
    }

    const negotiations = await Negotiation.find(query)
      .populate('traderId', 'name phone email address')
      .populate('farmerId', 'name phone email address')
      .sort({ updatedAt: -1 })
      .lean();

    const enriched = await Promise.all(negotiations.map(async (n) => {
      const traderProfile = await TraderProfile.findOne({ userId: n.traderId._id }).lean();
      return {
        ...n,
        traderBusinessName: traderProfile?.businessName || n.traderId.name
      };
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      negotiations: enriched
    });
  } catch (error) {
    console.error('Get Crop Offers Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch crop offers.' });
  }
};

// Get User's Negotiations (My Offers / My Deals)
exports.getMyNegotiations = async (req, res) => {
  try {
    const userId = req.user._id;

    const negotiations = await Negotiation.find({
      $or: [{ farmerId: userId }, { traderId: userId }]
    })
      .populate('cropListingId')
      .populate('farmerId', 'name phone email address')
      .populate('traderId', 'name phone email address')
      .sort({ updatedAt: -1 })
      .lean();

    const enriched = await Promise.all(negotiations.map(async (n) => {
      const traderProfile = await TraderProfile.findOne({ userId: n.traderId?._id }).lean();
      return {
        ...n,
        traderBusinessName: traderProfile?.businessName || n.traderId?.name || 'Wholesale Trader'
      };
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      negotiations: enriched
    });
  } catch (error) {
    console.error('Get My Negotiations Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch negotiations.' });
  }
};

// AI Price Negotiation Guidance
exports.getAIGuidance = async (req, res) => {
  try {
    const { id } = req.params;

    const negotiation = await Negotiation.findById(id).populate('cropListingId');
    if (!negotiation) {
      return res.status(404).json({ success: false, error: 'Negotiation not found.' });
    }

    const askingPrice = negotiation.initialAskingPrice;
    const latestOffer = negotiation.currentPrice;
    const cropName = negotiation.cropListingId?.cropName || 'Crop';
    const quantity = negotiation.quantity;
    const unit = negotiation.unit;

    // Calculate AI Suggested Negotiation Strategy
    const midPoint = Math.round(((askingPrice + latestOffer) / 2) * 10) / 10;
    const rangeMin = Math.floor(Math.min(askingPrice, latestOffer) + (Math.abs(askingPrice - latestOffer) * 0.4));
    const rangeMax = Math.ceil(Math.max(askingPrice, latestOffer) - (Math.abs(askingPrice - latestOffer) * 0.2));

    const priceDiff = Math.abs(askingPrice - latestOffer);
    const diffPercentage = Math.round((priceDiff / askingPrice) * 100);

    let recommendation = '';
    if (diffPercentage <= 5) {
      recommendation = `The offer of ₹${latestOffer}/${unit} is very close to your asking price of ₹${askingPrice}/${unit}. Consider accepting or closing at ₹${midPoint}/${unit}.`;
    } else if (diffPercentage <= 15) {
      recommendation = `Consider making a counter-offer of ₹${midPoint}/${unit} instead of accepting ₹${latestOffer}/${unit}.`;
    } else {
      recommendation = `The current offer of ₹${latestOffer}/${unit} is ${diffPercentage}% below asking. We recommend submitting a counter-offer between ₹${rangeMin} and ₹${rangeMax}/${unit}.`;
    }

    res.status(200).json({
      success: true,
      guidance: {
        cropName,
        quantity,
        unit,
        askingPrice,
        latestOffer,
        suggestedCounterPrice: midPoint,
        suggestedRange: `₹${rangeMin} – ₹${rangeMax} / ${unit}`,
        recommendation,
        disclaimer: 'Note: AI market guidance is an estimate based on current regional APMC benchmarks.'
      }
    });
  } catch (error) {
    console.error('AI Guidance Error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate AI negotiation guidance.' });
  }
};
