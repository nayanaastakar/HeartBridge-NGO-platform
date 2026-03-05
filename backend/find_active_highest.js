const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const findActiveHighest = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        // Get all donations sorted by amount
        const donations = await Donation.find().sort({ amount: -1 });

        for (const d of donations) {
            const user = await User.findById(d.donorId);
            if (user) {
                console.log('--- HIGHEST ACTIVE TRANSACTION ---');
                console.log(`Amount: ₹${d.amount}`);
                console.log(`Donor: ${user.name}`);
                console.log(`Date: ${d.createdAt}`);
                process.exit(0);
            }
        }

        console.log('No active donor records found for any transactions.');
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

findActiveHighest();
