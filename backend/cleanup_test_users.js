const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const usersToRemove = [
    'poornima.sse25@rvce.edu.in',
    'poornimab.sse25@rvce.edu.in',
    'poornimababu1604@gmail.com',
    'poornima.b.ssse25rvc@edu.in'
];

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        for (const email of usersToRemove) {
            const result = await User.deleteOne({ email });
            if (result.deletedCount > 0) {
                console.log(`Successfully removed: ${email}`);
            } else {
                console.log(`User not found or already removed: ${email}`);
            }
        }

        const donors = await User.find({ role: 'donor' }, 'email name');
        const ngos = await User.find({ role: 'ngo_admin' }, 'email name');

        console.log('\n--- ALL REMAINING DONORS ---');
        donors.forEach((u, i) => console.log(`${i + 1}. ${u.email} (${u.name})`));

        console.log('\n--- ALL REMAINING NGOs ---');
        ngos.forEach((u, i) => console.log(`${i + 1}. ${u.email} (${u.name})`));

        console.log('\nNote: Passwords are encrypted in the database. Most seeded users use "password123" or similar.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
