import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Conversation from '../src/models/conversation.model';
import User from '../src/models/user.model';

dotenv.config();

async function main() {
    const mongoUri =
        process.env.MONGODB_URI || 'mongodb://localhost:27017/handbook';

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Remove participants field from conversations (raw collection to bypass schema strictness)
    const convoResult = await Conversation.collection.updateMany(
        { participants: { $exists: true } },
        { $unset: { participants: 1 } }
    );
    console.log(
        `🗑️ Removed participants from ${convoResult.modifiedCount} conversations`
    );

    // Remove friends field from users (raw collection to bypass schema strictness)
    const userResult = await User.collection.updateMany(
        { friends: { $exists: true } },
        { $unset: { friends: 1 } }
    );
    console.log(`🗑️ Removed friends from ${userResult.modifiedCount} users`);

    // Summary
    const remainingConvoWithParticipants = await Conversation.countDocuments({
        participants: { $exists: true },
    });
    const remainingUsersWithFriends = await User.countDocuments({
        friends: { $exists: true },
    });

    console.log('📊 Remaining documents with legacy fields:');
    console.log(
        `   conversations.participants: ${remainingConvoWithParticipants}`
    );
    console.log(`   users.friends: ${remainingUsersWithFriends}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected');
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
