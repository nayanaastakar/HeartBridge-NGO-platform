const mongoose = require('mongoose');
const EmergencyFund = require('./models/EmergencyFund');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const emergencies = [
    {
        ngoId: '6992a5014f95243123c68e1d', // Sunrise Old Age Home
        title: 'Urgent Lung Transplant for Mr. Sharma',
        description: 'Mr. Sharma, a 68-year-old resident of Sunrise Old Age Home, requires an urgent lung transplant due to severe chronic respiratory failure. The surgery is critical for his survival. Every contribution helps bring him closer to a breath of life.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 850000,
        collectedAmount: 120000,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        priority: 'high',
        status: 'active',
        proofDocument: {
            filename: 'medical_report_lung.pdf',
            originalName: 'Sharma_Lung_Report.pdf',
            fileSize: 1024567,
            mimeType: 'application/pdf',
            uploadedAt: new Date()
        }
    },
    {
        ngoId: '6992a5014f95243123c68e20', // Children Welfare Foundation
        title: 'Critical Heart Surgery for Baby Aisha',
        description: 'Aisha is just 14 months old and was born with a complex ventricular septal defect. She needs a corrective heart surgery immediately. The Children Welfare Foundation is raising funds to cover the specialized cardiothoracic surgery costs.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 500000,
        collectedAmount: 45000,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'high',
        status: 'active',
        proofDocument: {
            filename: 'heart_surgery_req.pdf',
            originalName: 'Aisha_Heart_Surgery_Details.pdf',
            fileSize: 850000,
            mimeType: 'application/pdf',
            uploadedAt: new Date()
        }
    },
    {
        ngoId: '6992a5014f95243123c68e26', // Hope for Disabled Foundation
        title: 'Emergency Bone Graft Operation for Ramesh',
        description: 'Ramesh, a young athlete supported by our foundation, met with a severe accident resulting in multiple fractures. He needs a specialized bone graft operation to regain mobility. Help us walk with him in this tough journey.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 350000,
        collectedAmount: 150000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        priority: 'high',
        status: 'active',
        proofDocument: {
            filename: 'operation_docs.pdf',
            originalName: 'Ramesh_Operation_Prescription.pdf',
            fileSize: 1200000,
            mimeType: 'application/pdf',
            uploadedAt: new Date()
        }
    },
    {
        ngoId: '6992a5014f95243123c68e23', // Food for All Initiative
        title: 'Medical Kits for Flood-Affected Communities',
        description: 'In the wake of recent flash floods, local communities are facing an outbreak of waterborne diseases. We urgently need to provide 500 medical emergency kits containing basic medicines, water purification tablets, and first aid supplies.',
        emergencyType: 'Medical Emergency',
        requiredAmount: 200000,
        collectedAmount: 80000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        status: 'active',
        proofDocument: {
            filename: 'flood_medical_req.pdf',
            originalName: 'Community_Medical_Need_List.pdf',
            fileSize: 450000,
            mimeType: 'application/pdf',
            uploadedAt: new Date()
        }
    }
];

async function seedEmergencies() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Optional: Clear existing ones if you want, but user said "add 3-4 more"
        // await EmergencyFund.deleteMany({}); 

        const results = await EmergencyFund.create(emergencies);
        console.log(`Successfully added ${results.length} emergency stories.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding emergency funds:', error);
        process.exit(1);
    }
}

seedEmergencies();
