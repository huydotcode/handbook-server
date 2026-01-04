import mongoose, { Types } from 'mongoose';
import Conversation from '../src/models/conversation.model';
import ConversationMember from '../src/models/conversation-member.model';
import {
    connectToMongo,
    disconnectFromMongo,
} from '../src/common/utils/mongodb';

async function run() {
    await connectToMongo();

    const conversations = await Conversation.find({
        participants: { $exists: true, $ne: [] },
    })
        .select('_id participants creator type')
        .lean();

    console.log(
        `Found ${conversations.length} conversations with participants`
    );

    let created = 0;
    for (const conv of conversations) {
        const conversationId = conv._id;
        const participants: any[] = Array.isArray(conv.participants)
            ? conv.participants
            : [];

        for (const userIdRaw of participants) {
            if (!userIdRaw) continue;
            const userId = userIdRaw.toString();

            // Determine role: creator is admin, others are members
            const role =
                conv.creator && conv.creator.toString() === userId
                    ? 'admin'
                    : 'member';

            await ConversationMember.updateOne(
                { conversation: conversationId, user: userId },
                {
                    $setOnInsert: {
                        conversation: conversationId,
                        user: userId,
                        role,
                    },
                },
                { upsert: true }
            );
            created++;
        }
    }

    console.log(`Upserted ${created} conversation members`);

    // Remove participants field from all conversations
    const unsetResult = await Conversation.updateMany(
        { participants: { $exists: true } },
        { $unset: { participants: 1 } }
    );
    console.log(
        `Conversations updated (unset participants): ${unsetResult.modifiedCount}`
    );

    await disconnectFromMongo();
}

run()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Migration failed:', err);
        mongoose.disconnect();
        process.exit(1);
    });
