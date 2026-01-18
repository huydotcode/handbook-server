import mongoose from 'mongoose';
import Conversation from '../src/models/conversation.model';
import Message from '../src/models/message.model';
import {
    connectToMongo,
    disconnectFromMongo,
} from '../src/common/utils/mongodb';

async function run() {
    console.log('Starting migration: update lastMessage for all conversations');
    await connectToMongo();

    const conversations = await Conversation.find({});
    console.log(`Found ${conversations.length} conversations to process`);

    let updatedCount = 0;
    let noMessageCount = 0;

    for (const conv of conversations) {
        const lastMessage = await Message.findOne({
            conversation: conv._id,
        }).sort({ createdAt: -1 });

        if (lastMessage) {
            await Conversation.updateOne(
                { _id: conv._id },
                { lastMessage: lastMessage._id }
            );
            updatedCount++;
        } else {
            await Conversation.updateOne(
                { _id: conv._id },
                { lastMessage: null }
            );
            noMessageCount++;
        }

        if ((updatedCount + noMessageCount) % 100 === 0) {
            console.log(
                `Processed ${updatedCount + noMessageCount} conversations...`
            );
        }
    }

    console.log(
        `Migration completed. Updated: ${updatedCount}, No message: ${noMessageCount}`
    );

    await disconnectFromMongo();
}

run()
    .then(() => {
        console.log('Migration script finished');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Migration failed:', err);
        mongoose.disconnect();
        process.exit(1);
    });
