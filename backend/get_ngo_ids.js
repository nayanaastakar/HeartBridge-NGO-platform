const mongoose = require('mongoose');
const NGO = require('./models/NGO');
require('dotenv').config();

const getIds = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        const ngos = await NGO.find({}).limit(5).select('name _id');
        const fs = require('fs');
        fs.writeFileSync('ngo_ids.json', JSON.stringify(ngos, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        process.exit(1);
    }
};

getIds();
