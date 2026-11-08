const mongoose = require('mongoose');

async function updateWishes() {
  await mongoose.connect('mongodb://127.0.0.1:27017/heartbridge');
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const ngos = await db.collection('ngos').find({}).toArray();

  const oldAgeNgo = ngos.find(n => n.name.includes('Old Age')) || ngos[0];
  const childrenNgo = ngos.find(n => n.name.includes('Children')) || ngos[1];
  const foodNgo = ngos.find(n => n.name.includes('Food')) || ngos[2];
  const disabledNgo = ngos.find(n => n.name.includes('Disabled')) || ngos[3];

  await db.collection('wishes').deleteMany({});

  const futureDeadline1 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const futureDeadline2 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  const futureDeadline3 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const futureDeadline4 = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000);
  const futureDeadline5 = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
  const futureDeadline6 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const wishes = [
    {
      ngoId: childrenNgo._id,
      title: 'Winter Warmth: 200 Sweaters for Slum School Children',
      description: 'With temperatures dropping, over 200 primary school children in urban slums attend morning classes without adequate winter clothing. Help us provide insulated woolen sweaters and warm caps.',
      occasion: 'Winter Relief Drive',
      requiredAmount: 50000,
      collectedAmount: 37500,
      deadline: futureDeadline1,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      ngoId: disabledNgo._id,
      title: 'Braille Textbooks & Audio Players for Blind Students',
      description: 'Provide 35 visually impaired high school students with specialized tactile textbooks and portable audio talking books to prepare for their upcoming state board examinations.',
      occasion: 'World Braille Celebration',
      requiredAmount: 75000,
      collectedAmount: 52000,
      deadline: futureDeadline2,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      ngoId: foodNgo._id,
      title: 'Emergency Dialysis Sessions for Amit Kumar',
      description: 'Cover 12 vital hemodialysis cycles for Amit, a 42-year-old auto driver and sole earner of his family, awaiting a kidney donor match at the city municipal hospital.',
      occasion: 'Personal Critical Need',
      requiredAmount: 36000,
      collectedAmount: 26000,
      deadline: futureDeadline3,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      ngoId: oldAgeNgo._id,
      title: 'Solar Inverter for Senior Care Facility & Clinic',
      description: 'Frequent power outages disrupt oxygen concentrators and night care for 45 elderly residents. We need a 5kVA hybrid solar inverter and battery bank to ensure uninterrupted medical care.',
      occasion: 'NGO Common Facility Upgrade',
      requiredAmount: 85000,
      collectedAmount: 48000,
      deadline: futureDeadline4,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    // New Wish 1
    {
      ngoId: childrenNgo._id,
      title: 'Nutrition & Fortified Milk Kits for 50 Malnourished Toddlers',
      description: 'Provide comprehensive 60-day pediatric nutrition kits with micronutrient powder, clean formula milk, and high-protein porridge for children recovering from acute malnutrition.',
      occasion: 'Child Nutrition Week',
      requiredAmount: 42000,
      collectedAmount: 18500,
      deadline: futureDeadline5,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    // New Wish 2
    {
      ngoId: oldAgeNgo._id,
      title: 'Wheelchairs & Lightweight Mobility Walkers for Senior Residents',
      description: 'Gift freedom of movement to 15 frail residents living with severe arthritis and paraplegia through ergonomic foldable wheelchairs and adjustable walking frames.',
      occasion: 'International Elders Day',
      requiredAmount: 60000,
      collectedAmount: 32000,
      deadline: futureDeadline6,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  ];

  const result = await db.collection('wishes').insertMany(wishes);
  console.log(`Successfully seeded ${result.insertedCount} active wishes in Wish Box!`);
  process.exit(0);
}

updateWishes().catch(err => {
  console.error('Error seeding wishes:', err);
  process.exit(1);
});
