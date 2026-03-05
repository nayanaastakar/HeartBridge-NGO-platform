const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const donors = [
    { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', role: 'donor', password: 'password123' },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'donor', password: 'password123' },
    { name: 'Amit Patel', email: 'amit.patel@example.com', role: 'donor', password: 'password123' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', role: 'donor', password: 'password123' },
    { name: 'Keerthu', email: 'keerthu@gmail.com', role: 'donor', password: 'password123' },
    { name: 'Hope', email: 'hope@gmail.com', role: 'donor', password: 'password123' },
    { name: 'Keerthana', email: 'keerthana@heartbridge.com', role: 'donor', password: 'password123' }
];

const restore = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        for (const data of donors) {
            const existing = await User.findOne({ email: data.email });
            if (!existing) {
                await User.create(data);
                console.log(`✅ Restored donor: ${data.name} (${data.email})`);
            } else {
                console.log(`ℹ️ Donor already exists: ${data.email}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

restore();
