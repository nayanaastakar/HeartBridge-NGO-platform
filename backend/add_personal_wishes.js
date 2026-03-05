const mongoose = require('mongoose');
const Wish = require('./models/Wish');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function addWishes() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const ngoId = '6992a5014f95243123c68e20'; // Children Welfare Foundation

    const personalWishes = [
        {
            ngoId: ngoId,
            title: 'A New Bicycle for Amit',
            description: 'Amit is a hardworking 12-year-old who walks 5km to school every day. A bicycle would save him time and keep him motivated for his studies.',
            occasion: 'Personal Need/Education',
            requiredAmount: 5500,
            collectedAmount: 0,
            status: 'ACTIVE',
            deadline: new Date('2026-05-15')
        },
        {
            ngoId: ngoId,
            title: 'Hearing Aid for Priya',
            description: 'Priya is a bright 8-year-old who has struggled in school due to significant hearing loss. A new hearing aid will help her participate fully in class.',
            occasion: 'Health & Wellness',
            requiredAmount: 18000,
            collectedAmount: 0,
            status: 'ACTIVE',
            deadline: new Date('2026-06-01')
        },
        {
            ngoId: ngoId,
            title: 'Advanced Nursing Books for Sunita',
            description: 'Sunita has recently gained admission to a nursing college. These books will provide her the essential knowledge to excel in her training.',
            occasion: 'Higher Education',
            requiredAmount: 7500,
            collectedAmount: 0,
            status: 'ACTIVE',
            deadline: new Date('2026-04-20')
        }
    ];

    const ngoCommonWish = {
        ngoId: ngoId,
        title: 'Safe Playground Equipment for the Children Home',
        description: 'We wish to replace our old, rusty playground equipment with safe, modern swings and slides to give our children a joyful and safe place to play.',
        occasion: 'NGO Infrastructure/Facility Improvement',
        requiredAmount: 85000,
        collectedAmount: 0,
        status: 'ACTIVE',
        deadline: new Date('2026-07-30')
    };

    const allWishes = [...personalWishes, ngoCommonWish];

    for (const wishData of allWishes) {
        const existingWish = await Wish.findOne({ title: wishData.title, ngoId: wishData.ngoId });
        if (!existingWish) {
            await Wish.create(wishData);
            console.log(`✅ Created wish: ${wishData.title}`);
        } else {
            console.log(`ℹ️ Wish already exists: ${wishData.title}`);
        }
    }

    console.log('✨ All wishes added successfully!');
    process.exit(0);
}

addWishes().catch(err => {
    console.error('❌ Error adding wishes:', err);
    process.exit(1);
});
