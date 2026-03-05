const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const result = await User.updateMany(
            {},
            { $set: { isEmailVerified: true } }
        );

        console.log(`✅ Success: Marked ${result.modifiedCount} users as verified.`);

        // Also ensure common passwords for the restored users
        const usersToReset = [
            'rajesh.kumar@example.com',
            'priya.sharma@example.com',
            'amit.patel@example.com',
            'sneha.reddy@example.com',
            'keerthu@gmail.com',
            'hope@gmail.com',
            'keerthana@heartbridge.com',
            'donor@heartbridge.com'
        ];

        for (const email of usersToReset) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = 'password123';
                await user.save();
                console.log(`🔑 Reset ${email} password to "password123"`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

verifyAll();
