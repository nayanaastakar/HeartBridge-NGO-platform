const mongoose = require('mongoose');
const NGO = require('./models/NGO');
require('dotenv').config();

const updateDocs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const standardDocs = [
            {
                title: 'NGO Registration Certificate',
                url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
                uploadedAt: new Date('2023-01-15')
            },
            {
                title: '80G Tax Exemption Certificate',
                url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
                uploadedAt: new Date('2023-02-20')
            }
        ];

        const result = await NGO.updateMany({}, {
            $set: { verificationDocuments: standardDocs }
        });

        console.log(`Successfully updated ${result.modifiedCount} NGOs with standard Registration and Tax documents.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

updateDocs();
