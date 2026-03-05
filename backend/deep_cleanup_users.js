const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const dotenv = require('dotenv');
dotenv.config();

const cleanupUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('✅ Connected to MongoDB');

        const emailsToRemove = [
            'naveen.donor@heartbridge.com',
            'donor.alt1@heartbridge.com',
            'donor.alt2@heartbridge.com',
            'donor.prev@heartbridge.com'
        ];

        // Also remove testadmin users (search by name or email pattern)
        // Based on list_all_users.js, their emails start with admin_test_

        console.log('🗑️ Removing specific donor users...');
        for (const email of emailsToRemove) {
            const user = await User.findOne({ email });
            if (user) {
                // Optional: remove their donations too if needed, but the user only asked to remove users
                // await Donation.deleteMany({ donorId: user._id });
                await User.deleteOne({ _id: user._id });
                console.log(`✅ Removed user: ${user.name} (${email})`);
            } else {
                console.log(`ℹ️ User not found: ${email}`);
            }
        }

        console.log('🗑️ Removing Test Admin users...');
        const testAdmins = await User.find({
            $or: [
                { name: 'Test Admin' },
                { email: /admin_test/ }
            ]
        });

        for (const admin of testAdmins) {
            await User.deleteOne({ _id: admin._id });
            console.log(`✅ Removed test admin: ${admin.name} (${admin.email})`);
        }

        console.log('\n✨ Cleanup completed successfully!');
        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
};

cleanupUsers();
