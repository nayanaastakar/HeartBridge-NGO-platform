const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const NGO = require('./models/NGO');
require('dotenv').config();

const cleanupDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const john = await User.findOne({ email: 'donor@heartbridge.com' });
        if (!john) {
            console.log('John Donor not found');
            return;
        }

        console.log(`Cleaning up donations for John (${john._id})...`);

        const donations = await Donation.find({ donorId: john._id });
        const seen = new Set();
        const toDelete = [];

        for (const d of donations) {
            // Identifier: ngoId + amount
            const key = `${d.ngoId}_${d.amount}`;
            if (seen.has(key)) {
                toDelete.push(d._id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            const result = await Donation.deleteMany({ _id: { $in: toDelete } });
            console.log(`✅ Deleted ${result.deletedCount} duplicate donations.`);

            // Re-calculate NGO totals
            console.log('Updating NGO totals...');
            const ngos = await NGO.find({});
            for (const ngo of ngos) {
                const ngoDonations = await Donation.find({ ngoId: ngo._id, status: 'completed' });
                const total = ngoDonations.reduce((sum, d) => sum + d.amount, 0);
                await NGO.findByIdAndUpdate(ngo._id, { totalReceived: total });
            }
            console.log('✅ NGO statistics updated.');
        } else {
            console.log('No duplicate donations found for John.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

cleanupDuplicates();
