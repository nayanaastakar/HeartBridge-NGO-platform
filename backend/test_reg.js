const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authService = require('./services/authService');

dotenv.config();

const testRegistration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = `test_user_${Date.now()}@gmail.com`;
        console.log(`Testing registration for: ${testEmail}`);

        const result = await authService.register({
            name: 'Test User',
            email: testEmail,
            password: 'password123',
            role: 'donor'
        });

        console.log('Registration SUCCESS!');
        console.log('Result:', result);

        process.exit(0);
    } catch (error) {
        console.error('Registration FAILED:', error);
        process.exit(1);
    }
};

testRegistration();
