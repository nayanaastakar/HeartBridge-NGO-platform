const mongoose = require('mongoose');
const EmergencyFund = require('./models/EmergencyFund');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';
const UPLOADS_DIR = path.join(__dirname, 'uploads/proof-documents');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const emergencies = [
    {
        ngoId: '6992a5014f95243123c68e1d', // Sunrise Old Age Home
        title: 'Urgent Lung Transplant for Mr. Sharma',
        description: 'Mr. Sharma, a 68-year-old resident of Sunrise Old Age Home, requires an urgent lung transplant due to severe chronic respiratory failure. The surgery is critical for his survival. Every contribution helps bring him closer to a breath of life.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 850000,
        collectedAmount: 120000,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'ACTIVE',
        originalName: 'Sharma_Lung_Report.pdf',
        mockFileName: 'proof-document-sharma-lung.pdf'
    },
    {
        ngoId: '6992a5014f95243123c68e20', // Children Welfare Foundation
        title: 'Critical Heart Surgery for Baby Aisha',
        description: 'Aisha is just 14 months old and was born with a complex ventricular septal defect. She needs a corrective heart surgery immediately. The Children Welfare Foundation is raising funds to cover the specialized cardiothoracic surgery costs.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 500000,
        collectedAmount: 45000,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'ACTIVE',
        originalName: 'Aisha_Heart_Surgery_Details.pdf',
        mockFileName: 'proof-document-aisha-heart.pdf'
    },
    {
        ngoId: '6992a5014f95243123c68e26', // Hope for Disabled Foundation
        title: 'Emergency Bone Graft Operation for Ramesh',
        description: 'Ramesh, a young athlete supported by our foundation, met with a severe accident resulting in multiple fractures. He needs a specialized bone graft operation to regain mobility. Help us walk with him in this tough journey.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 350000,
        collectedAmount: 150000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'ACTIVE',
        originalName: 'Ramesh_Operation_Prescription.pdf',
        mockFileName: 'proof-document-ramesh-operation.pdf'
    },
    {
        ngoId: '6992a5014f95243123c68e23', // Food for All Initiative
        title: 'Medical Kits for Flood-Affected Communities',
        description: 'In the wake of recent flash floods, local communities are facing an outbreak of waterborne diseases. We urgently need to provide 500 medical emergency kits containing basic medicines, water purification tablets, and first aid supplies.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 200000,
        collectedAmount: 80000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'ACTIVE',
        originalName: 'Community_Medical_Need_List.pdf',
        mockFileName: 'proof-document-medical-kits.pdf'
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing
        await EmergencyFund.deleteMany({});
        console.log('Cleared existing emergency funds.');

        const seededData = [];

        for (const e of emergencies) {
            // Skip document creation here; use generate_proof_pdfs.js instead
            const filePath = path.join(UPLOADS_DIR, e.mockFileName);
            // fs.writeFileSync(filePath, `This is a mock medical proof document for: ${e.title}\nRequested Amount: ₹${e.requiredAmount}`);

            const fund = await EmergencyFund.create({
                ngoId: e.ngoId,
                title: e.title,
                description: e.description,
                emergencyType: e.emergencyType,
                requiredAmount: e.requiredAmount,
                collectedAmount: e.collectedAmount,
                deadline: e.deadline,
                priority: e.priority,
                status: e.status,
                proofDocument: {
                    filename: e.mockFileName,
                    originalName: e.originalName,
                    fileSize: fs.statSync(filePath).size,
                    mimeType: 'application/pdf',
                    uploadedAt: new Date()
                }
            });
            seededData.push(fund);
        }

        console.log(`Successfully seeded ${seededData.length} emergencies with files.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
