const mongoose = require('mongoose');
const EmergencyFund = require('./models/EmergencyFund');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function testUpdate() {
    try {
        await mongoose.connect(MONGO_URI);
        const fund = await EmergencyFund.findOne({ status: 'active' });
        if (!fund) {
            console.log('No active fund found');
            process.exit(0);
        }

        console.log('Found fund:', fund.title, 'with status:', fund.status);

        // Try to update with 'active'
        fund.status = 'active';
        await fund.save();
        console.log('Saved with active (lowercase) successfully');

        // Try to update with 'ACTIVE'
        try {
            fund.status = 'ACTIVE';
            await fund.save();
            console.log('Saved with ACTIVE (uppercase) successfully');
        } catch (err) {
            console.log('Failed to save with ACTIVE (uppercase):', err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testUpdate();
