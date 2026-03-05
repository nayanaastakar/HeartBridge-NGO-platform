const mongoose = require('mongoose');
const Discussion = require('./models/Discussion');
const dotenv = require('dotenv');
dotenv.config();

async function checkDiscussions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge');
        console.log('Connected to MongoDB');

        const discussions = await Discussion.find().limit(5);
        console.log(`Found ${discussions.length} discussions`);

        discussions.forEach((d, i) => {
            console.log(`\nDiscussion ${i + 1}: ${d.title}`);
            console.log(`ID: ${d._id}`);
            console.log(`Replies count: ${d.replies.length}`);
            d.replies.forEach((r, j) => {
                console.log(`  Reply ${j + 1}: ${r.content.substring(0, 20)}... by ${r.userName}`);
                if (!r.userId) console.error(`  ⚠️ Reply ${j + 1} is missing userId!`);
            });
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDiscussions();
