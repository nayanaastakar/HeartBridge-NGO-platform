const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyExisting = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Update all users who don't have isEmailVerified set to true
        const result = await User.updateMany(
            { isEmailVerified: { $ne: true } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`Success! Marked ${result.modifiedCount} existing users as verified.`);
        console.log('You can now log in with your old fake email IDs without any issues.');

        process.exit(0);
    } catch (error) {
        console.error('Error migrating users:', error);
        process.exit(1);
    }
};

verifyExisting();
