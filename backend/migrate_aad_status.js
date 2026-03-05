const mongoose = require('mongoose');
const AdoptADay = require('./models/AdoptADay');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await AdoptADay.updateMany(
            { status: 'available' },
            { $set: { status: 'AVAILABLE' } }
        );
        console.log(`Migrated ${result.modifiedCount} days from 'available' to 'AVAILABLE'`);

        const result2 = await AdoptADay.updateMany(
            { status: 'adopted' },
            { $set: { status: 'ADOPTED' } }
        );
        console.log(`Migrated ${result2.modifiedCount} days from 'adopted' to 'ADOPTED'`);

        const result3 = await AdoptADay.updateMany(
            { status: 'fulfilled' },
            { $set: { status: 'FULFILLED' } }
        );
        console.log(`Migrated ${result3.modifiedCount} days from 'fulfilled' to 'FULFILLED'`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
