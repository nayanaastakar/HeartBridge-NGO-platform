const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authService = require('./services/authService');

dotenv.config();

const testAdminRegistration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = `admin_test_${Date.now()}@heartbridge.com`;
        const adminKey = process.env.ADMIN_REGISTRATION_KEY || '123456';

        console.log(`Testing admin registration for: ${testEmail}`);
        console.log(`Using admin key: ${adminKey}`);

        const result = await authService.registerAdmin({
            name: 'Test Admin',
            email: testEmail,
            password: 'password123',
            adminKey: adminKey
        });

        console.log('Admin Registration SUCCESS!');
        console.log('Result:', result);

        process.exit(0);
    } catch (error) {
        console.error('Admin Registration FAILED:', error);
        process.exit(1);
    }
};

testAdminRegistration();
