const User = require('../models/User');
const Job = require('../models/Job');
const Order = require('../models/Order');
const CropListing = require('../models/CropListing');
const AgroProduct = require('../models/AgroProduct');

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmerCount = await User.countDocuments({ role: 'farmer' });
    const workerCount = await User.countDocuments({ role: 'worker' });
    const storeCount = await User.countDocuments({ role: 'store' });
    const traderCount = await User.countDocuments({ role: 'trader' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: { $in: ['open', 'applications_received', 'worker_selected', 'in_progress'] } });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    const totalOrders = await Order.countDocuments();
    const totalCropsListed = await CropListing.countDocuments();
    const totalProducts = await AgroProduct.countDocuments();

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(8);
    const recentJobs = await Job.find().populate('farmerId', 'name').sort({ createdAt: -1 }).limit(6);
    const recentOrders = await Order.find().populate('buyerId', 'name').populate('sellerId', 'name').sort({ createdAt: -1 }).limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        roleCounts: {
          farmer: farmerCount,
          worker: workerCount,
          store: storeCount,
          trader: traderCount
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          completed: completedJobs
        },
        marketplace: {
          totalOrders,
          totalCropsListed,
          totalProducts
        }
      },
      recentUsers,
      recentJobs,
      recentOrders
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admin metrics' });
  }
};
