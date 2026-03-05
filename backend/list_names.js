const mongoose = require('mongoose');
const User = require('./models/User');
const NGO = require('./models/NGO');

const MONGO_URI = 'mongodb://localhost:27017/heartbridge';

async function run() {
    await mongoose.connect(MONGO_URI);

    const users = await User.find({}, 'name email');
    console.log('--- ALL USERS ---');
    users.forEach(u => console.log(`'${u.name}' | ${u.email}`));

    const ngos = await NGO.find({}, 'name');
    console.log('--- ALL NGOs ---');
    ngos.forEach(n => console.log(`'${n.name}'`));

    process.exit(0);
}
run();
