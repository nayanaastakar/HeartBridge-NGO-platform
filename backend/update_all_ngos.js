const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const NGO = require('./models/NGO');

async function updateAllNgoDocs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const ngos = await NGO.find({});
        console.log(`Found ${ngos.length} NGOs to update.`);

        const sampleDocs = [
            {
                title: 'Registration Certificate (Official)',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Tax Exemption 80G (Official)',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ];

        for (const ngo of ngos) {
            ngo.verificationDocuments = sampleDocs;
            await ngo.save();
            console.log(`✅ Updated docs for: ${ngo.name}`);
        }

        console.log('Successfully updated verification documents for ALL NGOs');
        process.exit(0);
    } catch (error) {
        console.error('Error updating NGOs:', error);
        process.exit(1);
    }
}

updateAllNgoDocs();
