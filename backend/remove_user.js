const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const removeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'poornimab.sse25@rvce.edu.in';
        const result = await User.deleteOne({ email: email.toLowerCase() });

        if (result.deletedCount > 0) {
            console.log(`Successfully removed user: ${email}`);
        } else {
            console.log(`User not found: ${email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Failed to remove user:', error);
        process.exit(1);
    }
};

removeAdmin();
