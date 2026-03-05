const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role name');
        console.log('\n--- Current Users in DB ---');
        users.forEach(u => console.log(`${u.email} [${u.role}] - ${u.name}`));

        // Check if donor@heartbridge.com exists
        const donor = await User.findOne({ email: 'donor@heartbridge.com' }).select('+password');
        if (donor) {
            console.log('\nDonor user exists.');
        } else {
            console.log('\nDonor user NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkUsers();
