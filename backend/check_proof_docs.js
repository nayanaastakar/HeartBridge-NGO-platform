const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge';

mongoose.connect(MONGODB_URI).then(async () => {
    const EmergencyFund = require('./models/EmergencyFund');
    const funds = await EmergencyFund.find({});
    console.log(`Found ${funds.length} emergency funds:\n`);
    funds.forEach(f => {
        console.log(`Title: ${f.title}`);
        console.log(`proofDocument:`, JSON.stringify(f.proofDocument, null, 2));
        console.log('---');
    });
    mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
