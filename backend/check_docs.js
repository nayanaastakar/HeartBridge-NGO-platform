const mongoose = require('mongoose');
const NGO = require('./models/NGO');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        const ngo = await NGO.findOne({});
        console.log('Sample NGO:', ngo.name);
        console.log('Docs Count:', ngo.verificationDocuments?.length);
        console.log('Docs:', JSON.stringify(ngo.verificationDocuments, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkData();
