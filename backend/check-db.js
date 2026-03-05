const mongoose = require('mongoose');
const Discussion = require('./models/Discussion');
const NGO = require('./models/NGO');
const ImpactStory = require('./models/ImpactStory');
const Donation = require('./models/Donation');
const Wish = require('./models/Wish');
const EmergencyFund = require('./models/EmergencyFund');
const AdoptADay = require('./models/AdoptADay');
const Gratitude = require('./models/Gratitude');
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');
const Testimonial = require('./models/Testimonial');
const dotenv = require('dotenv');
dotenv.config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');

        const models = [
            { name: 'Users', model: User },
            { name: 'NGOs', model: NGO },
            { name: 'Impact Stories', model: ImpactStory },
            { name: 'Donations', model: Donation },
            { name: 'Wishes', model: Wish },
            { name: 'Emergency Funds', model: EmergencyFund },
            { name: 'Adopt-a-Day', model: AdoptADay },
            { name: 'Gratitude Wall', model: Gratitude },
            { name: 'Team Members', model: TeamMember },
            { name: 'Testimonials', model: Testimonial },
            { name: 'Discussions', model: Discussion }
        ];

        console.log('--- Database Status ---');
        for (const m of models) {
            const count = await m.model.countDocuments();
            console.log(`${m.name.padEnd(20)}: ${count}`);
        }
        console.log('-----------------------');

        process.exit(0);
    } catch (err) {
        console.error('Check Failed:', err);
        process.exit(1);
    }
}

checkDatabase();
