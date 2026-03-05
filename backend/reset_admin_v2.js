const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function reset() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
        const admins = await User.find({ role: 'system_admin' });
        console.log(`Found ${admins.length} admins.`);
        for (const admin of admins) {
            admin.password = 'admin123';
            await admin.save();
            console.log(`✅ ${admin.email} reset to "admin123"`);
        }
        console.log('All done.');
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
reset();
