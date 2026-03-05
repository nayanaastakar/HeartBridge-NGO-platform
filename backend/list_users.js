const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');

        const users = await User.find({}, 'name email role isEmailVerified');

        console.log('\n--- SYSTEM USER DIRECTORY ---\n');

        const ngos = users.filter(u => u.role === 'ngo_admin');
        const donors = users.filter(u => u.role === 'donor');
        const admins = users.filter(u => u.role === 'system_admin');

        console.log('NGO ADMINS:');
        ngos.forEach(u => console.log(`- ${u.name.padEnd(20)} | Email: ${u.email.padEnd(30)} | Verified: ${u.isEmailVerified}`));

        console.log('\nDONORS:');
        donors.forEach(u => console.log(`- ${u.name.padEnd(20)} | Email: ${u.email.padEnd(30)} | Verified: ${u.isEmailVerified}`));

        console.log('\nSYSTEM ADMINS:');
        admins.forEach(u => console.log(`- ${u.name.padEnd(20)} | Email: ${u.email.padEnd(30)} | Verified: ${u.isEmailVerified}`));

        console.log('\n--- PASSWORD INFO ---');
        console.log('All test accounts use the password: "password"');
        console.log('----------------------------\n');

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        mongoose.connection.close();
    }
};

listAllUsers();
