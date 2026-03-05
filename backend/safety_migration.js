const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const protectExistingData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for Migration');

        // Set isVerified: true for EVERY existing user
        const result = await User.updateMany(
            {}, // Target all users
            { $set: { isVerified: true } }
        );

        console.log(`Success! Protected ${result.modifiedCount} existing users. They are now marked as "Verified" and won't be locked out.`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

protectExistingData();
