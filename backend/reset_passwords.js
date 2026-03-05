const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const accountsToReset = [
            'admin@heartbridge.com',
            'admin22@heartbridge.com',
            'donor@heartbridge.com',
            'ngo1@heartbridge.com',
            'ngo21@heartbridge.com'
        ];

        for (const email of accountsToReset) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = 'password123';
                await user.save();
                console.log(`✅ Reset password for ${email} to 'password123'`);
            } else {
                console.log(`❌ User ${email} not found.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

resetPasswords();
