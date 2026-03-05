const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const findHighestDonation = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        // Find highest amount, populate donor and NGO names for context
        const highestDonation = await Donation.findOne()
            .sort({ amount: -1 })
            .populate('donorId', 'name email')
            .populate('ngoId', 'name');

        if (highestDonation) {
            console.log('--- HIGHEST TRANSACTION DATA ---');
            console.log(`Amount: ₹${highestDonation.amount}`);
            console.log(`Donor: ${highestDonation.donorId?.name || 'Unknown'} (${highestDonation.donorId?.email || 'N/A'})`);
            console.log(`NGO: ${highestDonation.ngoId?.name || 'Unknown'}`);
            console.log(`Type: ${highestDonation.donationType}`);
            console.log(`Date: ${highestDonation.createdAt}`);
            console.log('-------------------------------');
        } else {
            console.log('No donations found in the database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error finding highest donation:', error);
        process.exit(1);
    }
};

findHighestDonation();
