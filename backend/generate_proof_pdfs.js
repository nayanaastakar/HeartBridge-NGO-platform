const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'uploads/proof-documents');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const documents = [
    {
        filename: 'proof-document-sharma-lung.pdf',
        title: 'Urgent Lung Transplant - Ravi Sharma',
        patientName: 'Ravi Sharma',
        age: 34,
        hospital: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
        diagnosis: 'End-Stage Pulmonary Fibrosis — Bilateral Lung Transplant Required',
        doctorName: 'Dr. Priya Mehta, MD (Pulmonology)',
        regNo: 'MCI-2021-DL-09812',
        estimatedCost: '₹18,00,000',
        urgency: 'CRITICAL — Surgery window: 30–45 days',
        description: [
            'Patient Ravi Sharma, 34 years old, has been diagnosed with advanced bilateral',
            'pulmonary fibrosis. His lung function has deteriorated to 22% of normal capacity.',
            'Without a lung transplant within the next 30-45 days, his prognosis is extremely poor.',
            '',
            'He is the sole breadwinner for his family of four, including two school-age children.',
            'The family has exhausted all personal savings and requires immediate community support.',
            '',
            'Pre-surgical evaluation, compatibility testing, and ICU post-op care are included in',
            'the estimated treatment cost of ₹18,00,000.'
        ],
        refNo: 'AIIMS-EMRG-2024-0117',
        date: '18 Feb 2024'
    },
    {
        filename: 'proof-document-aisha-heart.pdf',
        title: 'Critical Heart Surgery - Aisha Begum',
        patientName: 'Aisha Begum',
        age: 7,
        hospital: 'Narayana Health City, Bengaluru',
        diagnosis: 'Tetralogy of Fallot — Open Heart Surgery Required',
        doctorName: 'Dr. Samuel Mathews, MD (Paediatric Cardiology)',
        regNo: 'MCI-2019-KA-07234',
        estimatedCost: '₹12,50,000',
        urgency: 'HIGH — Deterioration observed over past 2 months',
        description: [
            'Aisha Begum, 7 years old, suffers from Tetralogy of Fallot, a congenital heart defect',
            'involving four structural abnormalities of the heart. Her oxygen saturation has dropped',
            'to dangerous levels, and surgical correction is the only viable treatment.',
            '',
            'Her parents are daily wage labourers and are entirely unable to meet the cost of',
            'surgery, pre-op diagnostics, and post-operative ICU stay.',
            '',
            'Corrective surgery carries a 95% success rate when performed promptly. Without',
            'surgery, the risk of fatal cardiac events increases exponentially each month.'
        ],
        refNo: 'NH-CARD-2024-0342',
        date: '15 Feb 2024'
    },
    {
        filename: 'proof-document-ramesh-operation.pdf',
        title: 'Emergency Spinal Surgery - Ramesh Kumar',
        patientName: 'Ramesh Kumar',
        age: 45,
        hospital: 'Christian Medical College (CMC), Vellore',
        diagnosis: 'L4-L5 Disc Herniation with Spinal Cord Compression — Emergency Decompression Surgery',
        doctorName: 'Dr. Anita Verma, MD (Neurosurgery)',
        regNo: 'MCI-2018-TN-05521',
        estimatedCost: '₹8,75,000',
        urgency: 'HIGH — Paralysis risk if not operated within 2 weeks',
        description: [
            'Ramesh Kumar, 45, experienced a severe workplace accident resulting in critical',
            'compression of the spinal cord at L4-L5. He is currently experiencing lower limb',
            'weakness and impaired bladder control — early signs of permanent paralysis.',
            '',
            'Emergency decompression surgery must be performed within 14 days to prevent',
            'irreversible neurological damage. Delay beyond this window dramatically reduces',
            'the likelihood of full functional recovery.',
            '',
            'Ramesh is a factory worker with no health insurance. His wife and elderly parents',
            'depend entirely on his income. The family cannot fund the surgery without help.'
        ],
        refNo: 'CMC-NEURO-2024-0560',
        date: '20 Feb 2024'
    },
    {
        filename: 'proof-document-medical-kits.pdf',
        title: 'Emergency Medical Kits - Flood Relief, Assam',
        patientName: 'Community Relief — Assam Flood Victims',
        age: null,
        hospital: 'Gauhati Medical College & Hospital, Assam',
        diagnosis: 'Mass Casualty Event — Flood-Related Injuries and Disease Outbreak',
        doctorName: 'Dr. Bijoy Das, District Medical Officer',
        regNo: 'GOV-ASSAM-DMO-2024',
        estimatedCost: '₹5,00,000',
        urgency: 'CRITICAL — Ongoing disaster situation',
        description: [
            'Severe flooding in Assam has displaced over 85,000 people across 14 districts.',
            'Government medical camps are severely under-resourced, lacking basic wound care',
            'supplies, oral rehydration salts, antibiotics, and waterborne disease treatment kits.',
            '',
            'This fund will procure and deliver emergency medical kits including:',
            '  • 500 First Aid Kits (bandages, antiseptics, tourniquets)',
            '  • 1,000 ORS sachets and water purification tablets',
            '  • Antibiotics and anti-diarrheal medications for 2,000 patients',
            '  • 50 Emergency trauma bags for field medics',
            '',
            'Items will be dispatched within 48 hours of funding and distributed by trained',
            'volunteers from Gauhati Medical College in coordination with state authorities.'
        ],
        refNo: 'ASSAM-DMO-FLOOD-2024-0088',
        date: '19 Feb 2024'
    }
];

