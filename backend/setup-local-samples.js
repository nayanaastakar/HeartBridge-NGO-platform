const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const NGO = require('./models/NGO');

async function setupSamples() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const ngos = await NGO.find({});
        console.log(`Updating ${ngos.length} NGOs to use local dummy HTML certificates...`);

        const localDocs = [
            {
                title: 'NGO Registration Certificate (12A)',
                url: '/uploads/proof-documents/certificate.html',
                uploadedAt: new Date()
            },
            {
                title: 'Income Tax Exemption (80G)',
                url: '/uploads/proof-documents/tax_80g.html',
                uploadedAt: new Date()
            }
        ];

        for (const ngo of ngos) {
            ngo.verificationDocuments = localDocs;
            await ngo.save();
        }

        console.log('✅ Success! All NGOs now point to local HTML files.');
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setupSamples();
