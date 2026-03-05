const mongoose = require('mongoose');
require('dotenv').config();

const getDonationTotal = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/heartbridge');
        const db = mongoose.connection;

        const donations = await db.collection('donations').find({}).toArray();
        const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const count = donations.length;

        console.log(`TOTAL_DONATION_AMOUNT: ${total}`);
        console.log(`TOTAL_DONATION_COUNT: ${count}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

getDonationTotal();
