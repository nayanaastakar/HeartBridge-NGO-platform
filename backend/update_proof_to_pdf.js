const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge';

mongoose.connect(MONGODB_URI).then(async () => {
    const EmergencyFund = require('./models/EmergencyFund');

    const updates = [
        {
            titleMatch: /Sharma/i,
            proofDocument: {
                filename: 'proof-document-sharma-lung.pdf',
                originalName: 'Medical_Verification_Sharma_Lung_Transplant.pdf',
                fileSize: 50000,
                mimeType: 'application/pdf',
                uploadedAt: new Date()
            }
        },
        {
            titleMatch: /Aisha/i,
            proofDocument: {
                filename: 'proof-document-aisha-heart.pdf',
                originalName: 'Medical_Verification_Aisha_Heart_Surgery.pdf',
                fileSize: 50000,
                mimeType: 'application/pdf',
                uploadedAt: new Date()
            }
        },
        {
            titleMatch: /Ramesh/i,
            proofDocument: {
                filename: 'proof-document-ramesh-operation.pdf',
                originalName: 'Medical_Verification_Ramesh_Spinal_Surgery.pdf',
                fileSize: 50000,
                mimeType: 'application/pdf',
                uploadedAt: new Date()
            }
        },
        {
            titleMatch: /Medical Kits|Flood/i,
            proofDocument: {
                filename: 'proof-document-medical-kits.pdf',
                originalName: 'Medical_Verification_Flood_Relief_Kits.pdf',
                fileSize: 50000,
                mimeType: 'application/pdf',
                uploadedAt: new Date()
            }
        }
    ];

    const funds = await EmergencyFund.find({});
    let updated = 0;

    for (const fund of funds) {
        for (const upd of updates) {
            if (upd.titleMatch.test(fund.title)) {
                fund.proofDocument = upd.proofDocument;
                await fund.save();
                console.log(`✅ Updated: "${fund.title}" → ${upd.proofDocument.filename}`);
                updated++;
                break;
            }
        }
    }

    console.log(`\n🎉 Updated ${updated} emergency fund records with PDF filenames.`);
    mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
