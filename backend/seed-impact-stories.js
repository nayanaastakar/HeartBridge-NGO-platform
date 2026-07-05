const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ImpactStory = require('./models/ImpactStory');
const NGO = require('./models/NGO');

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

// Impact stories with proper NGO-aligned narratives and contextual images
const impactStories = [
  {
    title: "Rural School Classroom Construction",
    problemStatement: "80 underprivileged children were studying outdoors without proper classroom infrastructure, facing severe weather conditions and lack of educational resources.",
    solutionDescription: "With donor support, we built a complete classroom facility with roof, desks, blackboard, and educational materials. Children now learn in a safe, protected environment.",
    beforePhoto: {
      url: "/uploads/impact-stories/story1-before.png",
      caption: "Before: Children studying outdoors in harsh conditions"
    },
    afterPhoto: {
      url: "/uploads/impact-stories/story1-after.png",
      caption: "After: Complete classroom with proper infrastructure"
    },
    fundingDetails: {
      amountRequired: 250000,
      amountRaised: 250000,
      fundingSource: "donation",
      donorCount: 18,
      donorsInfo: [
        { donorName: "Education First Foundation", donationAmount: 100000 },
        { donorName: "Community Leaders", donationAmount: 150000 }
      ]
    },
    impact: {
      beneficiariesReached: 80,
      beneficiariesCategory: "School children (ages 6-14)",
      servicesProvided: ["Safe classroom", "Learning materials", "Desks and chairs", "Weather protection"],
      implementationTimeline: {
        startDate: new Date('2025-09-01'),
        completionDate: new Date('2025-11-30'),
        durationMonths: 3
      }
    },
    ngoId: null
  },
  {
    title: "Senior Care Center - Medical Equipment & Facilities",
    problemStatement: "120+ elderly residents lacked basic medical equipment, mobility aids, and proper healthcare facilities. Many suffered from mobility issues and health complications.",
    solutionDescription: "We provided hospital beds, wheelchairs, walking aids, medical monitoring devices, and trained caregivers. Elderly residents now have dignified care with comfort and safety.",
    beforePhoto: {
      url: "https://images.unsplash.com/photo-1599832334385-c039c9f0d8d0?w=600&h=400&fit=crop&q=80",
      caption: "Before: Basic facilities for elderly residents"
    },
    afterPhoto: {
      url: "/uploads/impact-stories/story2-after.png",
      caption: "After: Modern medical equipment and care facilities"
    },
    fundingDetails: {
      amountRequired: 350000,
      amountRaised: 350000,
      fundingSource: "donation",
      donorCount: 22,
      donorsInfo: [
        { donorName: "Senior Care Network", donationAmount: 150000 },
        { donorName: "Healthcare Supporters", donationAmount: 200000 }
      ]
    },
    impact: {
      beneficiariesReached: 120,
      beneficiariesCategory: "Elderly residents (60+ years)",
      servicesProvided: ["Medical beds", "Mobility aids", "Healthcare monitoring", "Trained nursing care"],
      implementationTimeline: {
        startDate: new Date('2025-08-15'),
        completionDate: new Date('2025-10-30'),
        durationMonths: 2.5
      }
    },
    ngoId: null
  },
  {
    title: "Safe Water Supply for Rural Community",
    problemStatement: "200+ families in remote village suffered from waterborne diseases due to contaminated water sources. Lack of clean water caused malnutrition and health issues.",
    solutionDescription: "We installed a deep borewell with purification system, water storage tanks, and trained community leaders in maintenance. Now 200 families have safe drinking water daily.",
    beforePhoto: {
      url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop&q=80",
      caption: "Before: Contaminated water sources"
    },
    afterPhoto: {
      url: "https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?w=600&h=400&fit=crop&q=80",
      caption: "After: Clean water purification system installed"
    },
    fundingDetails: {
      amountRequired: 150000,
      amountRaised: 150000,
      fundingSource: "donation",
      donorCount: 25,
      donorsInfo: [
        { donorName: "Water for All Initiative", donationAmount: 100000 },
        { donorName: "Local Supporters", donationAmount: 50000 }
      ]
    },
    impact: {
      beneficiariesReached: 200,
      beneficiariesCategory: "Rural families",
      servicesProvided: ["Clean drinking water", "Purification system", "Storage tanks", "Maintenance training"],
      implementationTimeline: {
        startDate: new Date('2025-08-15'),
        completionDate: new Date('2025-10-30'),
        durationMonths: 2.5
      }
    },
    ngoId: null
  },
  {
    title: "Disability Support Center - Rehabilitation & Training",
    problemStatement: "45 physically disabled individuals lacked access to rehabilitation services and vocational training. Limited mobility and lack of skills prevented economic independence.",
    solutionDescription: "We established a rehabilitation center with therapy equipment, trained physiotherapists, and vocational skills programs. Disabled individuals now have hope for independence.",
    beforePhoto: {
      url: "https://images.unsplash.com/photo-1604881991720-f91415f3cef2?w=600&h=400&fit=crop&q=80",
      caption: "Before: Limited rehabilitation facilities"
    },
    afterPhoto: {
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&q=80",
      caption: "After: Full-equipped rehabilitation center"
    },
    fundingDetails: {
      amountRequired: 400000,
      amountRaised: 400000,
      fundingSource: "donation",
      donorCount: 28,
      donorsInfo: [
        { donorName: "Disability Rights Organization", donationAmount: 200000 },
        { donorName: "Corporate Partners", donationAmount: 200000 }
      ]
    },
    impact: {
      beneficiariesReached: 45,
      beneficiariesCategory: "People with disabilities",
      servicesProvided: ["Physical therapy", "Vocational training", "Rehabilitation equipment", "Skill development"],
      implementationTimeline: {
        startDate: new Date('2025-07-01'),
        completionDate: new Date('2025-11-30'),
        durationMonths: 5
      }
    },
    ngoId: null
  },
  {
    title: "Nutrition Program for Malnourished Children",
    problemStatement: "150 underprivileged children suffered from severe malnutrition and lacked access to nutritious meals. Poor nutrition affected their learning and development.",
    solutionDescription: "We started a daily meal program providing balanced nutrition with vegetables, grains, and protein. Children now receive 2 healthy meals daily plus health checkups.",
    beforePhoto: {
      url: "https://images.unsplash.com/photo-1488535695519-47d5f2cbf8b8?w=600&h=400&fit=crop&q=80",
      caption: "Before: Children with malnutrition concerns"
    },
    afterPhoto: {
      url: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600&h=400&fit=crop&q=80",
      caption: "After: Healthy children receiving nutritious meals"
    },
    fundingDetails: {
      amountRequired: 120000,
      amountRaised: 120000,
      fundingSource: "donation",
      donorCount: 20,
      donorsInfo: [
        { donorName: "Nutrition Alliance", donationAmount: 70000 },
        { donorName: "Food Bank Supporters", donationAmount: 50000 }
      ]
    },
    impact: {
      beneficiariesReached: 150,
      beneficiariesCategory: "Malnourished children",
      servicesProvided: ["Daily nutritious meals", "Health monitoring", "Growth tracking", "Health education"],
      implementationTimeline: {
        startDate: new Date('2025-06-01'),
        completionDate: new Date('2025-12-31'),
        durationMonths: 7
      }
    },
    ngoId: null
  }
];

