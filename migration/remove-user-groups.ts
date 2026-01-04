import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/user.model';

dotenv.config();

async function main() {
    const mongoUri =
        process.env.MONGODB_URI || 'mongodb://localhost:27017/handbook';

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Remove groups field from users (raw collection to bypass schema strictness)
    const result = await User.collection.updateMany(
        { groups: { $exists: true } },
        { $unset: { groups: 1 } }
    );
    console.log(`🗑️ Removed groups from ${result.modifiedCount} users`);

    const remaining = await User.collection.countDocuments({
        groups: { $exists: true },
    });
    console.log(`📊 Remaining users with groups: ${remaining}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected');
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
