const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const NGO = require('./models/NGO');
const Wish = require('./models/Wish');
const EmergencyFund = require('./models/EmergencyFund');
const AdoptADay = require('./models/AdoptADay');
const Gratitude = require('./models/Gratitude');
const Donation = require('./models/Donation');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await NGO.deleteMany({});
    // await Wish.deleteMany({});
    // await EmergencyFund.deleteMany({});
    // await AdoptADay.deleteMany({});
    // await Gratitude.deleteMany({});
    // await Donation.deleteMany({});
    // console.log('🗑️  Cleared existing data\n');

    // 1. Create Users
    console.log('👤 Creating users...');

    // Create System Admin
    let systemAdmin = await User.findOne({ email: 'admin@heartbridge.com' });
    if (!systemAdmin) {
      systemAdmin = await User.create({
        name: 'System Administrator',
        email: 'admin@heartbridge.com',
        password: 'admin123',
        role: 'system_admin',
        phone: '9999999999',
        address: 'System Admin Office, Platform Headquarters',
        isEmailVerified: true
      });
      console.log('✅ Created system admin: admin@heartbridge.com / admin123');
    } else {
      systemAdmin.isEmailVerified = true;
      await systemAdmin.save();
      console.log('ℹ️  System admin already exists - updated to verified');
    }

    let donorUser = await User.findOne({ email: 'donor@heartbridge.com' });
    if (!donorUser) {
      donorUser = await User.create({
        name: 'John Donor',
        email: 'donor@heartbridge.com',
        password: 'password123',
        role: 'donor',
        phone: '9876543210',
        address: '123 Donor Street, City',
        isEmailVerified: true
      });
      console.log('✅ Created donor user: donor@heartbridge.com / password123');
    } else {
      donorUser.isEmailVerified = true;
      await donorUser.save();
      console.log('ℹ️  Donor user already exists - updated to verified');
    }

    // Create NGO Admin Users for each NGO
    const ngoAdmins = [];
    for (let i = 1; i <= 21; i++) {
      let ngoAdmin = await User.findOne({ email: `ngo${i}@heartbridge.com` });
      if (!ngoAdmin) {
        ngoAdmin = await User.create({
          name: `NGO Admin ${i}`,
          email: `ngo${i}@heartbridge.com`,
          password: 'password123',
          role: 'ngo_admin',
          phone: `987654320${i.toString().padStart(2, '0')}`,
          address: `${100 + i} Admin Street, City ${i}`,
          isEmailVerified: true
        });
        console.log(`✅ Created NGO admin ${i}: ngo${i}@heartbridge.com / password123`);
      } else {
        ngoAdmin.isEmailVerified = true;
        await ngoAdmin.save();
        console.log(`ℹ️  NGO admin ${i} already exists - updated to verified`);
      }
      ngoAdmins.push(ngoAdmin);
    }

    let donor2 = await User.findOne({ email: 'donor2@heartbridge.com' });
    if (!donor2) {
      donor2 = await User.create({
        name: 'Sarah Investor',
        email: 'donor2@heartbridge.com',
        password: 'password123',
        role: 'donor',
        phone: '9876543213',
        address: '321 Charity Lane, Pune',
        isEmailVerified: true
      });
      console.log('✅ Created donor user 2: donor2@heartbridge.com / password123');
    } else {
      donor2.isEmailVerified = true;
      await donor2.save();
      console.log('ℹ️  Donor user 2 already exists - updated to verified');
    }

    let donor3 = await User.findOne({ email: 'donor3@heartbridge.com' });
    if (!donor3) {
      donor3 = await User.create({
        name: 'Rahul Philanthropist',
        email: 'donor3@heartbridge.com',
        password: 'password123',
        role: 'donor',
        phone: '9876543214',
        address: '654 Help Road, Hyderabad',
        isEmailVerified: true
      });
      console.log('✅ Created donor user 3: donor3@heartbridge.com / password123');
    } else {
      donor3.isEmailVerified = true;
      await donor3.save();
      console.log('ℹ️  Donor user 3 already exists - updated to verified');
    }

    // 2. Create NGOs
    console.log('\n🏢 Creating NGOs...');
    let ngo1 = await NGO.findOne({ registrationNumber: 'REG-001' });
    if (!ngo1) {
      ngo1 = await NGO.create({
        name: 'Sunrise Old Age Home',
        description: 'Providing care and comfort for senior citizens. We offer medical support, nutritious meals, and recreational activities.',
        category: 'Old Age Homes',
        adminId: ngoAdmins[0]._id,
        registrationNumber: 'REG-001',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
        phone: '9876543210',
        email: 'sunrise@example.com',
        website: 'https://sunrise-home.org',
        fundingRequirement: 500000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Sunrise Old Age Home');
    } else {
      // Update existing NGO with correct admin
      ngo1.adminId = ngoAdmins[0]._id;
      await ngo1.save();
      console.log('✅ Updated NGO 1 with correct admin');
    }

    let ngo2 = await NGO.findOne({ registrationNumber: 'REG-002' });
    if (!ngo2) {
      ngo2 = await NGO.create({
        name: 'Children Welfare Foundation',
        description: 'Dedicated to improving the lives of underprivileged children through education, healthcare, and nutrition programs.',
        category: 'Children Welfare NGOs',
        adminId: ngoAdmins[1]._id,
        registrationNumber: 'REG-002',
        address: '456 Children Avenue, Delhi, Delhi 110001',
        phone: '9876543211',
        email: 'children@example.com',
        website: 'https://children-welfare.org',
        fundingRequirement: 800000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Children Welfare Foundation');
    } else {
      // Update existing NGO with correct admin
      ngo2.adminId = ngoAdmins[1]._id;
      await ngo2.save();
      console.log('✅ Updated NGO 2 with correct admin');
    }

    let ngo3 = await NGO.findOne({ registrationNumber: 'REG-003' });
    if (!ngo3) {
      ngo3 = await NGO.create({
        name: 'Food for All Initiative',
        description: 'Fighting hunger by providing nutritious meals to families in need across urban and rural areas.',
        category: 'Food and Basic Needs NGOs',
        adminId: ngoAdmins[2]._id,
        registrationNumber: 'REG-003',
        address: '789 Food Street, Bangalore, Karnataka 560001',
        phone: '9876543212',
        email: 'food@example.com',
        website: 'https://food-for-all.org',
        fundingRequirement: 600000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Food for All Initiative');
    } else {
      console.log('ℹ️  NGO 3 already exists');
    }

    // Create more NGOs
    let ngo4 = await NGO.findOne({ registrationNumber: 'REG-004' });
    if (!ngo4) {
      ngo4 = await NGO.create({
        name: 'Hope for Disabled Foundation',
        description: 'Empowering people with disabilities through rehabilitation, education, and employment opportunities.',
        category: 'Physically Disabled Care NGOs',
        adminId: ngoAdmins[3]._id,
        registrationNumber: 'REG-004',
        address: '321 Hope Avenue, Chennai, Tamil Nadu 600001',
        phone: '9876543213',
        email: 'hope@example.com',
        website: 'https://hope-disabled.org',
        fundingRequirement: 700000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Hope for Disabled Foundation');
    } else {
      console.log('ℹ️  NGO 4 already exists');
    }

    let ngo5 = await NGO.findOne({ registrationNumber: 'REG-005' });
    if (!ngo5) {
      ngo5 = await NGO.create({
        name: 'Golden Years Care Home',
        description: 'Dedicated to providing comprehensive care, medical support, and companionship for elderly residents.',
        category: 'Old Age Homes',
        adminId: ngoAdmins[4]._id,
        registrationNumber: 'REG-005',
        address: '654 Elderly Lane, Pune, Maharashtra 411001',
        phone: '9876543214',
        email: 'golden@example.com',
        website: 'https://golden-years.org',
        fundingRequirement: 550000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Golden Years Care Home');
    } else {
      console.log('ℹ️  NGO 5 already exists');
    }

    let ngo6 = await NGO.findOne({ registrationNumber: 'REG-006' });
    if (!ngo6) {
      ngo6 = await NGO.create({
        name: 'Bright Future Children Society',
        description: 'Nurturing young minds through quality education, nutrition programs, and extracurricular activities.',
        category: 'Children Welfare NGOs',
        adminId: ngoAdmins[5]._id,
        registrationNumber: 'REG-006',
        address: '987 Kids Street, Hyderabad, Telangana 500001',
        phone: '9876543215',
        email: 'bright@example.com',
        website: 'https://bright-future.org',
        fundingRequirement: 900000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Bright Future Children Society');
    } else {
      console.log('ℹ️  NGO 6 already exists');
    }

    let ngo7 = await NGO.findOne({ registrationNumber: 'REG-007' });
    if (!ngo7) {
      ngo7 = await NGO.create({
        name: 'Community Kitchen Network',
        description: 'Operating multiple community kitchens to provide free meals to homeless and underprivileged individuals.',
        category: 'Food and Basic Needs NGOs',
        adminId: ngoAdmins[6]._id,
        registrationNumber: 'REG-007',
        address: '147 Kitchen Road, Kolkata, West Bengal 700001',
        phone: '9876543216',
        email: 'kitchen@example.com',
        website: 'https://community-kitchen.org',
        fundingRequirement: 450000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Community Kitchen Network');
    } else {
      console.log('ℹ️  NGO 7 already exists');
    }

    let ngo8 = await NGO.findOne({ registrationNumber: 'REG-008' });
    if (!ngo8) {
      ngo8 = await NGO.create({
        name: 'Accessibility for All',
        description: 'Promoting accessibility and inclusion for people with physical disabilities through assistive devices and advocacy.',
        category: 'Physically Disabled Care NGOs',
        adminId: ngoAdmins[7]._id,
        registrationNumber: 'REG-008',
        address: '258 Access Road, Ahmedabad, Gujarat 380001',
        phone: '9876543217',
        email: 'access@example.com',
        website: 'https://accessibility-all.org',
        fundingRequirement: 650000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Accessibility for All');
    } else {
      console.log('ℹ️  NGO 8 already exists');
    }

    let ngo9 = await NGO.findOne({ registrationNumber: 'REG-009' });
    if (!ngo9) {
      ngo9 = await NGO.create({
        name: 'Senior Citizens Welfare Association',
        description: 'Comprehensive support for senior citizens including healthcare, recreation, and social engagement programs.',
        category: 'Old Age Homes',
        adminId: ngoAdmins[8]._id,
        registrationNumber: 'REG-009',
        address: '369 Senior Plaza, Jaipur, Rajasthan 302001',
        phone: '9876543218',
        email: 'senior@example.com',
        website: 'https://senior-welfare.org',
        fundingRequirement: 750000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Senior Citizens Welfare Association');
    } else {
      console.log('ℹ️  NGO 9 already exists');
    }

    let ngo10 = await NGO.findOne({ registrationNumber: 'REG-010' });
    if (!ngo10) {
      ngo10 = await NGO.create({
        name: 'Little Stars Orphanage',
        description: 'Providing a loving home, education, and healthcare for orphaned and abandoned children.',
        category: 'Children Welfare NGOs',
        adminId: ngoAdmins[9]._id,
        registrationNumber: 'REG-010',
        address: '741 Stars Avenue, Lucknow, Uttar Pradesh 226001',
        phone: '9876543219',
        email: 'stars@example.com',
        website: 'https://little-stars.org',
        fundingRequirement: 850000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Little Stars Orphanage');
    } else {
      console.log('ℹ️  NGO 10 already exists');
    }

    let ngo11 = await NGO.findOne({ registrationNumber: 'REG-011' });
    if (!ngo11) {
      ngo11 = await NGO.create({
        name: 'Mobility Plus Foundation',
        description: 'Providing wheelchairs, assistive devices, and rehabilitation services for people with physical disabilities.',
        category: 'Physically Disabled Care NGOs',
        adminId: ngoAdmins[10]._id,
        registrationNumber: 'REG-011',
        address: '852 Mobility Street, Surat, Gujarat 395001',
        phone: '9876543220',
        email: 'mobility@example.com',
        website: 'https://mobility-plus.org',
        fundingRequirement: 700000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Mobility Plus Foundation');
    } else {
      console.log('ℹ️  NGO 11 already exists');
    }

    let ngo12 = await NGO.findOne({ registrationNumber: 'REG-012' });
    if (!ngo12) {
      ngo12 = await NGO.create({
        name: 'Sunshine Orphanage',
        description: 'A safe haven for abandoned and underprivileged children providing shelter, education, and emotional support.',
        category: 'Children Welfare NGOs',
        adminId: ngoAdmins[11]._id,
        registrationNumber: 'REG-012',
        address: '963 Hope Lane, Nagpur, Maharashtra 440001',
        phone: '9876543221',
        email: 'sunshine@example.com',
        website: 'https://sunshine-orphanage.org',
        fundingRequirement: 950000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Sunshine Orphanage');
    } else {
      console.log('ℹ️  NGO 12 already exists');
    }

    let ngo13 = await NGO.findOne({ registrationNumber: 'REG-013' });
    if (!ngo13) {
      ngo13 = await NGO.create({
        name: 'Elder Care Excellence',
        description: 'Premium elderly care facility with advanced healthcare, recreational programs, and dignity-focused services.',
        category: 'Old Age Homes',
        adminId: ngoAdmins[12]._id,
        registrationNumber: 'REG-013',
        address: '147 Senior Drive, Indore, Madhya Pradesh 452001',
        phone: '9876543222',
        email: 'eldercare@example.com',
        website: 'https://elder-care-excellence.org',
        fundingRequirement: 800000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Elder Care Excellence');
    } else {
      console.log('ℹ️  NGO 13 already exists');
    }

    let ngo14 = await NGO.findOne({ registrationNumber: 'REG-014' });
    if (!ngo14) {
      ngo14 = await NGO.create({
        name: 'Nutrition Bridge International',
        description: 'Fighting malnutrition and food insecurity by providing balanced meals and nutrition education to vulnerable populations.',
        category: 'Food and Basic Needs NGOs',
        adminId: ngoAdmins[13]._id,
        registrationNumber: 'REG-014',
        address: '258 Nutrition Avenue, Vadodara, Gujarat 390001',
        phone: '9876543223',
        email: 'nutrition@example.com',
        website: 'https://nutrition-bridge.org',
        fundingRequirement: 720000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Nutrition Bridge International');
    } else {
      console.log('ℹ️  NGO 14 already exists');
    }

    let ngo15 = await NGO.findOne({ registrationNumber: 'REG-015' });
    if (!ngo15) {
      ngo15 = await NGO.create({
        name: 'Inclusive Abilities Network',
        description: 'Empowering people with disabilities through skill development, employment training, and social inclusion initiatives.',
        category: 'Physically Disabled Care NGOs',
        adminId: ngoAdmins[14]._id,
        registrationNumber: 'REG-015',
        address: '369 Abilities Road, Ghaziabad, Uttar Pradesh 201001',
        phone: '9876543224',
        email: 'inclusive@example.com',
        website: 'https://inclusive-abilities.org',
        fundingRequirement: 680000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Inclusive Abilities Network');
    } else {
      console.log('ℹ️  NGO 15 already exists');
    }

    // EXTRA NGOS AS PER USER REQUEST
    let ngo16 = await NGO.findOne({ registrationNumber: 'REG-016' });
    if (!ngo16) {
      ngo16 = await NGO.create({
        name: 'Paws & Claws Rescue',
        description: 'Providing shelter, medical care, and adoption services for abandoned and stray animals.',
        category: 'Animal Welfare',
        adminId: ngoAdmins[15]._id,
        registrationNumber: 'REG-016',
        address: '111 Pet Lane, Mumbai, MH 400053',
        phone: '9876543225',
        email: 'rescue@pawsclaws.org',
        website: 'https://pawsclaws.org',
        fundingRequirement: 300000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Paws & Claws Rescue');
    }

    let ngo17 = await NGO.findOne({ registrationNumber: 'REG-017' });
    if (!ngo17) {
      ngo17 = await NGO.create({
        name: 'Unity Children Home',
        description: 'A dedicated home providing holistic care and quality primary education for orphaned children.',
        category: 'Children Welfare NGOs',
        adminId: ngoAdmins[16]._id,
        registrationNumber: 'REG-017',
        address: '222 Unity Path, Bangalore, KA 560034',
        phone: '9876543226',
        email: 'info@unitychildren.org',
        website: 'https://unitychildren.org',
        fundingRequirement: 400000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Unity Children Home');
    }

    let ngo18 = await NGO.findOne({ registrationNumber: 'REG-018' });
    if (!ngo18) {
      ngo18 = await NGO.create({
        name: 'Evergreen Senior Care',
        description: 'Ensuring a dignified and active lifestyle for the elderly through curated social programs and health monitoring.',
        category: 'Old Age Homes',
        adminId: ngoAdmins[17]._id,
        registrationNumber: 'REG-018',
        address: '333 Evergreen Grove, Pune, MH 411007',
        phone: '9876543227',
        email: 'contact@evergreenseniors.org',
        website: 'https://evergreenseniors.org',
        fundingRequirement: 500000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Evergreen Senior Care');
    }

    let ngo19 = await NGO.findOne({ registrationNumber: 'REG-019' });
    if (!ngo19) {
      ngo19 = await NGO.create({
        name: 'Empower Ability Foundation',
        description: 'Specialized training and vocational support for adults with physical disabilities to promote independence.',
        category: 'Physically Disabled Care NGOs',
        adminId: ngoAdmins[18]._id,
        registrationNumber: 'REG-019',
        address: '444 Empower St, Delhi, DL 110012',
        phone: '9876543228',
        email: 'support@empowerability.org',
        website: 'https://empowerability.org',
        fundingRequirement: 600000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Empower Ability Foundation');
    }

    let ngo20 = await NGO.findOne({ registrationNumber: 'REG-020' });
    if (!ngo20) {
      ngo20 = await NGO.create({
        name: 'Hunger Free India Trust',
        description: 'Large scale grain distribution and meal programs reaching the most remote communities.',
        category: 'Food and Basic Needs NGOs',
        adminId: ngoAdmins[19]._id,
        registrationNumber: 'REG-020',
        address: '555 Hunger St, Hyderabad, TS 500081',
        phone: '9876543229',
        email: 'reach@hungerfreeindia.org',
        website: 'https://hungerfreeindia.org',
        fundingRequirement: 700000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Hunger Free India Trust');
    }

    let ngo21 = await NGO.findOne({ registrationNumber: 'REG-021' });
    if (!ngo21) {
      ngo21 = await NGO.create({
        name: 'Mind & Soul Wellness Center',
        description: 'Providing comprehensive support, counseling, and specialized education for mentally challenged individuals and their families.',
        category: 'Mentally Challenged Care NGOs',
        adminId: ngoAdmins[20]._id,
        registrationNumber: 'REG-021',
        address: '666 Harmony Blvd, Mumbai, MH 400001',
        phone: '9876543230',
        email: 'wellness@mindandsoul.org',
        website: 'https://mindandsoulwellness.org',
        fundingRequirement: 850000,
        totalReceived: 0,
        totalUtilized: 0,
        isVerified: true
      });
      console.log('✅ Created NGO: Mind & Soul Wellness Center');
    }

    // 3. Create Wishes
    console.log('\n🎁 Creating wishes...');
    const wishes = [
      {
        ngoId: ngo1._id,
        title: 'Birthday Celebration for Residents',
        description: 'Organize a special birthday celebration with cake, music, and gifts for all residents.',
        occasion: 'Birthday',
        requiredAmount: 20000,
        collectedAmount: 5000,
        status: 'ACTIVE',
        deadline: new Date('2026-02-28')
      },
      {
        ngoId: ngo2._id,
        title: 'School Supplies for Children',
        description: 'Provide notebooks, pens, bags, and uniforms for 50 children.',
        occasion: 'Education',
        requiredAmount: 30000,
        collectedAmount: 12000,
        status: 'ACTIVE',
        deadline: new Date('2026-03-15')
      },
      {
        ngoId: ngo1._id,
        title: 'Medical Equipment for Health Checkups',
        description: 'Purchase blood pressure monitors, glucose meters, and first aid kits.',
        occasion: 'Health',
        requiredAmount: 25000,
        collectedAmount: 25000,
        status: 'FULFILLED',
        deadline: new Date('2026-01-20'),
        fulfilledAt: new Date('2026-01-18')
      },
      {
        ngoId: ngo3._id,
        title: 'Winter Clothing Drive',
        description: 'Distribute winter clothes and blankets to 100 underprivileged families.',
        occasion: 'Winter Relief',
        requiredAmount: 35000,
        collectedAmount: 8000,
        status: 'ACTIVE',
        deadline: new Date('2026-02-10')
      },
      {
        ngoId: ngo2._id,
        title: 'Computer Lab Setup',
        description: 'Set up a computer lab with 20 computers and internet connection for students.',
        occasion: 'Technology',
        requiredAmount: 150000,
        collectedAmount: 45000,
        status: 'ACTIVE',
        deadline: new Date('2026-04-30')
      }
    ];

    for (const wishData of wishes) {
      const existingWish = await Wish.findOne({ title: wishData.title, ngoId: wishData.ngoId });
      if (!existingWish) {
        await Wish.create(wishData);
        console.log(`✅ Created wish: ${wishData.title}`);
      }
    }

    // 4. Create Emergency Funds
    console.log('\n🚨 Creating emergency funds...');
    const emergencyFunds = [
      {
        ngoId: ngo1._id,
        title: 'Medical Emergency for Resident',
        description: 'Urgent funds required for surgery and post-operative care for a senior resident.',
        emergencyType: 'medical',
        requiredAmount: 100000,
        collectedAmount: 25000,
        priority: 'high',
        deadline: new Date('2026-02-15'),
        status: 'ACTIVE'
      },
      {
        ngoId: ngo2._id,
        title: 'Flood Relief for Affected Families',
        description: 'Emergency support for families affected by recent floods - food, shelter, and medical aid.',
        emergencyType: 'disaster_relief',
        requiredAmount: 200000,
        collectedAmount: 75000,
        priority: 'high',
        deadline: new Date('2026-02-20'),
        status: 'ACTIVE'
      },
      {
        ngoId: ngo3._id,
        title: 'Emergency Food Aid',
        description: 'Immediate food supplies for 500 families facing hunger during crisis.',
        emergencyType: 'urgent_need',
        requiredAmount: 50000,
        collectedAmount: 15000,
        priority: 'high',
        deadline: new Date('2026-02-05'),
        status: 'ACTIVE'
      },
      {
        ngoId: ngo1._id,
        title: 'Infrastructure Repair',
        description: 'Emergency repairs to the residential facility roof damaged by recent storms.',
        emergencyType: 'other',
        requiredAmount: 150000,
        collectedAmount: 50000,
        priority: 'medium',
        deadline: new Date('2026-02-25'),
        status: 'ACTIVE'
      }
    ];

    for (const fundData of emergencyFunds) {
      const existingFund = await EmergencyFund.findOne({ title: fundData.title, ngoId: fundData.ngoId });
      if (!existingFund) {
        await EmergencyFund.create(fundData);
        console.log(`✅ Created emergency fund: ${fundData.title}`);
      }
    }

    // 5. Create Adopt-a-Day entries
    console.log('\n📅 Creating adopt-a-day entries...');
    const adoptDays = [
      {
        ngoId: ngo1._id,
        purpose: 'Sponsor Meals for All Residents',
        date: new Date('2026-03-10'),
        requiredAmount: 15000,
        collectedAmount: 3000,
        status: 'AVAILABLE'
      },
      {
        ngoId: ngo2._id,
        purpose: 'Educational Supplies Distribution',
        date: new Date('2026-03-15'),
        requiredAmount: 20000,
        collectedAmount: 8000,
        status: 'AVAILABLE'
      },
      {
        ngoId: ngo3._id,
        purpose: 'Food Distribution Drive',
        date: new Date('2026-02-28'),
        requiredAmount: 25000,
        collectedAmount: 10000,
        status: 'AVAILABLE'
      },
      {
        ngoId: ngo4._id,
        purpose: 'Healthcare Camp Organization',
        date: new Date('2026-03-20'),
        requiredAmount: 30000,
        collectedAmount: 12000,
        status: 'AVAILABLE'
      },
      {
        ngoId: ngo5._id,
        purpose: 'Senior Citizens Recreation Day',
        date: new Date('2026-03-25'),
        requiredAmount: 18000,
        collectedAmount: 5000,
        status: 'AVAILABLE'
      },
      {
        ngoId: ngo6._id,
        purpose: 'Children Sports Event',
        date: new Date('2026-04-01'),
        requiredAmount: 22000,
        collectedAmount: 7000,
        status: 'AVAILABLE'
      }
    ];

    for (const dayData of adoptDays) {
      const existingDay = await AdoptADay.findOne({ ngoId: dayData.ngoId, date: dayData.date });
      if (!existingDay) {
        await AdoptADay.create(dayData);
        console.log(`✅ Created adopt-a-day: ${dayData.purpose}`);
      } else {
        console.log(`ℹ️  Adopt-a-day already exists: ${dayData.purpose}`);
      }
    }

    // 6. Create Gratitude Messages
    console.log('\n💝 Creating gratitude messages...');
    const gratitudes = [
      {
        ngoId: ngo1._id,
        title: 'Thank You to Our Generous Donors',
        message: 'Your generous contributions helped us provide warm meals, medical care, and joy to our residents. We are deeply grateful!',
        relatedType: 'general',
        isPublic: true,
        createdBy: ngoAdmins[0]._id
      },
      {
        ngoId: ngo2._id,
        title: 'Gratitude for School Supplies Donation',
        message: 'Thanks to your support, 50 children received new school supplies. Their smiles are priceless!',
        relatedType: 'wish',
        isPublic: true,
        createdBy: ngoAdmins[1]._id
      },
      {
        ngoId: ngo1._id,
        title: 'Heartfelt Thanks',
        message: 'Your kindness has made a real difference in the lives of our senior residents. Thank you from the bottom of our hearts!',
        relatedType: 'general',
        isPublic: true,
        createdBy: ngoAdmins[0]._id
      },
      {
        ngoId: ngo3._id,
        title: 'Impact of Your Generosity',
        message: 'With your support, we served 500 families this month. Every contribution means hope for someone in need.',
        relatedType: 'general',
        isPublic: true,
        createdBy: ngoAdmins[0]._id
      },
      {
        ngoId: ngo2._id,
        title: 'Education Transformation',
        message: 'Your donation enabled us to set up our computer lab. Now 200 students have access to digital learning!',
        relatedType: 'wish',
        isPublic: true,
        createdBy: ngoAdmins[1]._id
      }
    ];

    for (const gratitudeData of gratitudes) {
      const existingGratitude = await Gratitude.findOne({ title: gratitudeData.title, ngoId: gratitudeData.ngoId });
      if (!existingGratitude) {
        await Gratitude.create(gratitudeData);
        console.log(`✅ Created gratitude: ${gratitudeData.title}`);
      }
    }

    // 7. Create Sample Donations
    console.log('\n💰 Creating sample donations...');
    const donations = [
      {
        donorId: donorUser._id,
        ngoId: ngo1._id,
        amount: 5000,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined // Don't set relatedModel for general donations
      },
      {
        donorId: donorUser._id,
        ngoId: ngo2._id,
        amount: 10000,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo1._id,
        amount: 2000,
        isAnonymous: true,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo3._id,
        amount: 7500,
        isAnonymous: false,
        paymentMethod: 'card',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo4._id,
        amount: 15000,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo5._id,
        amount: 3000,
        isAnonymous: true,
        paymentMethod: 'upi',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo6._id,
        amount: 5500,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo7._id,
        amount: 8000,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo8._id,
        amount: 12000,
        isAnonymous: false,
        paymentMethod: 'card',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo9._id,
        amount: 4000,
        isAnonymous: true,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo10._id,
        amount: 6500,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo11._id,
        amount: 9000,
        isAnonymous: false,
        paymentMethod: 'card',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo12._id,
        amount: 11000,
        isAnonymous: true,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo13._id,
        amount: 7000,
        isAnonymous: false,
        paymentMethod: 'upi',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo14._id,
        amount: 8500,
        isAnonymous: false,
        paymentMethod: 'online',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      },
      {
        donorId: donorUser._id,
        ngoId: ngo15._id,
        amount: 10500,
        isAnonymous: true,
        paymentMethod: 'card',
        status: 'completed',
        donationType: 'general',
        relatedModel: undefined
      }
    ];

    for (const donationData of donations) {
      const existingDonation = await Donation.findOne({
        donorId: donationData.donorId,
        ngoId: donationData.ngoId,
        amount: donationData.amount,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Check if created in last 24 hours
      });
      if (!existingDonation) {
        // Remove relatedModel for general donations to avoid validation error
        const { relatedModel, ...donationToCreate } = donationData;
        await Donation.create(donationToCreate);
        const ngo = await NGO.findById(donationData.ngoId);
        console.log(`✅ Created donation: ₹${donationData.amount} to ${ngo?.name || 'NGO'}`);
      }
    }

    // Update NGO totalReceived for all NGOs
    console.log('\n📊 Updating NGO statistics...');
    const allNGOs = [
      ngo1, ngo2, ngo3, ngo4, ngo5, ngo6, ngo7, ngo8, ngo9, ngo10,
      ngo11, ngo12, ngo13, ngo14, ngo15, ngo16, ngo17, ngo18, ngo19, ngo20, ngo21
    ].filter(n => n);

    for (const ngo of allNGOs) {
      const donations = await Donation.find({ ngoId: ngo._id, status: 'completed' });
      const total = donations.reduce((sum, d) => sum + d.amount, 0);
      await NGO.findByIdAndUpdate(ngo._id, { totalReceived: total });
    }

    console.log(`✅ Updated totals for ${allNGOs.length} NGOs`);

    // Update all existing NGOs with correct admin assignments
    console.log('\n🔧 Updating NGO admin assignments...');
    const ngos = await NGO.find({});
    for (let i = 0; i < ngos.length && i < ngoAdmins.length; i++) {
      ngos[i].adminId = ngoAdmins[i]._id;
      await ngos[i].save();
      console.log(`✅ Updated ${ngos[i].name} with admin ngo${i + 1}@heartbridge.com`);
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Test Accounts Created:');
    console.log('   System Admin: admin@heartbridge.com / admin123');
    console.log('   Donor: donor@heartbridge.com / password123');
    console.log('   Donor 2: donor2@heartbridge.com / password123');
    console.log('   Donor 3: donor3@heartbridge.com / password123');
    console.log('\n🏢 NGO Admin Accounts (all with password: password123):');
    for (let i = 1; i <= 21; i++) {
      console.log(`   NGO ${i}: ngo${i}@heartbridge.com / password123`);
    }
    console.log('\n🎉 Each NGO now has its own unique login account!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();


