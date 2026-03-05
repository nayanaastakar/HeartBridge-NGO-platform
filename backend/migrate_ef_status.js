const mongoose = require('mongoose');
const EmergencyFund = require('./models/EmergencyFund');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await EmergencyFund.updateMany(
            { status: 'active' },
            { $set: { status: 'ACTIVE' } }
        );
        console.log(`Migrated ${result.modifiedCount} funds from 'active' to 'ACTIVE'`);

        const result2 = await EmergencyFund.updateMany(
            { status: 'fulfilled' },
            { $set: { status: 'FULFILLED' } }
        );
        console.log(`Migrated ${result2.modifiedCount} funds from 'fulfilled' to 'FULFILLED'`);

        const result3 = await EmergencyFund.updateMany(
            { status: 'expired' },
            { $set: { status: 'EXPIRED' } }
        );
        console.log(`Migrated ${result3.modifiedCount} funds from 'expired' to 'EXPIRED'`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
