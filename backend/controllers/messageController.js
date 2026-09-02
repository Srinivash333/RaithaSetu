const Message = require('../models/Message');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Send Message (Farmer or Worker)
exports.sendMessage = async (req, res) => {
  try {
    const { jobId, workerId, text } = req.body;
    const sender = req.user;

    if (!jobId || !workerId || !text) {
      return res.status(400).json({ success: false, error: 'jobId, workerId, and text are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const farmerId = job.farmerId;
    const senderRole = sender._id.toString() === farmerId.toString() ? 'farmer' : 'worker';

    const message = await Message.create({
      jobId,
      farmerId,
      workerId,
      senderId: sender._id,
      senderRole,
      text: text.trim()
    });

    // Notify recipient
    const recipientId = senderRole === 'farmer' ? workerId : farmerId;
    await Notification.create({
      userId: recipientId,
      title: 'New Workforce Message',
      message: `${sender.name}: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
      type: 'workforce_message'
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send message' });
  }
};

// Get Message Thread for a Specific Job & Worker
exports.getJobWorkerMessages = async (req, res) => {
  try {
    const { jobId, workerId } = req.params;

    const messages = await Message.find({ jobId, workerId })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get Job Worker Messages Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

// Get User's Message Threads
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ farmerId: userId }, { workerId: userId }]
    })
      .populate('jobId', 'title crop workType wage')
      .populate('farmerId', 'name phone email')
      .populate('workerId', 'name phone email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get My Messages Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch message threads' });
  }
};
