const mongoose = require('mongoose');
const Wish = require('./models/Wish');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function addSummerWish() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const ngoId = '6992a5014f95243123c68e20'; // Children Welfare Foundation

        const summerWish = {
            ngoId: ngoId,
            title: 'Summer Cooling: Infrastructure Upgrade for Kids',
            description: 'To combat the rising summer heat, we are requesting two high-capacity air coolers for the Children Home study hall. This will provide a comfortable environment for 50+ children to study and play despite the heatwave.',
            occasion: 'Infrastructure/Summer Support',
            requiredAmount: 18500,
            collectedAmount: 0,
            status: 'ACTIVE',
            deadline: new Date('2026-04-30')
        };

        const existingWish = await Wish.findOne({ title: summerWish.title, ngoId: summerWish.ngoId });
        if (!existingWish) {
            await Wish.create(summerWish);
            console.log(`✅ Created summer wish: ${summerWish.title}`);
        } else {
            console.log(`ℹ️ Summer wish already exists: ${summerWish.title}`);
        }

        console.log('✨ Operation complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

addSummerWish();
