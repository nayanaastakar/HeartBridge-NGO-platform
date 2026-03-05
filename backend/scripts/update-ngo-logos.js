const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NGO = require('../models/NGO');

dotenv.config();

const LOGO_POOLS = {
    'Children Welfare': [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547311746-86f343a91b97?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=400&auto=format&fit=crop'
    ],
    'Old Age Homes': [
        'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516307361724-e65691c78494?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579156325128-d875a6c3f684?q=80&w=400&auto=format&fit=crop'
    ],
    'Education': [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop'
    ],
    'Healthcare': [
        'https://images.unsplash.com/photo-1505751172107-1601057df7cf?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop'
    ],
    'Food and Basic Needs': [
        'https://images.unsplash.com/photo-1593113616828-6f22bca04804?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1461354464878-ad92f492a54b?q=80&w=400&auto=format&fit=crop'
    ],
    'Physically Disabled Care': [
        'https://images.unsplash.com/photo-1533038590840-27931885f6bd?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1597405230919-61f22df6e04d?q=80&w=400&auto=format&fit=crop'
    ]
};

async function updateLogos() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const ngos = await NGO.find({});
        console.log(`Found ${ngos.length} NGOs`);

        const categoryCounters = {};

        for (const ngo of ngos) {
            let cleanCategory = ngo.category.replace(' NGOs', '');
            if (cleanCategory === 'Children Welfare') cleanCategory = 'Children Welfare'; // Normalize

            const pool = LOGO_POOLS[cleanCategory] || [];
            if (pool.length > 0) {
                // Simple counter-based uniqueness
                const index = categoryCounters[cleanCategory] || 0;
                const logoUrl = pool[index % pool.length];
                categoryCounters[cleanCategory] = index + 1;

                await NGO.updateOne({ _id: ngo._id }, { $set: { logo: logoUrl } });
                console.log(`Updated unique logo for: ${ngo.name} (${ngo.category})`);
            } else {
                console.log(`No logo pool found for category: ${ngo.category} (NGO: ${ngo.name})`);
            }
        }

        console.log('Successfully updated all NGO logos with unique images');
        process.exit(0);
    } catch (error) {
        console.error('Error updating logos:', error);
        process.exit(1);
    }
}

updateLogos();