function generatePDF(docData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filePath = path.join(outputDir, docData.filename);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // ─── HEADER BANNER ───────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 90).fill('#1a3a5c');

        doc.fillColor('white')
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('HeartBridge', 50, 22, { align: 'left' });

        doc.fillColor('#a0c4e8')
            .fontSize(10)
            .font('Helvetica')
            .text('Empowering Lives Through Community Support', 50, 50, { align: 'left' });

        doc.fillColor('white')
            .fontSize(9)
            .text('VERIFIED MEDICAL DOCUMENT', 0, 55, { align: 'right', width: doc.page.width - 50 });

        doc.fillColor('white')
            .fontSize(9)
            .text(`Ref: ${docData.refNo}`, 0, 68, { align: 'right', width: doc.page.width - 50 });

        // ─── DOCUMENT TITLE ──────────────────────────────────────────────
        doc.moveDown(3);
        doc.fillColor('#1a3a5c')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(docData.title.toUpperCase(), { align: 'center' });

        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(2).strokeColor('#e53e3e').stroke();
        doc.moveDown(0.8);

        // ─── URGENCY BADGE ───────────────────────────────────────────────
        const urgencyColor = docData.urgency.startsWith('CRITICAL') ? '#e53e3e' : '#dd6b20';
        doc.rect(50, doc.y, doc.page.width - 100, 28).fill(urgencyColor);
        doc.fillColor('white')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`⚠  URGENCY: ${docData.urgency}`, 60, doc.y - 22, { align: 'left' });
        doc.moveDown(1.2);

        // ─── PATIENT INFO ────────────────────────────────────────────────
        doc.fillColor('#1a3a5c').fontSize(13).font('Helvetica-Bold').text('PATIENT INFORMATION');
        doc.moveDown(0.4);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.5).strokeColor('#cbd5e0').stroke();
        doc.moveDown(0.4);

        const infoRows = [
            ['Patient Name:', docData.patientName],
            docData.age ? ['Age:', `${docData.age} years`] : ['Category:', 'Community/Group'],
            ['Treating Hospital:', docData.hospital],
            ['Primary Diagnosis:', docData.diagnosis],
            ['Attending Physician:', docData.doctorName],
            ['Medical Reg. No.:', docData.regNo],
            ['Estimated Cost:', docData.estimatedCost],
            ['Document Date:', docData.date],
        ];

        infoRows.forEach(([label, value]) => {
            const y = doc.y;
            doc.fillColor('#4a5568').fontSize(10).font('Helvetica-Bold').text(label, 50, y, { width: 160, continued: false });
            doc.fillColor('#2d3748').fontSize(10).font('Helvetica').text(value, 215, y, { width: 330 });
            doc.moveDown(0.5);
        });

        // ─── MEDICAL SUMMARY ─────────────────────────────────────────────
        doc.moveDown(0.5);
        doc.fillColor('#1a3a5c').fontSize(13).font('Helvetica-Bold').text('MEDICAL SUMMARY & CASE OVERVIEW');
        doc.moveDown(0.4);
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.5).strokeColor('#cbd5e0').stroke();
        doc.moveDown(0.4);

        docData.description.forEach(line => {
            if (line === '') {
                doc.moveDown(0.4);
            } else {
                doc.fillColor('#2d3748').fontSize(10).font('Helvetica').text(line, 50, doc.y, { width: doc.page.width - 100 });
                doc.moveDown(0.2);
            }
        });

        // ─── VERIFICATION SEAL ───────────────────────────────────────────
        doc.moveDown(1.5);
        doc.rect(50, doc.y, doc.page.width - 100, 80).fill('#f0fff4').stroke('#38a169');

        const sealY = doc.y + 10;
        doc.fillColor('#276749').fontSize(13).font('Helvetica-Bold')
            .text('✔  VERIFIED BY HEARTBRIDGE MEDICAL REVIEW BOARD', 60, sealY, { align: 'center', width: doc.page.width - 120 });

        doc.fillColor('#4a5568').fontSize(9).font('Helvetica')
            .text('This document has been reviewed and verified by HeartBridge\'s independent medical committee.', 60, sealY + 22, { align: 'center', width: doc.page.width - 120 });

        doc.fillColor('#4a5568').fontSize(9)
            .text(`Verification ID: HB-MRB-${docData.refNo} | Generated: ${docData.date}`, 60, sealY + 38, { align: 'center', width: doc.page.width - 120 });

        doc.fillColor('#e53e3e').fontSize(9).font('Helvetica-Bold')
            .text('All donations are 80G tax-exempt and traceable. HeartBridge does not take commissions.', 60, sealY + 53, { align: 'center', width: doc.page.width - 120 });

        // ─── FOOTER ──────────────────────────────────────────────────────
        const footerY = doc.page.height - 45;
        doc.rect(0, footerY, doc.page.width, 45).fill('#1a3a5c');
        doc.fillColor('#a0c4e8').fontSize(8).font('Helvetica')
            .text('HeartBridge NGO Platform  |  heartbridge.org  |  support@heartbridge.org  |  +91-98765-43210', 0, footerY + 16, { align: 'center', width: doc.page.width });

        doc.end();

        stream.on('finish', () => {
            console.log(`✅ Created: ${docData.filename}`);
            resolve();
        });
        stream.on('error', reject);
    });
}

async function main() {
    console.log('📄 Generating professional PDF proof documents...\n');
    for (const docData of documents) {
        await generatePDF(docData);
    }
    console.log('\n🎉 All PDF documents generated successfully!');
    console.log(`📁 Location: ${outputDir}`);
}

main().catch(console.error);
