const mongoose = require('mongoose');
const EmergencyFund = require('./models/EmergencyFund');
require('dotenv').config();

const fixStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('✅ Connected to MongoDB');

        const result = await EmergencyFund.updateMany(
            { status: 'active' },
            { $set: { status: 'ACTIVE' } }
        );

        console.log(`✅ Fixed ${result.modifiedCount} emergency funds with lowercase "active" status.`);

        // Also check for 'FULFILLED' vs 'fulfilled' if any
        const fulfilledResult = await EmergencyFund.updateMany(
            { status: 'fulfilled' },
            { $set: { status: 'FULFILLED' } }
        );
        console.log(`✅ Fixed ${fulfilledResult.modifiedCount} emergency funds with lowercase "fulfilled" status.`);

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error during fix:', err);
        process.exit(1);
    }
};

fixStatus();
