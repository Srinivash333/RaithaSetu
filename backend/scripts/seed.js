const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const StoreProfile = require('../models/StoreProfile');
const TraderProfile = require('../models/TraderProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CropListing = require('../models/CropListing');
const AgroProduct = require('../models/AgroProduct');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raithasetu';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connected to MongoDB for database seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await FarmerProfile.deleteMany({});
    await WorkerProfile.deleteMany({});
    await StoreProfile.deleteMany({});
    await TraderProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await CropListing.deleteMany({});
    await AgroProduct.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    console.log('🧹 Cleared existing database records.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Users
    // Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@raithasetu.com',
      password: passwordHash,
      phone: '+91 9876543210',
      role: 'admin',
      address: 'Bengaluru, Karnataka',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] }
    });

    // Farmers
    const farmer1 = await User.create({
      name: 'Ramesh Gowda',
      email: 'farmer.ramesh@raithasetu.com',
      password: passwordHash,
      phone: process.env.DEMO_FARMER_PHONE || '+91 9845123456',
      mobileNumber: process.env.DEMO_FARMER_PHONE || '+91 9845123456',
      role: 'farmer',
      address: 'Mandya Rural, Mandya District, Karnataka',
      location: { type: 'Point', coordinates: [76.8973, 12.5218] } // Mandya
    });
    await FarmerProfile.create({
      userId: farmer1._id,
      cropsGrown: ['Paddy', 'Sugarcane', 'Tomato'],
      farmSizeAcres: 5.5,
      farmingExperienceYears: 12,
      farmLocationName: 'Green Valley Farms, Mandya'
    });

    const farmer2 = await User.create({
      name: 'Suresh Patil',
      email: 'farmer.suresh@raithasetu.com',
      password: passwordHash,
      phone: '+91 9900112233',
      role: 'farmer',
      address: 'Hassan Taluk, Hassan District, Karnataka',
      location: { type: 'Point', coordinates: [76.1004, 13.0068] } // Hassan
    });
    await FarmerProfile.create({
      userId: farmer2._id,
      cropsGrown: ['Coffee', 'Arecanut', 'Maize'],
      farmSizeAcres: 8.0,
      farmingExperienceYears: 18,
      farmLocationName: 'Patil Estate, Hassan'
    });

    // Workers
    const worker1 = await User.create({
      name: 'Manjunatha K',
      email: 'worker.manju@raithasetu.com',
      password: passwordHash,
      phone: '+91 9731234567',
      role: 'worker',
      address: 'Maddur, Mandya District, Karnataka',
      location: { type: 'Point', coordinates: [77.0428, 12.5843] } // Maddur (~15km from Mandya)
    });
    await WorkerProfile.create({
      userId: worker1._id,
      skills: ['Harvesting', 'Pesticide Spraying', 'Tilling', 'Sugarcane Cutting'],
      experienceYears: 6,
      preferredWorkTypes: ['Daily', 'Weekly'],
      expectedWagePerDay: 700,
      isAvailable: true,
      ratingAverage: 4.8,
      ratingCount: 15,
      completedJobsCount: 24
    });

    const worker2 = await User.create({
      name: 'Latha Kumar',
      email: 'worker.latha@raithasetu.com',
      password: passwordHash,
      phone: '+91 9611887766',
      role: 'worker',
      address: 'Pandavapura, Mandya District, Karnataka',
      location: { type: 'Point', coordinates: [76.6698, 12.4939] }
    });
    await WorkerProfile.create({
      userId: worker2._id,
      skills: ['Sowing', 'Weeding', 'Tomato Harvesting', 'Irrigation'],
      experienceYears: 4,
      preferredWorkTypes: ['Daily'],
      expectedWagePerDay: 600,
      isAvailable: true,
      ratingAverage: 4.6,
      ratingCount: 9,
      completedJobsCount: 14
    });

    const worker3 = await User.create({
      name: 'Basavaraj B',
      email: 'worker.basava@raithasetu.com',
      password: passwordHash,
      phone: '+91 9448554433',
      role: 'worker',
      address: 'Channarayapatna, Hassan District, Karnataka',
      location: { type: 'Point', coordinates: [76.3917, 12.9056] }
    });
    await WorkerProfile.create({
      userId: worker3._id,
      skills: ['Arecanut Harvesting', 'Tilling', 'Heavy Machinery Operation', 'Pesticide Spraying'],
      experienceYears: 8,
      preferredWorkTypes: ['Weekly', 'Seasonal'],
      expectedWagePerDay: 850,
      isAvailable: true,
      ratingAverage: 4.9,
      ratingCount: 22,
      completedJobsCount: 31
    });

    // Agro Stores
    const store1 = await User.create({
      name: 'Kaveri Agro Kendra',
      email: 'store.kaveri@raithasetu.com',
      password: passwordHash,
      phone: '+91 9880099887',
      role: 'store',
      address: 'APMC Market Yard, Mandya City, Karnataka',
      location: { type: 'Point', coordinates: [76.8973, 12.5218] }
    });
    await StoreProfile.create({
      userId: store1._id,
      storeName: 'Kaveri Agro Kendra & Seeds',
      ownerName: 'Ramesh Kumar',
      shopDescription: 'Specific certified agro input shop supplying high yield seeds, water-soluble fertilizers, bio-pesticides & harvesting tools.',
      storeAddress: 'APMC Market Yard, Mandya City, Karnataka',
      contactNumber: '+91 9880099887',
      openingHours: '8:00 AM - 8:00 PM',
      shopStatus: 'open',
      shopImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      productCategories: ['seeds', 'fertilizers', 'pesticides', 'tools'],
      isDeliveryAvailable: true,
      deliveryRadiusKm: 25,
      ratingAverage: 4.7,
      ratingCount: 18
    });

    const store2 = await User.create({
      name: 'Sahyadri Farm Equipment Store',
      email: 'store.sahyadri@raithasetu.com',
      password: passwordHash,
      phone: '+91 9740112244',
      role: 'store',
      address: 'BM Road, Hassan, Karnataka',
      location: { type: 'Point', coordinates: [76.1004, 13.0068] }
    });
    await StoreProfile.create({
      userId: store2._id,
      storeName: 'Sahyadri Agro Machinery & Fertilisers',
      ownerName: 'Suresh Gowda',
      shopDescription: 'Authorized farm machinery, sickle tools, sprayer pumps & specialized fertilizers store.',
      storeAddress: 'BM Road, Hassan, Karnataka',
      contactNumber: '+91 9740112244',
      openingHours: '8:30 AM - 7:30 PM',
      shopStatus: 'open',
      shopImage: 'https://images.unsplash.com/photo-1617575521317-8b9829377462?auto=format&fit=crop&w=800&q=80',
      productCategories: ['seeds', 'fertilizers', 'tools', 'machinery'],
      isDeliveryAvailable: true,
      deliveryRadiusKm: 30,
      ratingAverage: 4.5,
      ratingCount: 12
    });

    // Traders
    const trader1 = await User.create({
      name: 'Rahul Kumar',
      email: 'trader.annapurna@raithasetu.com',
      password: passwordHash,
      phone: '+91 9945001122',
      role: 'trader',
      address: 'Mysuru Wholesale APMC Complex, Mysuru, Karnataka',
      location: { type: 'Point', coordinates: [76.6394, 12.2958] }
    });
    await TraderProfile.create({
      userId: trader1._id,
      businessName: 'Annapurna Agricultural Trading Co.',
      ownerName: 'Rahul Kumar',
      businessDescription: 'Licensed APMC wholesale commodity buyer procuring Sonamasuri Paddy, Sugarcane, Hybrid Tomatoes & Maize directly from Karnataka farmers.',
      businessLocation: 'Mysuru Wholesale APMC Complex, Mysuru',
      contactNumber: '+91 9945001122',
      businessType: 'APMC Wholesale Grain & Produce Buyer',
      openingHours: '7:00 AM - 7:00 PM',
      businessStatus: 'open',
      businessImage: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
      interestedCrops: ['Paddy', 'Sugarcane', 'Tomato', 'Maize'],
      purchaseCapacity: 'High (50+ Quintals)'
    });

    // 2. Create Jobs
    const job1 = await Job.create({
      farmerId: farmer1._id,
      title: 'Paddy Harvesting & Threshing Workers Needed',
      crop: 'Paddy',
      workType: 'Harvesting',
      description: 'Looking for 3 experienced harvesting workers for 4 acres of ripe paddy fields near Mandya. Immediate start.',
      requiredSkills: ['Harvesting', 'Pesticide Spraying', 'Tilling'],
      workersNeeded: 3,
      location: { type: 'Point', coordinates: [76.8973, 12.5218] },
      locationName: 'Green Valley Farm, Mandya',
      startDate: new Date(),
      duration: 'Daily',
      wage: 750,
      status: 'applications_received'
    });

    const job2 = await Job.create({
      farmerId: farmer1._id,
      title: 'Sugarcane Cutting & Field Loading',
      crop: 'Sugarcane',
      workType: 'Sugarcane Cutting',
      description: 'Need workers for cutting 2 acres of sugarcane crop. Transportation to local sugar factory arranged.',
      requiredSkills: ['Sugarcane Cutting', 'Harvesting'],
      workersNeeded: 4,
      location: { type: 'Point', coordinates: [76.8973, 12.5218] },
      locationName: 'Mandya East Farm',
      startDate: new Date(Date.now() + 86400000 * 2),
      duration: 'Weekly',
      wage: 800,
      status: 'open'
    });

    const job3 = await Job.create({
      farmerId: farmer2._id,
      title: 'Arecanut Plucking & Processing Helper',
      crop: 'Arecanut',
      workType: 'Harvesting',
      description: 'Skilled Arecanut plucker required for plantation in Hassan taluk. High daily wage for skilled workers.',
      requiredSkills: ['Arecanut Harvesting', 'Tilling'],
      workersNeeded: 2,
      location: { type: 'Point', coordinates: [76.1004, 13.0068] },
      locationName: 'Patil Estate, Hassan',
      startDate: new Date(),
      duration: 'Daily',
      wage: 900,
      status: 'open'
    });

    // 3. Applications
    await Application.create({
      jobId: job1._id,
      workerId: worker1._id,
      farmerId: farmer1._id,
      status: 'applied',
      note: 'I have 6 years experience in paddy harvesting in Mandya belt.'
    });
    await Application.create({
      jobId: job1._id,
      workerId: worker2._id,
      farmerId: farmer1._id,
      status: 'applied',
      note: 'Available immediately for paddy harvesting.'
    });

    // 4. Crop Listings (Farmers selling crops)
    await CropListing.create({
      farmerId: farmer1._id,
      cropName: 'Organic Sonamasuri Paddy',
      variety: 'Sonamasuri Raw',
      quantity: 50,
      unit: 'quintal',
      expectedPricePerUnit: 2400,
      harvestDate: new Date(),
      location: { type: 'Point', coordinates: [76.8973, 12.5218] },
      locationName: 'Mandya Farm Storehouse',
      description: 'Freshly harvested high-grade Sonamasuri paddy stored in clean jute bags.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      status: 'available'
    });

    await CropListing.create({
      farmerId: farmer1._id,
      cropName: 'Fresh Farm Tomatoes',
      variety: 'Hybrid Red',
      quantity: 30,
      unit: 'box',
      expectedPricePerUnit: 600,
      harvestDate: new Date(),
      location: { type: 'Point', coordinates: [76.8973, 12.5218] },
      locationName: 'Mandya Farm',
      description: 'Firm, pesticide-controlled fresh tomatoes ready for transport to Mysuru/Bengaluru APMC.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      status: 'available'
    });

    // 5. Agro Products (Store listings)
    const product1 = await AgroProduct.create({
      storeId: store1._id,
      productName: 'Hybrid Paddy Seeds (RNR 15048 Telangana Sona)',
      category: 'seeds',
      price: 950,
      stockQuantity: 40,
      unit: '10 kg bag',
      description: 'Blast-resistant, high-yielding short duration paddy seed suitable for Karnataka climate.',
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
      inStock: true
    });

    const product2 = await AgroProduct.create({
      storeId: store1._id,
      productName: 'IFFCO NPK 19:19:19 Water Soluble Fertilizer',
      category: 'fertilizers',
      price: 1350,
      stockQuantity: 25,
      unit: '25 kg bag',
      description: 'Balanced NPK nutrient booster for fast vegetative growth and crop strength.',
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
      inStock: true
    });

    await AgroProduct.create({
      storeId: store1._id,
      productName: 'Neem-Based Organic Bio-Pesticide (10000 PPM)',
      category: 'pesticides',
      price: 480,
      stockQuantity: 15,
      unit: '1 Liter Bottle',
      description: 'Pure cold-pressed neem oil formulation for organic controlling of leaf sucking pests and aphids.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      inStock: true
    });

    await AgroProduct.create({
      storeId: store2._id,
      productName: 'Ergonomic Stainless Steel Sickle & Harvester Tool',
      category: 'tools',
      price: 320,
      stockQuantity: 30,
      unit: 'piece',
      description: 'Heavy duty tempered steel blade with non-slip wooden handle for crop harvesting.',
      imageUrl: 'https://images.unsplash.com/photo-1617575521317-8b9829377462?auto=format&fit=crop&w=600&q=80',
      inStock: true
    });

    // 6. Orders
    await Order.create({
      buyerId: farmer1._id,
      sellerId: store1._id,
      orderType: 'agro_product',
      items: [
        { itemId: product1._id, name: 'Hybrid Paddy Seeds', quantity: 2, unitPrice: 950, totalPrice: 1900 },
        { itemId: product2._id, name: 'IFFCO NPK 19:19:19 Fertilizer', quantity: 1, unitPrice: 1350, totalPrice: 1350 }
      ],
      totalAmount: 3250,
      shippingAddress: 'Green Valley Farms, Mandya',
      deliveryOption: 'store_delivery',
      paymentMethod: 'upi',
      paymentStatus: 'demo_paid',
      orderStatus: 'out_for_delivery'
    });

    // 7. Notifications
    await Notification.create({
      userId: farmer1._id,
      title: 'Application Received',
      message: 'Manjunatha K applied for your job "Paddy Harvesting Workers Needed"',
      type: 'job_application',
      isRead: false
    });

    console.log('✅ Database Seeding Complete!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Login Testing:');
    console.log('🌾 Farmer: farmer.ramesh@raithasetu.com / password123');
    console.log('🔨 Worker: worker.manju@raithasetu.com / password123');
    console.log('🏪 Store: store.kaveri@raithasetu.com / password123');
    console.log('📈 Trader: trader.annapurna@raithasetu.com / password123');
    console.log('👑 Admin: admin@raithasetu.com / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
