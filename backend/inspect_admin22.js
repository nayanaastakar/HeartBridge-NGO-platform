const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const inspectUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');

        const emailToFind = 'admin22@heartbridge.com';
        const user = await User.findOne({ email: emailToFind });

        if (user) {
            console.log(`Email in DB: "${user.email}" (Length: ${user.email.length})`);
            console.log(`Role: ${user.role}`);
        } else {
            console.log('User not found.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

inspectUser();
