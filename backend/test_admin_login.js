const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authService = require('./services/authService');

dotenv.config();

const testAdminLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // We use the email from the previous successful registration test
        // Since I don't have it easily, I'll just look for one of the admin_test users
        const User = require('./models/User');
        const user = await User.findOne({ email: /admin_test/ }).sort({ createdAt: -1 });

        if (!user) {
            console.log('No test admin user found');
            process.exit(1);
        }

        console.log(`Testing login for: ${user.email}`);

        const result = await authService.login({
            email: user.email,
            password: 'password123'
        });

        console.log('Admin Login SUCCESS!');
        console.log('Result:', result);

        process.exit(0);
    } catch (error) {
        console.error('Admin Login FAILED:', error);
        process.exit(1);
    }
};

testAdminLogin();
