const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function run() {
    await mongoose.connect(MONGO_URI);
    const donations = await Donation.find();
    console.log('Total donations found:', donations.length);

    let naCount = 0;
    for (const d of donations) {
        const donor = await User.findById(d.donorId);
        const ngo = await NGO.findById(d.ngoId);

        if (!donor || !ngo || donor.name === 'N/A' || ngo.name === 'N/A' || d.isAnonymous === true) {
            naCount++;
        }
    }
    console.log('N/A or Anonymous donations found:', naCount);
    process.exit(0);
}
run().catch(err => {
    console.error(err);
    process.exit(1);
});
