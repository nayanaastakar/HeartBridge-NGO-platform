const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const email = 'admin22@heartbridge.com';
        console.log(`Searching for user: ${email}`);
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.name} (${user.role})`);
            user.password = 'password123';
            console.log('Saving user with new password...');
            await user.save();
            console.log(`✅ Reset password for ${email} to 'password123'`);

            const verifyUser = await User.findOne({ email }).select('+password');
            const isMatch = await bcrypt.compare('password123', verifyUser.password);
            console.log(`Verification check: ${isMatch ? 'MATCH' : 'FAIL'}`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }

    } catch (error) {
        console.error('❌ ERROR OCCURRED:', error.message);
        console.error(error.stack);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
    }
};

resetAdmin().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
