const mongoose = require('mongoose');
const Wish = require('./models/Wish');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function addOneMoreWish() {
    await mongoose.connect(MONGO_URI);
    const ngoId = '6992a5014f95243123c68e20'; // Children Welfare Foundation

    const additionalWish = {
        ngoId: ngoId,
        title: 'New Sports Shoes for Karan',
        description: 'Karan is a talented sprinter who has been running barefoot. A good pair of sports shoes will help him compete safely and pursue his athletic dreams.',
        occasion: 'Personal Need/Sports',
        requiredAmount: 3200,
        collectedAmount: 0,
        status: 'ACTIVE',
        deadline: new Date('2026-05-10')
    };

    const existingWish = await Wish.findOne({ title: additionalWish.title, ngoId: additionalWish.ngoId });
    if (!existingWish) {
        await Wish.create(additionalWish);
        console.log(`✅ Created wish: ${additionalWish.title}`);
    }

    process.exit(0);
}

addOneMoreWish().catch(console.error);
