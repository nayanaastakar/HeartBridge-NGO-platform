const mongoose = require('mongoose');
const Donation = require('./models/Donation');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const inspectHighest = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const highest = await Donation.findOne().sort({ amount: -1 });
        if (highest) {
            console.log('Highest Donation Record:');
            console.log(JSON.stringify(highest, null, 2));
        }
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};
inspectHighest();
