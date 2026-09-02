const CropMessage = require('../models/CropMessage');
const CropListing = require('../models/CropListing');
const Notification = require('../models/Notification');

// Send Crop Q&A Message
exports.sendCropMessage = async (req, res) => {
  try {
    const { cropListingId, traderId, text } = req.body;
    const sender = req.user;

    if (!cropListingId || !traderId || !text) {
      return res.status(400).json({ success: false, error: 'cropListingId, traderId, and text are required' });
    }

    const cropListing = await CropListing.findById(cropListingId);
    if (!cropListing) {
      return res.status(404).json({ success: false, error: 'Crop listing not found' });
    }

    const farmerId = cropListing.farmerId;
    const senderRole = sender._id.toString() === farmerId.toString() ? 'farmer' : 'trader';

    const message = await CropMessage.create({
      cropListingId,
      farmerId,
      traderId,
      senderId: sender._id,
      senderRole,
      text: text.trim()
    });

    // Safe Notification
    try {
      const recipientId = senderRole === 'farmer' ? traderId : farmerId;
      await Notification.create({
        userId: recipientId,
        title: 'New Crop Q&A Message 🌾',
        message: `${sender.name}: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        type: 'general'
      });
    } catch (notifErr) {
      console.error('Non-fatal Notification Error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Crop question sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send Crop Message Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send message' });
  }
};

// Get Q&A Messages for a Specific Crop Listing & Trader
exports.getCropMessages = async (req, res) => {
  try {
    const { cropId, traderId } = req.params;

    const messages = await CropMessage.find({ cropListingId: cropId, traderId })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get Crop Messages Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch crop messages' });
  }
};
