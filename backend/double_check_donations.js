const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const doubleCheckDonations = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const donations = await Donation.find();
        let deletedCount = 0;

        for (const d of donations) {
            if (!d.donorId || !d.ngoId) {
                await Donation.findByIdAndDelete(d._id);
                deletedCount++;
                continue;
            }

            const donor = await User.findById(d.donorId);
            const ngo = await NGO.findById(d.ngoId);

            if (!donor || !ngo) {
                await Donation.findByIdAndDelete(d._id);
                deletedCount++;
            }
        }

        console.log(`CLEANUP_DONE: Removed ${deletedCount} additional problematic donations.`);
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};
doubleCheckDonations();