const seedImpactStories = async () => {
  try {
    console.log('🌱 Starting Impact Stories seeding with proper NGO category alignment...\n');

    // Clear existing stories
    await ImpactStory.deleteMany({});
    console.log('🗑️  Cleared existing impact stories');

    // Get NGOs by category
    const childrenNGOs = await NGO.find({ category: 'Children Welfare NGOs' });
    const elderlyNGOs = await NGO.find({ category: 'Old Age Homes' });
    const foodNGOs = await NGO.find({ category: 'Food and Basic Needs NGOs' });
    const disabilityNGOs = await NGO.find({ category: 'Physically Disabled Care NGOs' });

    console.log(`📊 Found: ${childrenNGOs.length} Children NGOs, ${elderlyNGOs.length} Elderly NGOs, ${foodNGOs.length} Food NGOs, ${disabilityNGOs.length} Disability NGOs\n`);

    // Story 1: School Classroom - assign to Children Welfare NGO
    if (childrenNGOs.length > 0) {
      impactStories[0].ngoId = childrenNGOs[0]._id;
      await ImpactStory.create(impactStories[0]);
      console.log(`✅ Story 1 assigned to Children Welfare NGO: "${impactStories[0].title}"`);
    }

    // Story 2: Senior Care - assign to Old Age Homes NGO
    if (elderlyNGOs.length > 0) {
      impactStories[1].ngoId = elderlyNGOs[0]._id;
      await ImpactStory.create(impactStories[1]);
      console.log(`✅ Story 2 assigned to Old Age Homes NGO: "${impactStories[1].title}"`);
    }

    // Story 3: Water Supply - assign to Food and Basic Needs NGO
    if (foodNGOs.length > 0) {
      impactStories[2].ngoId = foodNGOs[0]._id;
      await ImpactStory.create(impactStories[2]);
      console.log(`✅ Story 3 assigned to Food & Basic Needs NGO: "${impactStories[2].title}"`);
    }

    // Story 4: Disability Support - assign to Disability NGO
    if (disabilityNGOs.length > 0) {
      impactStories[3].ngoId = disabilityNGOs[0]._id;
      await ImpactStory.create(impactStories[3]);
      console.log(`✅ Story 4 assigned to Disability NGO: "${impactStories[3].title}"`);
    }

    // Story 5: Nutrition for Children - assign to Children Welfare NGO
    if (childrenNGOs.length > 1) {
      impactStories[4].ngoId = childrenNGOs[1]._id;
      await ImpactStory.create(impactStories[4]);
      console.log(`✅ Story 5 assigned to Children Welfare NGO: "${impactStories[4].title}"`);
    } else if (childrenNGOs.length > 0) {
      impactStories[4].ngoId = childrenNGOs[0]._id;
      await ImpactStory.create(impactStories[4]);
      console.log(`✅ Story 5 assigned to Children Welfare NGO: "${impactStories[4].title}"`);
    }

    console.log('\n✅ Impact Stories seeding completed successfully with proper NGO alignment!');
    console.log('📸 Each story now has contextually appropriate before/after images matching its NGO category.');
    
    const totalStories = await ImpactStory.countDocuments();
    console.log(`📊 Total stories in database: ${totalStories}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding impact stories:', error);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedImpactStories();
});
