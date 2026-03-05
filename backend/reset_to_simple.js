const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');

        const accounts = [
            'admin@heartbridge.com',
            'admin22@heartbridge.com',
            'donor@heartbridge.com',
            'ngo1@heartbridge.com'
        ];

        for (const email of accounts) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = 'password';
                await user.save();
                console.log(`✅ Reset password for ${email} to 'password'`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

resetAll();
