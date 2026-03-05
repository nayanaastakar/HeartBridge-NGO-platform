const mongoose = require('mongoose');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

const findNames = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findById('6978c19e63e518f4bdf914aa');
        const ngo = await NGO.findById('69797e22e08d69bd3cc914f9');

        console.log('Result:');
        console.log('Donor Name:', user ? user.name : 'Not Found');
        console.log('NGO Name:', ngo ? ngo.name : 'Not Found');

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};
findNames();
