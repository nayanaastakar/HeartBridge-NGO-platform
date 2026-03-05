const mongoose = require('mongoose');
const User = require('./models/User');
const NGO = require('./models/NGO');
const Wish = require('./models/Wish');
const EmergencyFund = require('./models/EmergencyFund');
const AdoptADay = require('./models/AdoptADay');
const ImpactStory = require('./models/ImpactStory');
require('dotenv').config();

const auditDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('--- HEARTBRIDGE DATABASE AUDIT ---');

        const collections = [
            { name: 'Users', model: User },
            { name: 'NGOs', model: NGO },
            { name: 'Wishes', model: Wish },
            { name: 'EmergencyFunds', model: EmergencyFund },
            { name: 'AdoptADay', model: AdoptADay },
            { name: 'ImpactStories', model: ImpactStory }
        ];

        for (const col of collections) {
            const count = await col.model.countDocuments({});
            console.log(`${col.name.padEnd(15)}: ${count} records`);

            if (count > 0) {
                const sample = await col.model.findOne({});
                console.log(`  Sample ID: ${sample._id}`);

                // Specific checks
                if (col.name === 'EmergencyFunds') {
                    const statusCounts = await col.model.aggregate([
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]);
                    console.log(`  Statuses: ${JSON.stringify(statusCounts)}`);
                }

                if (col.name === 'Users') {
                    const roleCounts = await col.model.aggregate([
                        { $group: { _id: '$role', count: { $sum: 1 } } }
                    ]);
                    console.log(`  Roles: ${JSON.stringify(roleCounts)}`);
                }
            }
        }

        console.log('-----------------------------------');
        await mongoose.connection.close();
    } catch (err) {
        console.error('Audit failed:', err);
    }
};

auditDatabase();
