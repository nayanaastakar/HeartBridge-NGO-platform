const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function run() {
    await mongoose.connect(MONGO_URI);
    const donations = await Donation.find().populate('donorId', 'name').populate('ngoId', 'name');

    console.log(`Checking ${donations.length} donations...`);
    donations.forEach((d, i) => {
        const dName = d.donorId?.name || 'MISSING_DONOR';
        const nName = d.ngoId?.name || 'MISSING_NGO';
        console.log(`[${i}] Donor: ${dName} | NGO: ${nName}`);
    });
    process.exit(0);
}
run();
