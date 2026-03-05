const mongoose = require('mongoose');
const Wish = require('./models/Wish');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function addAnotherSummerWish() {
    try {
        await mongoose.connect(MONGO_URI);
        const ngoId = '6992a5014f95243123c68e20'; // Children Welfare Foundation

        const personalSummerWish = {
            ngoId: ngoId,
            title: 'Summer Coding Camp for Amit',
            description: 'Amit has shown great interest in computers. This summer, we want to sponsor him for a 4-week coding workshop that will build his technical skills and keep him engaged during the break.',
            occasion: 'Personal Development/Summer',
            requiredAmount: 4500,
            collectedAmount: 0,
            status: 'ACTIVE',
            deadline: new Date('2026-04-10')
        };

        const existingWish = await Wish.findOne({ title: personalSummerWish.title, ngoId: personalSummerWish.ngoId });
        if (!existingWish) {
            await Wish.create(personalSummerWish);
            console.log(`✅ Created personal summer wish: ${personalSummerWish.title}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addAnotherSummerWish();
