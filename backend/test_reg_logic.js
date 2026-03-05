const mongoose = require('mongoose');
const User = require('./models/User');
const NGO = require('./models/NGO');
const authService = require('./services/authService');
require('dotenv').config();

const testRegistration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('✅ Connected to MongoDB');

        const testEmail = `test_user_${Date.now()}@example.com`;
        const testData = {
            name: 'Test Registration User',
            email: testEmail,
            password: 'password123',
            role: 'donor',
            phone: '1234567890',
            address: '123 Test Street'
        };

        console.log(`🚀 Attempting registration for: ${testEmail}`);
        const result = await authService.register(testData);

        console.log('✅ Registration SUCCESS result:', JSON.stringify(result, null, 2));

        // Verify user in DB
        const userInDb = await User.findOne({ email: testEmail });
        if (userInDb) {
            console.log('🔍 User found in database with ID:', userInDb._id);
            console.log('📧 isEmailVerified:', userInDb.isEmailVerified);
            console.log('🔢 emailOTP:', userInDb.emailOTP);
        } else {
            console.log('❌ User NOT found in database after successful registration report');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('🧹 Cleanup: Test user removed');

        await mongoose.connection.close();
        console.log('🔌 DB Connection closed');
    } catch (err) {
        console.error('❌ Registration test FAILED:', err);
        process.exit(1);
    }
};

testRegistration();
