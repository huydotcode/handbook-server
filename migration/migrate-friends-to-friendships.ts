import mongoose, { Types } from 'mongoose';
import User from '../src/models/user.model';
import Friendship from '../src/models/friendship.model';
import {
    connectToMongo,
    disconnectFromMongo,
} from '../src/common/utils/mongodb';
import { validateConfig } from '../src/common/utils/config';

async function run() {
    validateConfig();
    await connectToMongo();

    const users = await User.find({ friends: { $exists: true, $ne: [] } })
        .select('_id friends')
        .lean();

    console.log(`Found ${users.length} users with friends array`);

    const pairKeys = new Set<string>();
    const ops: any[] = [];

    for (const user of users) {
        const userId = user._id;
        const friends: any[] = Array.isArray(user.friends) ? user.friends : [];

        for (const friendIdRaw of friends) {
            if (!friendIdRaw) continue;
            const friendId = friendIdRaw.toString();
            if (friendId === userId) continue;

            const [user1, user2] = [userId, friendId].sort();
            const key = `${user1}_${user2}`;
            if (pairKeys.has(key)) continue;
            pairKeys.add(key);

            ops.push({
                updateOne: {
                    filter: { user1, user2 },
                    update: {
                        $setOnInsert: {
                            user1: new Types.ObjectId(user1),
                            user2: new Types.ObjectId(user2),
                        },
                    },
                    upsert: true,
                },
            });
        }
    }

    if (ops.length === 0) {
        console.log('No friendship pairs to migrate.');
    } else {
        const bulkResult = await Friendship.bulkWrite(ops, { ordered: false });
        console.log(
            `Inserted friendships: ${bulkResult.upsertedCount}, matched existing: ${bulkResult.matchedCount}`
        );
    }

    // Remove friends field from all users
    const unsetResult = await User.updateMany(
        { friends: { $exists: true } },
        { $unset: { friends: 1 } }
    );
    console.log(`Users updated (unset friends): ${unsetResult.modifiedCount}`);

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
