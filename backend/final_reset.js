const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async (email, newPass) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log(`Connected to MongoDB. Resetting ${email}...`);

        const user = await User.findOne({ email });
        if (user) {
            user.password = newPass;
            await user.save();
            console.log(`✅ Success: Reset ${email} to "${newPass}"`);

            // Verify
            const verifyUser = await User.findOne({ email }).select('+password');
            const isMatch = await bcrypt.compare(newPass, verifyUser.password);
            console.log(`🔒 Verification check: ${isMatch ? 'MATCH' : 'FAIL'}`);
        } else {
            console.log(`❌ Error: User ${email} not found.`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

const run = async () => {
    await resetPassword('admin22@heartbridge.com', 'pass123');
    await resetPassword('donor@heartbridge.com', 'pass123');
    await resetPassword('ngo1@heartbridge.com', 'pass123');
};

run();
