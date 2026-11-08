const mongoose = require('mongoose');

async function seedData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/heartbridge');
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  const ngos = await db.collection('ngos').find({}).toArray();

  const adminUser = users.find(u => u.role === 'system_admin') || users[0];
  const donorUser = users.find(u => u.role === 'donor') || users[1];
  const ngoAdminUser = users.find(u => u.role === 'ngo_admin') || users[2];
  const sampleNgo = ngos[0] || { _id: new mongoose.Types.ObjectId(), name: 'Hope Foundation' };
  const sampleNgo2 = ngos[1] || sampleNgo;

  // 1. Discussions
  console.log('Seeding discussions...');
  await db.collection('discussions').deleteMany({});
  await db.collection('discussions').insertMany([
    {
      title: 'Best practices for organizing flood relief donation drives in 2026',
      content: 'We are setting up flood relief hubs across vulnerable districts. What supply chain and logistics strategies have proven most efficient for medical pack kits and clean water distribution?',
      category: 'General',
      author: {
        _id: ngoAdminUser._id,
        name: ngoAdminUser.name || 'Priya Sharma',
        role: 'ngo_admin'
      },
      tags: ['disaster-relief', 'logistics', 'floods'],
      upvotes: [donorUser._id, adminUser._id],
      comments: [
        {
          _id: new mongoose.Types.ObjectId(),
          content: 'Pre-sorting inventory into color-coded family kits speeds up distribution by 4x. We used this in the recent coastal campaign.',
          author: {
            _id: donorUser._id,
            name: donorUser.name || 'Rahul Verma',
            role: 'donor'
          },
          createdAt: new Date(Date.now() - 3600000 * 24)
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
      title: 'Digital literacy kits for rural primary schools: Volunteer guidelines',
      content: 'Looking for volunteers passionate about STEM education. We have prepared interactive tablets with offline curriculum. Join the discussion to collaborate on scheduling weekend teaching sessions.',
      category: 'Education',
      author: {
        _id: adminUser._id,
        name: 'System Admin',
        role: 'system_admin'
      },
      tags: ['education', 'volunteers', 'stem'],
      upvotes: [donorUser._id],
      comments: [
        {
          _id: new mongoose.Types.ObjectId(),
          content: 'I have experience in Python workshops for kids. Happy to lead the Saturday batches!',
          author: {
            _id: donorUser._id,
            name: donorUser.name || 'Rahul Verma',
            role: 'donor'
          },
          createdAt: new Date(Date.now() - 3600000 * 12)
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 36)
    },
    {
      title: 'Corporate CSR Matching Programs: How NGOs can qualify',
      content: 'A comprehensive guide on documentation requirements, Section 80G verification, and audited financial reporting needed to unlock 1:1 corporate matching funds on HeartBridge.',
      category: 'Funding',
      author: {
        _id: sampleNgo._id,
        name: sampleNgo.name || 'Pratham Care',
        role: 'ngo_admin'
      },
      tags: ['csr', 'grants', 'transparency'],
      upvotes: [adminUser._id, donorUser._id, ngoAdminUser._id],
      comments: [],
      createdAt: new Date(Date.now() - 3600000 * 72)
    },
    {
      title: 'Healthcare camps in urban slums: Sanitation & nutrition checklist',
      content: 'Sharing our validated checklist for maternal nutrition and pediatric checkups. Includes mobile screening equipment requirements and volunteer staff ratios.',
      category: 'Healthcare',
      author: {
        _id: sampleNgo2._id,
        name: sampleNgo2.name || 'Seva Health',
        role: 'ngo_admin'
      },
      tags: ['healthcare', 'nutrition', 'slum-welfare'],
      upvotes: [donorUser._id],
      comments: [],
      createdAt: new Date(Date.now() - 3600000 * 96)
    }
  ]);

  // 2. Volunteers & Tasks
  console.log('Seeding volunteers and tasks...');
  await db.collection('volunteers').deleteMany({});
  await db.collection('volunteertasks').deleteMany({});

  const v1 = await db.collection('volunteers').insertOne({
    userId: donorUser._id,
    name: 'Rahul Verma',
    email: 'donor@heartbridge.com',
    skills: ['Teaching', 'IT/Tech', 'Logistics'],
    languages: ['English', 'Hindi'],
    bio: 'Software engineer and weekend mentor committed to youth skill development and relief operations.',
    city: 'Bangalore',
    state: 'Karnataka',
    availableDays: ['saturday', 'sunday'],
    maxHoursPerWeek: 12,
    emergencyVolunteer: true,
    status: 'active',
    totalHoursLogged: 42,
    tasksCompleted: 8,
    rating: 4.9,
    createdAt: new Date()
  });

  const v2 = await db.collection('volunteers').insertOne({
    userId: adminUser._id,
    name: 'Dr. Priya Desai',
    email: 'priya.desai@heartbridge.com',
    skills: ['Medical', 'Counseling'],
    languages: ['English', 'Marathi'],
    bio: 'Physician volunteering for health camps and disaster medical response.',
    city: 'Mumbai',
    state: 'Maharashtra',
    availableDays: ['sunday'],
    maxHoursPerWeek: 8,
    emergencyVolunteer: true,
    status: 'active',
    totalHoursLogged: 65,
    tasksCompleted: 14,
    rating: 5.0,
    createdAt: new Date()
  });

  const v3 = await db.collection('volunteers').insertOne({
    userId: ngoAdminUser._id,
    name: 'Ananya Sharma',
    email: 'ananya@heartbridge.com',
    skills: ['Fundraising', 'Legal'],
    languages: ['English', 'Hindi', 'Bengali'],
    bio: 'Legal advisor helping low-income families with welfare scheme enrolments.',
    city: 'Kolkata',
    state: 'West Bengal',
    availableDays: ['saturday'],
    maxHoursPerWeek: 6,
    emergencyVolunteer: false,
    status: 'active',
    totalHoursLogged: 28,
    tasksCompleted: 5,
    rating: 4.8,
    createdAt: new Date()
  });

  await db.collection('volunteertasks').insertMany([
    {
      title: 'Weekend Math & Coding Mentor',
      description: 'Teach basic logic, Scratch programming, and foundation math to students from underprivileged communities (Grades 6-8).',
      category: 'education',
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      requiredSkills: ['Teaching', 'IT/Tech'],
      location: 'Bangalore Community Center',
      deadline: new Date(Date.now() + 3600000 * 24 * 14),
      maxVolunteers: 6,
      volunteers: [v1.insertedId],
      status: 'open',
      createdAt: new Date()
    },
    {
      title: 'Emergency Medical Camp Coordinator',
      description: 'Assist doctors with triage registration, crowd navigation, and medicine pack allocation at the free community health camp.',
      category: 'healthcare',
      ngo: sampleNgo2._id,
      ngoId: sampleNgo2._id,
      requiredSkills: ['Medical', 'Logistics'],
      location: 'Mumbai Suburban Clinic',
      deadline: new Date(Date.now() + 3600000 * 24 * 7),
      maxVolunteers: 10,
      volunteers: [v2.insertedId],
      status: 'open',
      createdAt: new Date()
    },
    {
      title: 'Food Relief Logistics & Packaging',
      description: 'Help assemble 500 dry ration and hygiene kits for migrant worker families affected by seasonal displacement.',
      category: 'logistics',
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      requiredSkills: ['Logistics'],
      location: 'Delhi Central Warehouse',
      deadline: new Date(Date.now() + 3600000 * 24 * 5),
      maxVolunteers: 15,
      volunteers: [v1.insertedId, v3.insertedId],
      status: 'in-progress',
      createdAt: new Date()
    },
    {
      title: 'Environmental Tree Plantation & Lake Buffer',
      description: 'Coordinate sapling distributions and plant 1,200 native trees across degraded lakeside zones with local youth clubs.',
      category: 'awareness',
      ngo: sampleNgo2._id,
      ngoId: sampleNgo2._id,
      requiredSkills: ['Other'],
      location: 'Hyderabad Lake Buffer Zone',
      deadline: new Date(Date.now() + 3600000 * 24 * 21),
      maxVolunteers: 25,
      volunteers: [],
      status: 'open',
      createdAt: new Date()
    }
  ]);

  // 3. Beneficiaries (with valid GeoJSON or plain location)
  console.log('Seeding beneficiaries...');
  await db.collection('beneficiaries').deleteMany({});
  await db.collection('assistancecases').deleteMany({});

  const b1 = await db.collection('beneficiaries').insertOne({
    fullName: 'Amina Khatun',
    gender: 'female',
    phone: '+91 91234 56789',
    address: 'Plot 42, Basti No. 3',
    city: 'Kolkata',
    state: 'West Bengal',
    householdSize: 4,
    householdIncome: 'below_5000',
    dependents: 2,
    status: 'active',
    isVerified: true,
    consentGiven: true,
    needs: 'Single mother needing vocational tailoring training and school supply support for two daughters.',
    registeredBy: sampleNgo._id,
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726] // Kolkata [lng, lat]
    },
    createdAt: new Date()
  });

  const b2 = await db.collection('beneficiaries').insertOne({
    fullName: 'Rameshwar Patil',
    gender: 'male',
    phone: '+91 98220 11223',
    address: 'Wadala Slum Sector 4',
    city: 'Mumbai',
    state: 'Maharashtra',
    householdSize: 3,
    householdIncome: '5000_15000',
    dependents: 1,
    status: 'active',
    isVerified: true,
    consentGiven: true,
    needs: 'Chronic cardiac treatment and monthly prescription medicine subsidies following bypass surgery.',
    registeredBy: sampleNgo2._id,
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai [lng, lat]
    },
    createdAt: new Date()
  });

  const b3 = await db.collection('beneficiaries').insertOne({
    fullName: 'Deepak & Sneha (Siblings)',
    gender: 'other',
    phone: '+91 97711 22334',
    address: 'Near Old Railway Gate',
    city: 'Patna',
    state: 'Bihar',
    householdSize: 2,
    householdIncome: 'below_5000',
    dependents: 0,
    status: 'active',
    isVerified: true,
    consentGiven: true,
    needs: 'Orphaned siblings requiring formal boarding school admission and pediatric health checkups.',
    registeredBy: sampleNgo._id,
    location: {
      type: 'Point',
      coordinates: [85.1376, 25.5941] // Patna [lng, lat]
    },
    createdAt: new Date()
  });

  const b4 = await db.collection('beneficiaries').insertOne({
    fullName: 'Lakshmi Narayanan',
    gender: 'female',
    phone: '+91 94440 99887',
    address: 'Fishermen Colony, Ennore',
    city: 'Chennai',
    state: 'Tamil Nadu',
    householdSize: 5,
    householdIncome: '5000_15000',
    dependents: 3,
    status: 'active',
    isVerified: true,
    consentGiven: true,
    needs: 'Micro-loan seed grant for fish drying equipment destroyed during recent cyclones.',
    registeredBy: sampleNgo2._id,
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai [lng, lat]
    },
    createdAt: new Date()
  });

  await db.collection('assistancecases').insertMany([
    {
      caseNumber: 'CASE-2026-001',
      beneficiary: b1.insertedId,
      beneficiaryId: b1.insertedId,
      title: 'Electric Sewing Unit & Garment Vocational Training',
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      category: 'livelihood',
      type: 'livelihood',
      priority: 'high',
      description: 'Provide an electric sewing machine and enroll in a 3-month garment manufacturing guild.',
      estimatedCost: 18500,
      status: 'active',
      assignedTo: adminUser._id,
      createdAt: new Date()
    },
    {
      caseNumber: 'CASE-2026-002',
      beneficiary: b2.insertedId,
      beneficiaryId: b2.insertedId,
      title: 'Chronic Cardiac Therapy & Prescription Subsidies',
      ngo: sampleNgo2._id,
      ngoId: sampleNgo2._id,
      category: 'medical',
      type: 'medical',
      priority: 'critical',
      description: 'Continuous monthly cardiac medication and quarterly cardiologist follow-ups.',
      estimatedCost: 24000,
      status: 'active',
      assignedTo: adminUser._id,
      createdAt: new Date()
    },
    {
      caseNumber: 'CASE-2026-003',
      beneficiary: b3.insertedId,
      beneficiaryId: b3.insertedId,
      title: 'Full Residential Education Sponsorship for Siblings',
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      category: 'education',
      type: 'education',
      priority: 'critical',
      description: 'Full residential schooling grant including uniforms, books, and boarding fees for academic year 2026-27.',
      estimatedCost: 45000,
      status: 'in-progress',
      assignedTo: adminUser._id,
      createdAt: new Date()
    },
    {
      caseNumber: 'CASE-2026-004',
      beneficiary: b4.insertedId,
      beneficiaryId: b4.insertedId,
      title: 'Weather-Proof Fish Drying Racks & Roofing Recovery',
      ngo: sampleNgo2._id,
      ngoId: sampleNgo2._id,
      category: 'shelter',
      type: 'shelter',
      priority: 'medium',
      description: 'Restoration of weather-proof drying racks and tarpaulin roofing for micro-enterprise.',
      estimatedCost: 12000,
      status: 'resolved',
      assignedTo: adminUser._id,
      createdAt: new Date()
    }
  ]);

  // 4. Warehouse Inventory
  console.log('Seeding inventory...');
  await db.collection('inventoryitems').deleteMany({});
  await db.collection('inventorytransactions').deleteMany({});

  const items = await db.collection('inventoryitems').insertMany([
    {
      name: 'High-Energy Emergency Food Rations (Box of 50)',
      category: 'food',
      currentStock: 140,
      quantity: 140,
      unit: 'boxes',
      condition: 'new',
      location: 'Central Humanitarian Depot - Bay A',
      minimumStock: 25,
      minimumStockLevel: 25,
      expiryDate: new Date('2027-12-31'),
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      createdAt: new Date()
    },
    {
      name: 'Pediatric First-Aid & Antibiotic Kits',
      category: 'medicine',
      currentStock: 8,
      quantity: 8,
      unit: 'kits',
      condition: 'new',
      location: 'Emergency Medical Staging Fridge',
      minimumStock: 20,
      minimumStockLevel: 20,
      expiryDate: new Date('2027-06-30'),
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      createdAt: new Date()
    },
    {
      name: 'Heavy-Duty Water Purification Filters (1000L/day)',
      category: 'hygiene',
      currentStock: 28,
      quantity: 28,
      unit: 'units',
      condition: 'new',
      location: 'Warehouse Logistics Shelf C',
      minimumStock: 10,
      minimumStockLevel: 10,
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      createdAt: new Date()
    },
    {
      name: 'Winter Thermal Blankets & Woolen Sets',
      category: 'clothing',
      currentStock: 350,
      quantity: 350,
      unit: 'sets',
      condition: 'new',
      location: 'Cold Weather Relief Staging Zone',
      minimumStock: 50,
      minimumStockLevel: 50,
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      createdAt: new Date()
    },
    {
      name: 'Emergency Solar LED Lanterns & Power Banks',
      category: 'electronics',
      currentStock: 4,
      quantity: 4,
      unit: 'pieces',
      condition: 'good',
      location: 'Tech Depot Section E',
      minimumStock: 15,
      minimumStockLevel: 15,
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      createdAt: new Date()
    }
  ]);

  const itemArray = Object.values(items.insertedIds);
  await db.collection('inventorytransactions').insertMany([
    {
      item: itemArray[0],
      itemId: itemArray[0],
      type: 'stock_in',
      quantity: 150,
      notes: 'Initial consignment delivered from United Food Relief supplier.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3)
    },
    {
      item: itemArray[0],
      itemId: itemArray[0],
      type: 'stock_out',
      quantity: 10,
      notes: 'Dispatched to Flood Relief Base Camp Alpha.',
      recipient: 'Relief Team Alpha',
      createdAt: new Date(Date.now() - 3600000 * 12)
    },
    {
      item: itemArray[1],
      itemId: itemArray[1],
      type: 'stock_out',
      quantity: 12,
      notes: 'Urgent allocation for mobile clinic in flood sector.',
      recipient: 'Dr. Mehta Mobile Unit',
      createdAt: new Date(Date.now() - 3600000 * 6)
    }
  ]);

  // 5. Emergency Incidents
  console.log('Seeding emergency incidents...');
  await db.collection('emergencyincidents').deleteMany({});
  await db.collection('emergencyincidents').insertMany([
    {
      title: 'Brahmaputra Valley Flash Floods & Displacement',
      category: 'flood',
      type: 'flood',
      severity: 'critical',
      description: 'Torrential monsoon rains caused river embankments to breach across 3 districts. Over 15,000 residents displaced into temporary highland shelters with immediate need for potable water and dry ration kits.',
      affectedArea: 'Guwahati & Morigaon Districts',
      state: 'Assam',
      location: {
        address: 'Brahmaputra Embankment Sector 9',
        city: 'Guwahati',
        state: 'Assam',
        country: 'India'
      },
      estimatedAffected: 15400,
      affectedPeople: 15400,
      resourcesNeeded: 'Potable water tankers, emergency medical packs, temporary shelter tarpaulins, infant nutrition.',
      contactPerson: 'Col. Rajesh Baruah (Retd.)',
      contactPhone: '+91 98540 12345',
      status: 'active',
      reportedBy: adminUser._id,
      updates: [
        {
          message: 'First delivery of 300 water filtration packs and dry rations successfully distributed at Relief Camp 4.',
          timestamp: new Date(Date.now() - 3600000 * 18),
          author: adminUser._id
        },
        {
          message: 'Medical teams report high incidence of waterborne fevers; prioritizing sterile medical kits dispatch.',
          timestamp: new Date(Date.now() - 3600000 * 6),
          author: adminUser._id
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
      title: 'Severe Cyclone Yaas Aftermath & Coastal Inundation',
      category: 'other',
      type: 'other',
      severity: 'high',
      description: 'High storm surge damaged saline embankments, flooding agricultural fields and contaminating ground wells. 8 coastal fishing hamlets cut off from mainland transit.',
      affectedArea: 'Puri Coastal Belt',
      state: 'Odisha',
      location: {
        address: 'Coastal Sector B',
        city: 'Puri',
        state: 'Odisha',
        country: 'India'
      },
      estimatedAffected: 8200,
      affectedPeople: 8200,
      resourcesNeeded: 'Inflatable rescue boats, dry rations, solar lanterns, antiseptic solutions.',
      contactPerson: 'Sasmita Jena',
      contactPhone: '+91 94370 54321',
      status: 'active',
      reportedBy: adminUser._id,
      updates: [
        {
          message: 'Road clearance operations 60% complete. Two satellite kitchens opened for community meals.',
          timestamp: new Date(Date.now() - 3600000 * 14),
          author: adminUser._id
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 72)
    },
    {
      title: 'Urban Slum Fires in Industrial Sector',
      category: 'fire',
      type: 'fire',
      severity: 'medium',
      description: 'Accidental transformer blaze gutted 75 temporary shanties. Residents relocated to municipal school auditorium.',
      affectedArea: 'Sector 18 Slum Area',
      state: 'Haryana',
      location: {
        address: 'Industrial Area Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India'
      },
      estimatedAffected: 320,
      affectedPeople: 320,
      resourcesNeeded: 'Clothing, blankets, kitchen utensils, school supply replacements.',
      contactPerson: 'Devender Kumar',
      contactPhone: '+91 98110 33445',
      status: 'contained',
      reportedBy: adminUser._id,
      updates: [
        {
          message: 'Community donation center collected 1,000 clothing items. Basic sanitation facilities restored.',
          timestamp: new Date(Date.now() - 3600000 * 8),
          author: adminUser._id
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 30)
    },
    {
      title: 'Drought & Agricultural Water Crisis in Marathwada',
      category: 'drought',
      type: 'drought',
      severity: 'high',
      description: 'Groundwater tables dropped past 400 feet following consecutive failed monsoons. Deep tanker delivery required for 12 farming villages.',
      affectedArea: 'Beed-Jalna Rural Corridor',
      state: 'Maharashtra',
      location: {
        address: 'Beed-Jalna Rural Corridor',
        city: 'Jalna',
        state: 'Maharashtra',
        country: 'India'
      },
      estimatedAffected: 22000,
      affectedPeople: 22000,
      resourcesNeeded: 'Water tankers, cattle fodder camps, drip irrigation seed subsidies.',
      contactPerson: 'Arun Deshmukh',
      contactPhone: '+91 98230 77889',
      status: 'active',
      reportedBy: adminUser._id,
      updates: [],
      createdAt: new Date(Date.now() - 3600000 * 120)
    }
  ]);

  // 6. Corporate CSR & Grants
  console.log('Seeding corporate CSR and grants...');
  await db.collection('corporates').deleteMany({});
  await db.collection('grants').deleteMany({});
  await db.collection('grantapplications').deleteMany({});

  const corp1 = await db.collection('corporates').insertOne({
    name: 'Tata Consultancy Services CSR Foundation',
    companyName: 'Tata Consultancy Services CSR Foundation',
    registrationNumber: 'CSR-TCS-2024-88',
    industry: 'Technology',
    website: 'https://www.tcs.com/csr',
    annualCsrBudget: 45000000,
    csrBudget: 45000000,
    phone: '+91 22 6778 9999',
    email: 'csr@tcs.com',
    contactPerson: 'Ananya Sengupta',
    description: 'Empowering marginalized youth through digital literacy, STEM education infrastructure, and sustainable livelihood programs across India.',
    adminUser: adminUser._id,
    userId: adminUser._id,
    status: 'verified',
    createdAt: new Date()
  });

  const corp2 = await db.collection('corporates').insertOne({
    name: 'Infosys Foundation Social Impact Trust',
    companyName: 'Infosys Foundation Social Impact Trust',
    registrationNumber: 'CSR-INFY-2023-14',
    industry: 'Education',
    website: 'https://www.infosys.org',
    annualCsrBudget: 35000000,
    csrBudget: 35000000,
    phone: '+91 80 2852 0261',
    email: 'csr@infosys.com',
    contactPerson: 'Kishore Nambiar',
    description: 'Supporting healthcare accessibility in remote areas, rural community libraries, and women entrepreneurship.',
    adminUser: adminUser._id,
    userId: adminUser._id,
    status: 'verified',
    createdAt: new Date()
  });

  const grant1 = await db.collection('grants').insertOne({
    corporate: corp1.insertedId,
    corporateId: corp1.insertedId,
    title: 'STEM & Robotics Lab Grant for Rural High Schools',
    description: 'Funding equipment, internet connectivity, and teacher training to set up 50 modern STEM learning centers in government high schools.',
    totalFunding: 5000000,
    totalAmount: 5000000,
    focusAreas: ['Education', 'Technology'],
    eligibleSectors: ['Education', 'Technology'],
    applicationDeadline: new Date(Date.now() + 3600000 * 24 * 45),
    deadline: new Date(Date.now() + 3600000 * 24 * 45),
    maxApplications: 20,
    maxApplicants: 20,
    eligibilityCriteria: 'Registered Section 8 / 12A / 80G NGO with at least 3 years demonstrated experience in primary/secondary school partnerships.',
    status: 'open',
    createdAt: new Date()
  });

  const grant2 = await db.collection('grants').insertOne({
    corporate: corp2.insertedId,
    corporateId: corp2.insertedId,
    title: 'Mobile Healthcare Clinic & Pediatric Screening Initiative',
    description: 'Capital expenditure grant for customized mobile medical vans equipped with ultrasound, diagnostic blood labs, and maternal care gear.',
    totalFunding: 7500000,
    totalAmount: 7500000,
    focusAreas: ['Healthcare'],
    eligibleSectors: ['Healthcare'],
    applicationDeadline: new Date(Date.now() + 3600000 * 24 * 30),
    deadline: new Date(Date.now() + 3600000 * 24 * 30),
    maxApplications: 15,
    maxApplicants: 15,
    eligibilityCriteria: 'Healthcare non-profit with licensed medical practitioners and verified ambulance dispatch track record.',
    status: 'open',
    createdAt: new Date()
  });

  const grant3 = await db.collection('grants').insertOne({
    corporate: corp1.insertedId,
    corporateId: corp1.insertedId,
    title: 'Rainwater Harvesting & Lake Rejuvenation Program',
    description: 'Restoration of historical water bodies, desilting of community step-wells, and percolation pit construction in arid districts.',
    totalFunding: 3500000,
    totalAmount: 3500000,
    focusAreas: ['Environment', 'Rural Development'],
    eligibleSectors: ['Environment', 'Rural Development'],
    applicationDeadline: new Date(Date.now() + 3600000 * 24 * 60),
    deadline: new Date(Date.now() + 3600000 * 24 * 60),
    maxApplications: 10,
    maxApplicants: 10,
    eligibilityCriteria: 'Environmental organization with civil hydrological engineering capabilities.',
    status: 'open',
    createdAt: new Date()
  });

  await db.collection('grantapplications').insertMany([
    {
      grant: grant1.insertedId,
      grantId: grant1.insertedId,
      ngo: sampleNgo._id,
      ngoId: sampleNgo._id,
      projectTitle: 'Digital Smart Classrooms for 12 Tribal Schools in Wayanad',
      proposalTitle: 'Digital Smart Classrooms for 12 Tribal Schools in Wayanad',
      projectDescription: 'Comprehensive deployment of solar-powered Raspberry Pi computer labs with localized interactive science curriculum.',
      proposalDescription: 'Comprehensive deployment of solar-powered Raspberry Pi computer labs with localized interactive science curriculum.',
      requestedAmount: 1800000,
      expectedOutcomes: 'Directly impacts 3,400 tribal students by introducing computer literacy and coding fundamentals.',
      expectedImpact: 'Directly impacts 3,400 tribal students by introducing computer literacy and coding fundamentals.',
      projectDurationMonths: 8,
      timeline: '8 months',
      status: 'approved',
      appliedAt: new Date(Date.now() - 3600000 * 24 * 5)
    },
    {
      grant: grant2.insertedId,
      grantId: grant2.insertedId,
      ngo: sampleNgo2._id,
      ngoId: sampleNgo2._id,
      projectTitle: 'Rural Mother & Child Mobile Diagnostics Ambulance',
      proposalTitle: 'Rural Mother & Child Mobile Diagnostics Ambulance',
      projectDescription: 'Procurement and outfitting of an all-terrain medical van to serve 24 remote villages across the western ghats.',
      proposalDescription: 'Procurement and outfitting of an all-terrain medical van to serve 24 remote villages across the western ghats.',
      requestedAmount: 2500000,
      expectedOutcomes: 'Early detection of maternal anemia, malnutrition, and congenital health defects in over 5,000 infants annually.',
      expectedImpact: 'Early detection of maternal anemia, malnutrition, and congenital health defects in over 5,000 infants annually.',
      projectDurationMonths: 12,
      timeline: '12 months',
      status: 'under_review',
      appliedAt: new Date(Date.now() - 3600000 * 24 * 2)
    }
  ]);

  // 7. Wishes
  console.log('Seeding wishes...');
  await db.collection('wishes').deleteMany({});
  await db.collection('wishes').insertMany([
    {
      ngoId: sampleNgo._id,
      title: 'Winter Warmth: 200 Sweaters for Slum School Children',
      description: 'With temperatures dropping, over 200 primary school students attend morning classes without adequate warm clothing.',
      category: 'Clothing',
      targetAmount: 50000,
      collectedAmount: 37500,
      urgency: 'high',
      isFulfilled: false,
      donorCount: 18,
      createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
      ngoId: sampleNgo2._id,
      title: 'Braille Textbooks & Audio Players for Blind Students',
      description: 'Provide 35 visually impaired high school students with specialized tactile textbooks and digital talking books for state board exams.',
      category: 'Education',
      targetAmount: 75000,
      collectedAmount: 62000,
      urgency: 'critical',
      isFulfilled: false,
      donorCount: 29,
      createdAt: new Date(Date.now() - 3600000 * 96)
    },
    {
      ngoId: sampleNgo._id,
      title: 'Emergency Dialysis Sessions for Mr. Harish Chandra',
      description: 'Cover 12 life-saving hemodialysis cycles for a 45-year-old auto driver awaiting kidney donor matching.',
      category: 'Medical',
      targetAmount: 36000,
      collectedAmount: 28000,
      urgency: 'critical',
      isFulfilled: false,
      donorCount: 14,
      createdAt: new Date(Date.now() - 3600000 * 24)
    },
    {
      ngoId: sampleNgo2._id,
      title: 'Solar Inverter for Animal Shelter Veterinary Clinic',
      description: 'Frequent load shedding in rural outskirts disrupts emergency surgeries for rescued street animals. Need 3kVA solar backup.',
      category: 'Equipment',
      targetAmount: 85000,
      collectedAmount: 42000,
      urgency: 'medium',
      isFulfilled: false,
      donorCount: 21,
      createdAt: new Date(Date.now() - 3600000 * 120)
    }
  ]);

  console.log('SUCCESS! All modules populated with 4+ rich records each.');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
