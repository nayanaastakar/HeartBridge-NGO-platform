const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const NGO = require('./models/NGO');

async function updateNgo16() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const ngo = await NGO.findOne({ registrationNumber: 'REG-016' });

        if (!ngo) {
            console.log('NGO with REG-016 not found');
            process.exit(1);
        }

        console.log('Found NGO:', ngo.name);

        ngo.verificationDocuments = [
            {
                title: 'Registration Certificate (Form A)',
                url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', // Dummy professional doc look
                uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Tax Exemption 80G Certificate',
                url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Annual Impact Report 2023',
                url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80',
                uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];

        await ngo.save();
        console.log('Successfully updated verification documents for NGO 16');
        process.exit(0);
    } catch (error) {
        console.error('Error updating NGO:', error);
        process.exit(1);
    }
}

updateNgo16();
