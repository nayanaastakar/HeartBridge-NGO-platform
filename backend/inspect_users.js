const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const inspectUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        const users = await User.find({ email: new RegExp(email, 'i') });
        console.log(`Found ${users.length} matching "${email}"`);
        users.forEach(u => {
            console.log(`- Email: "${u.email}" (len: ${u.email.length})`);
            console.log(`  Name:  "${u.name}"`);
            console.log(`  Role:  ${u.role}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

inspectUser('admin4@heartbridge.com');
inspectUser('admin22@heartbridge.com');
inspectUser('ngo1@heartbridge.com');
