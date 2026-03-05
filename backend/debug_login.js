const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async (email, pass) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log(`\n--- Testing Login for ${email} ---`);

        // 1. Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        // 2. Log details
        console.log(`Stored Hash: ${user.password}`);
        console.log(`Input Pass: "${pass}" (length: ${pass.length})`);

        // 3. Direct compare
        const match = await bcrypt.compare(pass, user.password);
        console.log(`Direct Bcrypt Match: ${match}`);

        // 4. Reset again just to be sure
        console.log('Forcing reset to "password"...');
        user.password = 'password';
        await user.save();

        const newUser = await User.findOne({ email }).select('+password');
        const newMatch = await bcrypt.compare('password', newUser.password);
        console.log(`Post-Reset Match for "password": ${newMatch}`);
        console.log(`New Stored Hash: ${newUser.password}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

testLogin('admin22@heartbridge.com', 'password');
