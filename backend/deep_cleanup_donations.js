const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const deepCleanup = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        let totalDeleted = 0;
        const donations = await Donation.find();

        for (const d of donations) {
            let shouldDelete = false;

            // 1. Check if essential IDs are missing
            if (!d.donorId || !d.ngoId) {
                shouldDelete = true;
            } else {
                // 2. Check if linked records actually exist
                const donor = await User.findById(d.donorId);
                const ngo = await NGO.findById(d.ngoId);

                if (!donor || !ngo) {
                    shouldDelete = true;
                } else {
                    // 3. Check for "N/A" or empty names
                    if (!donor.name || donor.name.trim().toUpperCase() === 'N/A' || donor.name.trim() === '') {
                        shouldDelete = true;
                    }
                    if (!ngo.name || ngo.name.trim().toUpperCase() === 'N/A' || ngo.name.trim() === '') {
                        shouldDelete = true;
                    }
                }
            }

            // 4. Check anonymous (redundant but safe)
            if (d.isAnonymous === true) {
                shouldDelete = true;
            }

            if (shouldDelete) {
                await Donation.findByIdAndDelete(d._id);
                totalDeleted++;
            }
        }

        console.log(`FINAL_CLEANUP_REPORT: Deleted ${totalDeleted} invalid/N/A donations.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deepCleanup();
