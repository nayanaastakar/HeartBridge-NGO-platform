const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const usersToReset = [
    'admin22@heartbridge.com',
    'admin4@heartbridge.com',
    'admin@heartbridge.com',
    'ngo1@heartbridge.com',
    'donor@heartbridge.com'
];

async function reset() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    for (const email of usersToReset) {
        const user = await User.findOne({ email });
        if (user) {
            // We set it directly and save, the pre-save hook will hash it
            user.password = 'password123';
            await user.save();
            console.log(`Reset ${email} to "password123"`);

            // Verification check
            const updatedUser = await User.findOne({ email }).select('+password');
            const isMatch = await bcrypt.compare('password123', updatedUser.password);
            console.log(`Verification for ${email}: ${isMatch ? 'PASSED' : 'FAILED'}`);
        } else {
            console.log(`User ${email} not found`);
        }
    }

    await mongoose.disconnect();
}

reset();
