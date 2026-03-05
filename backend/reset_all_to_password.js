const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async (email, newPass) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        const user = await User.findOne({ email });
        if (user) {
            user.password = newPass;
            await user.save();
            console.log(`✅ ${email} -> ${newPass}`);
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

const run = async () => {
    const list = [
        'admin@heartbridge.com',
        'admin22@heartbridge.com',
        'admin4@heartbridge.com',
        'donor@heartbridge.com',
        'ngo1@heartbridge.com',
        'ngo2@heartbridge.com'
    ];
    for (const email of list) {
        await resetPassword(email, 'password');
    }
};

run();
